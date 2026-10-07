import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { CollegeClass, DetectedFace, ScannerSettings, ScanTrackingMode, ClassroomRoomPreset } from '../../types';
import {
  Camera, CameraOff, ZoomIn, ZoomOut, Sparkles, CheckCircle2,
  Sliders, Play, Pause, Scan,
  Volume2, VolumeX, Settings2, Video, FlipHorizontal, UserCheck,
  Monitor, Compass, Layers
} from 'lucide-react';
import {
  loadFaceApiModels,
  calculateTargetPan,
  analyzeVideoFrame,
  generateSimulatedClassroomFaces,
  CLASSROOM_PRESETS,
  getRowTier,
} from '../../utils/faceRecognitionEngine';
import {
  lerpZoom,
  smoothDampPan,
  soundEffects,
} from '../../utils/cameraZoomController';
import confetti from 'canvas-confetti';

interface FaceAttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetClass: CollegeClass | null;
}

type ModeType = 'LIVE_WEBCAM' | 'CLASSROOM_SIM';

export const FaceAttendanceScannerModal: React.FC<FaceAttendanceScannerModalProps> = ({
  isOpen,
  onClose,
  targetClass,
}) => {
  const {
    students,
    subjects,
    activeSession,
    startAttendanceSession,
    records,
    markAttendanceViaFace,
    registerStudentFace,
    manualUpdateAttendance,
  } = useAttendance();

  // Video & Canvas elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [targetZoom, setTargetZoom] = useState<number>(1.0);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [targetPan, setTargetPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera & Device states
  const [activeMode, setActiveMode] = useState<ModeType>('LIVE_WEBCAM');
  const [trackingMode, setTrackingMode] = useState<ScanTrackingMode>('AUTO_PATROL');
  const [roomPreset, setRoomPreset] = useState<ClassroomRoomPreset>('STANDARD');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isCameraStarting, setIsCameraStarting] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [neuralModelsReady, setNeuralModelsReady] = useState<boolean>(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [lockProgress, setLockProgress] = useState<number>(0);
  const [recentMarks, setRecentMarks] = useState<Array<{
    name: string;
    roll: string;
    avatar?: string;
    time: string;
    confidence: number;
    distance: number;
    zoom: number;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Initializing optical vision...');

  // Classroom & Sensor Calibration Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<ScannerSettings>({
    confidenceThreshold: 0.82,
    maxZoom: 4.0,
    zoomSpeed: 'BALANCED',
    showMesh: true,
    soundFeedback: true,
    classroomDepthFactor: 1.0,
    holdDurationMs: 400,
  });

  // Enrolled students for this class - MEMOIZED
  const activeSubject = useMemo(
    () => (targetClass ? subjects.find((s) => s.id === targetClass.subject_id) : null),
    [targetClass, subjects]
  );

  const enrolledStudents = useMemo(() => {
    if (!targetClass) return [];
    return students.filter(
      (s) => s.semester === targetClass.semester && s.division === targetClass.division
    );
  }, [students, targetClass]);

  const currentClassRecords = useMemo(() => {
    if (!targetClass) return [];
    return records.filter(
      (r) => targetClass && r.class_id === targetClass.id && (activeSession ? r.session_id === activeSession.id : true)
    );
  }, [records, targetClass, activeSession]);

  const presentStudentIds = useMemo(() => {
    return new Set(
      currentClassRecords
        .filter((r) => r.status === 'PRESENT' || r.status === 'LATE')
        .map((r) => r.student_id)
    );
  }, [currentClassRecords]);

  const presentCount = useMemo(() => {
    return enrolledStudents.filter((s) => presentStudentIds.has(s.id)).length;
  }, [enrolledStudents, presentStudentIds]);

  const attendancePercentage = enrolledStudents.length > 0
    ? Math.round((presentCount / enrolledStudents.length) * 100)
    : 0;

  // Enumerate cameras
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const vInputs = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(vInputs);
        if (vInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(vInputs[0].deviceId);
        }
      }).catch(console.warn);
    }
  }, [selectedDeviceId]);

  // Load neural models on modal open
  useEffect(() => {
    if (isOpen) {
      loadFaceApiModels()
        .then((ok) => setNeuralModelsReady(ok))
        .catch(console.warn);
    }
  }, [isOpen]);

  // Start Camera Stream
  const startCamera = useCallback(async (deviceId?: string) => {
    setIsCameraStarting(true);
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // Play request might be queued
        }
      }

      setCameraActive(true);
      setCameraError(null);
    } catch (err: any) {
      console.warn('Physical camera error:', err);
      setCameraError(err.message || 'Camera permission denied or camera unavailable.');
      setCameraActive(false);
    } finally {
      setIsCameraStarting(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsCameraStarting(false);
  }, []);

  // Ensure stream stays bound to video tag once mounted
  useEffect(() => {
    if (isOpen && activeMode === 'LIVE_WEBCAM' && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [isOpen, activeMode, cameraActive]);

  // Ensure active session exists
  useEffect(() => {
    if (isOpen && targetClass) {
      if (!activeSession || activeSession.class_id !== targetClass.id) {
        startAttendanceSession(targetClass.id, 'AI Face Recognition Lecture');
      }
    }
  }, [isOpen, targetClass, activeSession, startAttendanceSession]);

  // Auto-start camera when modal opens in LIVE_WEBCAM mode
  useEffect(() => {
    if (isOpen) {
      if (activeMode === 'LIVE_WEBCAM') {
        startCamera(selectedDeviceId);
      } else {
        stopCamera();
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, selectedDeviceId, startCamera, stopCamera]);

  // Update room preset parameters
  const handleRoomPresetChange = (preset: ClassroomRoomPreset) => {
    setRoomPreset(preset);
    if (preset !== 'CUSTOM' && CLASSROOM_PRESETS[preset]) {
      const cfg = CLASSROOM_PRESETS[preset];
      setSettings((prev) => ({
        ...prev,
        classroomDepthFactor: cfg.depthFactor,
        maxZoom: cfg.maxZoom,
      }));
    }
  };

  // Zoom and Pan EMA animation loop (smooth jitter-free camera interpolation)
  const zoomLerpSpeed = settings.zoomSpeed === 'SMOOTH' ? 0.08 : settings.zoomSpeed === 'RAPID' ? 0.22 : 0.13;
  const panDampFactor = settings.zoomSpeed === 'SMOOTH' ? 0.09 : settings.zoomSpeed === 'RAPID' ? 0.24 : 0.15;

  useEffect(() => {
    let animId: number;
    const updateInterpolation = () => {
      setZoomLevel((prev) => lerpZoom(prev, targetZoom, zoomLerpSpeed));
      setPanPosition((prev) => smoothDampPan(prev, targetPan, panDampFactor));
      animId = requestAnimationFrame(updateInterpolation);
    };
    animId = requestAnimationFrame(updateInterpolation);
    return () => cancelAnimationFrame(animId);
  }, [targetZoom, targetPan, zoomLerpSpeed, panDampFactor]);

  // Auto-mark attendance callback
  const handleAutoMark = useCallback((studentId: string, confidence: number, distance: number, currentZoomVal: number) => {
    if (!targetClass) return;
    const res = markAttendanceViaFace(targetClass.id, studentId, confidence, activeSession?.id);
    if (res.success && !res.alreadyMarked) {
      if (settings.soundFeedback) soundEffects.playSuccessChime();
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.65, x: 0.45 },
        colors: ['#10b981', '#38bdf8', '#6366f1'],
      });

      const stu = enrolledStudents.find((s) => s.id === studentId);
      if (stu) {
        setRecentMarks((prev) => [
          {
            name: stu.name,
            roll: stu.roll_number,
            avatar: stu.avatar,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            confidence: Math.round(confidence * 100),
            distance,
            zoom: currentZoomVal,
          },
          ...prev.slice(0, 7),
        ]);
        setStatusMessage(`Verified: ${stu.name} (${stu.roll_number}) marked PRESENT at ${distance}m!`);
      }
    }
  }, [targetClass, markAttendanceViaFace, activeSession, settings.soundFeedback, enrolledStudents]);

  // Main Vision & Automated Patrol Sweep Processing Loop
  useEffect(() => {
    if (!isOpen || !targetClass) return;

    let timeoutId: any;
    let localLock = 0;

    const processFrame = async () => {
      if (!isScanning) {
        timeoutId = setTimeout(processFrame, 350);
        return;
      }

      let faces: DetectedFace[] = [];

      // 1. In Simulation Mode, load the simulated classroom crowd
      if (activeMode === 'CLASSROOM_SIM') {
        faces = generateSimulatedClassroomFaces(
          enrolledStudents,
          settings.classroomDepthFactor,
          settings.maxZoom
        );
      } else if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        // 2. In Live Webcam mode, process the live hardware feed
        faces = await analyzeVideoFrame(
          videoRef.current,
          canvasRef.current,
          enrolledStudents,
          settings.classroomDepthFactor,
          settings.maxZoom,
          settings.confidenceThreshold
        );
      }

      // Update face state with row tiers
      setDetectedFaces(faces);

      if (faces.length === 0) {
        if (trackingMode !== 'MANUAL') {
          setTargetZoom(1.0);
          setTargetPan({ x: 0, y: 0 });
          setActiveTargetId(null);
          setLockProgress(0);
          setStatusMessage('Scanning classroom... No faces currently detected.');
        }
        timeoutId = setTimeout(processFrame, 220);
        return;
      }

      // ── TRACKING MODE: AUTO PATROL (Systematic Classroom Sweep) ──
      if (trackingMode === 'AUTO_PATROL') {
        // Find unmarked students currently visible in frame
        const unmarkedCandidates = faces.filter(
          (f) => f.student_id && !presentStudentIds.has(f.student_id)
        );

        if (unmarkedCandidates.length > 0) {
          // Select candidate to lock on (prioritize currently locked, else first unmarked)
          const target = unmarkedCandidates.find((f) => f.id === activeTargetId) || unmarkedCandidates[0];
          setActiveTargetId(target.id);

          // Zoom in smoothly based on target distance
          setTargetZoom(target.recommended_zoom);

          // Center target face in frame with pan
          const pan = calculateTargetPan(target.bounding_box, target.recommended_zoom, isMirrored);
          setTargetPan(pan);

          // Advance lock-on ring
          localLock = Math.min(100, (target.lock_progress || lockProgress) + 34);
          setLockProgress(localLock);

          if (settings.soundFeedback && localLock % 60 === 0) {
            soundEffects.playLockTick();
          }

          const tier = target.row_tier || getRowTier(target.distance_meters);
          setStatusMessage(
            `Patrol: Locking onto ${target.student_name} · ${tier} ROW (${target.distance_meters}m, Zoom ${target.recommended_zoom}x)...`
          );

          if (localLock >= 100 && target.student_id) {
            handleAutoMark(target.student_id, target.confidence, target.distance_meters, target.recommended_zoom);
            if (settings.soundFeedback) soundEffects.playPatrolSweep();
            localLock = 0;
            setLockProgress(0);
            setActiveTargetId(null);
          }
        } else {
          // All visible students are already marked present! Pull back to wide classroom overview
          setTargetZoom(1.0);
          setTargetPan({ x: 0, y: 0 });
          setActiveTargetId(null);
          setLockProgress(0);
          setStatusMessage('All visible students in view verified! Maintaining wide overview.');
        }
      } else if (trackingMode === 'SMART_FOCUS') {
        // SMART FOCUS: Zooms into the primary face in view
        const primary = faces[0];
        setActiveTargetId(primary.id);
        setTargetZoom(primary.recommended_zoom);
        const pan = calculateTargetPan(primary.bounding_box, primary.recommended_zoom, isMirrored);
        setTargetPan(pan);

        if (primary.student_id && primary.confidence >= settings.confidenceThreshold) {
          localLock = Math.min(100, lockProgress + 40);
          setLockProgress(localLock);
          if (localLock >= 100) {
            handleAutoMark(primary.student_id, primary.confidence, primary.distance_meters, primary.recommended_zoom);
            localLock = 0;
            setLockProgress(0);
          }
        }
        setStatusMessage(`Smart Focus: Tracking at ${primary.distance_meters}m (Zoom: ${primary.recommended_zoom}x)`);
      } else {
        // MANUAL MODE: Keep manual zoom and pan settings
        setLockProgress(0);
        setStatusMessage('Manual Optical Mode active.');
      }

      timeoutId = setTimeout(processFrame, 180);
    };

    timeoutId = setTimeout(processFrame, 260);
    return () => clearTimeout(timeoutId);
  }, [
    isOpen,
    targetClass,
    isScanning,
    activeMode,
    trackingMode,
    isMirrored,
    enrolledStudents,
    presentStudentIds,
    settings,
    activeTargetId,
    lockProgress,
    handleAutoMark,
  ]);

  const handleQuickEnrollLiveFace = (face: DetectedFace, studentId: string) => {
    if (!face.raw_descriptor || !studentId) return;
    let snapshotUrl = '';
    if (videoRef.current) {
      try {
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 320;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 320, 320);
          snapshotUrl = c.toDataURL('image/jpeg', 0.85);
        }
      } catch (e) {
        console.warn(e);
      }
    }
    registerStudentFace(studentId, snapshotUrl, face.raw_descriptor);
    if (settings.soundFeedback) soundEffects.playSuccessChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65, x: 0.5 },
      colors: ['#38bdf8', '#10b981', '#6366f1'],
    });
    setStatusMessage('Face biometric profile successfully linked and registered!');
  };

  const handleManualZoomChange = (newZoom: number) => {
    setTrackingMode('MANUAL');
    setTargetZoom(newZoom);
  };

  const handlePresetDistanceClick = (presetZoom: number, label: string) => {
    setTrackingMode('MANUAL');
    setTargetZoom(presetZoom);
    setStatusMessage(`Manual focus set to ${label} (${presetZoom}x).`);
  };

  if (!isOpen || !targetClass) return null;

  const filteredRoster = enrolledStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', zIndex: 1200 }} onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: 1240,
          width: '98%',
          height: '94vh',
          maxHeight: 820,
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#070b14',
          color: '#f8fafc',
          borderRadius: '18px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 50px rgba(56, 189, 248, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HUD Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1.25rem',
            background: 'linear-gradient(90deg, #090e1c 0%, #0d1527 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {/* Left: Branding & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(37, 99, 235, 0.5)',
              }}
            >
              <Scan size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1.0625rem', letterSpacing: '-0.01em', color: '#ffffff' }}>
                  AI Facial Recognition Attendance
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: activeMode === 'CLASSROOM_SIM' ? 'rgba(99, 102, 241, 0.2)' : cameraActive ? 'rgba(16, 185, 129, 0.18)' : 'rgba(59, 130, 246, 0.15)',
                    color: activeMode === 'CLASSROOM_SIM' ? '#a5b4fc' : cameraActive ? '#34d399' : '#38bdf8',
                    border: `1px solid ${activeMode === 'CLASSROOM_SIM' ? 'rgba(99, 102, 241, 0.4)' : cameraActive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <span
                    className="pulse-indicator"
                    style={{
                      width: 6,
                      height: 6,
                      background: activeMode === 'CLASSROOM_SIM' ? '#818cf8' : cameraActive ? '#10b981' : '#3b82f6',
                    }}
                  />
                  {activeMode === 'CLASSROOM_SIM'
                    ? 'Crowd Simulator Active'
                    : cameraActive
                    ? neuralModelsReady
                      ? 'Hardware Optical Feed'
                      : 'Initializing AI Models…'
                    : 'Camera Standby'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 1 }}>
                {activeSubject?.name} · Sem {targetClass.semester} Div {targetClass.division} · Room {targetClass.room}
              </div>
            </div>
          </div>

          {/* Center: Feed Mode Selector & Tracking Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Feed Mode Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: 2,
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <button
                className="btn btn-xs"
                style={{
                  background: activeMode === 'LIVE_WEBCAM' ? '#2563eb' : 'transparent',
                  color: activeMode === 'LIVE_WEBCAM' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                onClick={() => setActiveMode('LIVE_WEBCAM')}
              >
                <Camera size={13} /> Live Camera
              </button>
              <button
                className="btn btn-xs"
                style={{
                  background: activeMode === 'CLASSROOM_SIM' ? '#4f46e5' : 'transparent',
                  color: activeMode === 'CLASSROOM_SIM' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                onClick={() => setActiveMode('CLASSROOM_SIM')}
              >
                <Monitor size={13} /> Classroom Simulator
              </button>
            </div>

            {/* Tracking Mode Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: 2,
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <button
                className="btn btn-xs"
                style={{
                  background: trackingMode === 'AUTO_PATROL' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                  color: trackingMode === 'AUTO_PATROL' ? '#34d399' : '#94a3b8',
                  border: trackingMode === 'AUTO_PATROL' ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                onClick={() => setTrackingMode('AUTO_PATROL')}
                title="Classroom Patrol: Sweeps through rows, zooms in on students, and auto-marks attendance"
              >
                <Compass size={13} /> Auto Patrol Sweep
              </button>
              <button
                className="btn btn-xs"
                style={{
                  background: trackingMode === 'SMART_FOCUS' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: trackingMode === 'SMART_FOCUS' ? '#38bdf8' : '#94a3b8',
                  border: trackingMode === 'SMART_FOCUS' ? '1px solid rgba(56, 189, 248, 0.4)' : 'none',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                onClick={() => setTrackingMode('SMART_FOCUS')}
                title="Smart Focus: Dynamically tracks closest/centered student"
              >
                <Sparkles size={13} /> Smart Focus
              </button>
              <button
                className="btn btn-xs"
                style={{
                  background: trackingMode === 'MANUAL' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                  color: trackingMode === 'MANUAL' ? '#fbbf24' : '#94a3b8',
                  border: trackingMode === 'MANUAL' ? '1px solid rgba(245, 158, 11, 0.4)' : 'none',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                onClick={() => setTrackingMode('MANUAL')}
              >
                <Sliders size={13} /> Manual
              </button>
            </div>
          </div>

          {/* Right: Calibration, Audio, Pause, Exit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Room Preset Selector */}
            <select
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
              }}
              value={roomPreset}
              onChange={(e) => handleRoomPresetChange(e.target.value as ClassroomRoomPreset)}
            >
              <option value="SEMINAR">Seminar Room (1.5-4.5m)</option>
              <option value="STANDARD">Standard Class (2.5-8m)</option>
              <option value="LECTURE_HALL">Lecture Hall (5-14m)</option>
            </select>

            {/* Multi-Camera Device Selector */}
            {videoDevices.length > 1 && activeMode === 'LIVE_WEBCAM' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Video size={14} color="#38bdf8" />
                <select
                  style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    maxWidth: 150,
                  }}
                  value={selectedDeviceId}
                  onChange={(e) => {
                    setSelectedDeviceId(e.target.value);
                    startCamera(e.target.value);
                  }}
                >
                  {videoDevices.map((dev, idx) => (
                    <option key={dev.deviceId || idx} value={dev.deviceId}>
                      {dev.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mirror / Flip Camera */}
            {activeMode === 'LIVE_WEBCAM' && (
              <button
                className="btn btn-ghost btn-sm"
                style={{
                  color: isMirrored ? '#38bdf8' : '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onClick={() => setIsMirrored(!isMirrored)}
                title="Mirror Camera Horizontal"
              >
                <FlipHorizontal size={15} />
              </button>
            )}

            {/* Calibration & Sensitivity Settings */}
            <button
              className="btn btn-ghost btn-sm"
              style={{
                color: isSettingsOpen ? '#38bdf8' : '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: isSettingsOpen ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              }}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="Classroom Calibration Drawer"
            >
              <Settings2 size={16} />
            </button>

            {/* Audio Toggle */}
            <button
              className="btn btn-ghost btn-sm"
              style={{
                color: settings.soundFeedback ? '#38bdf8' : '#64748b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onClick={() => setSettings((s) => ({ ...s, soundFeedback: !s.soundFeedback }))}
              title={settings.soundFeedback ? 'Mute Telemetry Chime' : 'Enable Telemetry Chime'}
            >
              {settings.soundFeedback ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Pause/Resume Scanner */}
            <button
              className="btn btn-ghost btn-sm"
              style={{
                color: isScanning ? '#10b981' : '#f59e0b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onClick={() => setIsScanning(!isScanning)}
            >
              {isScanning ? <Pause size={15} /> : <Play size={15} />}
              <span style={{ fontSize: '0.75rem', marginLeft: 4 }}>{isScanning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.15)' }}
              onClick={onClose}
            >
              Done & Save
            </button>
          </div>
        </div>

        {/* Calibration Settings Drawer */}
        {isSettingsOpen && (
          <div
            style={{
              padding: '0.875rem 1.25rem',
              background: '#0a101f',
              borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              fontSize: '0.75rem',
            }}
          >
            <div>
              <div style={{ color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>
                Confidence Threshold ({Math.round(settings.confidenceThreshold * 100)}%)
              </div>
              <input
                type="range"
                min="0.70"
                max="0.95"
                step="0.01"
                value={settings.confidenceThreshold}
                onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            <div>
              <div style={{ color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>
                Optical Zoom Limit ({settings.maxZoom.toFixed(1)}x)
              </div>
              <input
                type="range"
                min="2.0"
                max="5.0"
                step="0.2"
                value={settings.maxZoom}
                onChange={(e) => setSettings({ ...settings, maxZoom: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            <div>
              <div style={{ color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>
                Classroom Depth Factor ({settings.classroomDepthFactor.toFixed(2)}x)
              </div>
              <input
                type="range"
                min="0.7"
                max="1.6"
                step="0.05"
                value={settings.classroomDepthFactor}
                onChange={(e) => setSettings({ ...settings, classroomDepthFactor: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f8fafc', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.showMesh}
                  onChange={(e) => setSettings({ ...settings, showMesh: e.target.checked })}
                  style={{ accentColor: '#10b981' }}
                />
                Show 3D Landmarks Constellation
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#94a3b8' }}>Damping:</span>
                {(['SMOOTH', 'BALANCED', 'RAPID'] as const).map((spd) => (
                  <button
                    key={spd}
                    className="btn btn-xs"
                    style={{
                      fontSize: '0.6875rem',
                      padding: '2px 6px',
                      background: settings.zoomSpeed === spd ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                    }}
                    onClick={() => setSettings({ ...settings, zoomSpeed: spd })}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Body: Viewfinder Left + Roster Right */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Viewfinder & Camera Deck */}
          <div
            style={{
              flex: '1 1 64%',
              display: 'flex',
              flexDirection: 'column',
              background: '#040711',
              position: 'relative',
              overflow: 'hidden',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Viewfinder Screen */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
              }}
            >
              {/* Actual Video Feed (LIVE WEBCAM) */}
              {activeMode === 'LIVE_WEBCAM' ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transform: `scale(${zoomLevel}) translate(${-panPosition.x}%, ${-panPosition.y}%) ${isMirrored ? 'scaleX(-1)' : ''}`,
                      transition: 'transform 0.16s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                  />

                  {/* Camera Loading or Inactive Prompt */}
                  {!cameraActive && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#060a14',
                        padding: '2rem',
                        textAlign: 'center',
                        zIndex: 20,
                      }}
                    >
                      {isCameraStarting ? (
                        <>
                          <div className="pulse-indicator" style={{ width: 44, height: 44, marginBottom: '1rem' }} />
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                            Connecting Hardware Optical Feed…
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: 4 }}>
                            Requesting camera permission. Allow access in your browser.
                          </p>
                        </>
                      ) : cameraError ? (
                        <>
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: '50%',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '1rem',
                            }}
                          >
                            <CameraOff size={28} />
                          </div>
                          <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
                            Camera Stream Unavailable
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', maxWidth: 420, marginBottom: '1.25rem' }}>
                            {cameraError}
                          </p>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                              className="btn btn-primary"
                              onClick={() => startCamera(selectedDeviceId)}
                            >
                              <Camera size={15} /> Retry Camera
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => setActiveMode('CLASSROOM_SIM')}
                            >
                              <Monitor size={15} /> Switch to Classroom Simulator
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: '#38bdf8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '1rem',
                            }}
                          >
                            <Camera size={30} />
                          </div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
                            Classroom Optical Scanner Ready
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', maxWidth: 380, marginBottom: '1.25rem' }}>
                            Click below to grant camera access and start distance-adaptive attendance recognition.
                          </p>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                              className="btn btn-primary"
                              onClick={() => startCamera(selectedDeviceId)}
                            >
                              <Camera size={15} /> Start Live Camera
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => setActiveMode('CLASSROOM_SIM')}
                            >
                              <Monitor size={15} /> Use Crowd Simulator
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* CLASSROOM SIMULATOR VIEW (Virtual Multi-Row Amphitheatre) */
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: `scale(${zoomLevel}) translate(${-panPosition.x}%, ${-panPosition.y}%)`,
                    transition: 'transform 0.16s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    background: 'radial-gradient(ellipse at 50% 30%, #1e293b 0%, #090e1a 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Classroom Architecture Backdrop (Rows & Desks) */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                  {/* Row Benches / Desks Visual Markers */}
                  <div style={{ position: 'absolute', top: '15%', left: '10%', right: '10%', height: 2, background: 'rgba(255, 255, 255, 0.15)', borderBottom: '1px dashed rgba(56, 189, 248, 0.3)' }}>
                    <span style={{ position: 'absolute', right: 0, top: -18, fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Row 3 · Back Tier (7.2m)</span>
                  </div>
                  <div style={{ position: 'absolute', top: '35%', left: '8%', right: '8%', height: 2, background: 'rgba(255, 255, 255, 0.2)', borderBottom: '1px dashed rgba(56, 189, 248, 0.3)' }}>
                    <span style={{ position: 'absolute', right: 0, top: -18, fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Row 2 · Middle Tier (4.2m)</span>
                  </div>
                  <div style={{ position: 'absolute', top: '65%', left: '5%', right: '5%', height: 2, background: 'rgba(255, 255, 255, 0.25)', borderBottom: '1px dashed rgba(56, 189, 248, 0.4)' }}>
                    <span style={{ position: 'absolute', right: 0, top: -18, fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Row 1 · Front Tier (1.8m)</span>
                  </div>

                  {/* Simulated Student Avatars in the Amphitheatre */}
                  {detectedFaces.map((face) => {
                    const stu = enrolledStudents.find((s) => s.id === face.student_id);
                    const isPresent = face.student_id && presentStudentIds.has(face.student_id);

                    return (
                      <div
                        key={`sim-seat-${face.id}`}
                        style={{
                          position: 'absolute',
                          left: `${face.bounding_box.x}%`,
                          top: `${face.bounding_box.y}%`,
                          width: `${face.bounding_box.width}%`,
                          height: `${face.bounding_box.height}%`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `2px solid ${isPresent ? '#10b981' : '#38bdf8'}`,
                            boxShadow: `0 0 15px ${isPresent ? 'rgba(16, 185, 129, 0.5)' : 'rgba(56, 189, 248, 0.4)'}`,
                            position: 'relative',
                            background: '#1e293b',
                          }}
                        >
                          <img
                            src={stu?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={face.student_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Hidden Canvas for Frame Processing */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* High-Tech HUD Viewfinder Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  border: '1px solid rgba(56, 189, 248, 0.18)',
                }}
              >
                {/* 3D Landmarks Mesh Constellation */}
                {settings.showMesh &&
                  detectedFaces.flatMap((f) => f.landmarks || []).map((pt, i) => {
                    const ptX = isMirrored && activeMode === 'LIVE_WEBCAM' ? 100 - pt.x : pt.x;
                    return (
                      <div
                        key={`pt-${i}`}
                        style={{
                          position: 'absolute',
                          left: `${ptX}%`,
                          top: `${pt.y}%`,
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: '#38bdf8',
                          boxShadow: '0 0 6px #38bdf8',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    );
                  })}

                {/* Viewfinder Reticle Target Box for Detected Faces */}
                {detectedFaces.map((face) => {
                  const boxX = isMirrored && activeMode === 'LIVE_WEBCAM'
                    ? Math.max(0, 100 - face.bounding_box.x - face.bounding_box.width)
                    : face.bounding_box.x;

                  const isMarked = face.student_id ? presentStudentIds.has(face.student_id) : false;
                  const isCurrentTarget = face.id === activeTargetId;

                  const themeColor = isMarked
                    ? '#10b981'
                    : isCurrentTarget
                    ? '#38bdf8'
                    : '#f59e0b';

                  const themeGlow = isMarked
                    ? 'rgba(16, 185, 129, 0.5)'
                    : isCurrentTarget
                    ? 'rgba(56, 189, 248, 0.55)'
                    : 'rgba(245, 158, 11, 0.35)';

                  const tier = face.row_tier || getRowTier(face.distance_meters);

                  return (
                    <div
                      key={face.id}
                      style={{
                        position: 'absolute',
                        left: `${boxX}%`,
                        top: `${face.bounding_box.y}%`,
                        width: `${face.bounding_box.width}%`,
                        height: `${face.bounding_box.height}%`,
                        border: `2px solid ${themeColor}`,
                        borderRadius: '8px',
                        boxShadow: `0 0 20px ${themeGlow}`,
                        transition: 'all 0.14s ease-out',
                        pointerEvents: 'auto',
                      }}
                    >
                      {/* Corner Target Brackets */}
                      <div style={{ position: 'absolute', top: -3, left: -3, width: 10, height: 10, borderTop: `3px solid ${themeColor}`, borderLeft: `3px solid ${themeColor}` }} />
                      <div style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderTop: `3px solid ${themeColor}`, borderRight: `3px solid ${themeColor}` }} />
                      <div style={{ position: 'absolute', bottom: -3, left: -3, width: 10, height: 10, borderBottom: `3px solid ${themeColor}`, borderLeft: `3px solid ${themeColor}` }} />
                      <div style={{ position: 'absolute', bottom: -3, right: -3, width: 10, height: 10, borderBottom: `3px solid ${themeColor}`, borderRight: `3px solid ${themeColor}` }} />

                      {/* RADIAL TEMPORAL LOCK-ON RING (Displayed when actively locking on) */}
                      {isCurrentTarget && !isMarked && lockProgress > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: -14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                          }}
                        >
                          <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                            <circle
                              cx="50"
                              cy="50"
                              r="44"
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.15)"
                              strokeWidth="4"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="44"
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="4"
                              strokeDasharray="276"
                              strokeDashoffset={`${276 - (276 * lockProgress) / 100}`}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 0.15s linear' }}
                            />
                          </svg>
                          <div
                            style={{
                              position: 'absolute',
                              fontSize: '0.625rem',
                              fontWeight: 800,
                              color: '#38bdf8',
                              textShadow: '0 0 6px rgba(0,0,0,0.8)',
                            }}
                          >
                            {lockProgress}%
                          </div>
                        </div>
                      )}

                      {/* Top HUD Tag (Student Name & Status) */}
                      <div
                        style={{
                          position: 'absolute',
                          top: -32,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(11, 17, 32, 0.94)',
                          border: `1px solid ${isMarked ? 'rgba(16, 185, 129, 0.6)' : isCurrentTarget ? 'rgba(56, 189, 248, 0.6)' : 'rgba(245, 158, 11, 0.5)'}`,
                          backdropFilter: 'blur(6px)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          whiteSpace: 'nowrap',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#f8fafc',
                        }}
                      >
                        {isMarked ? (
                          <>
                            <CheckCircle2 size={13} color="#10b981" />
                            <span>{face.student_name}</span>
                            <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700 }}>PRESENT</span>
                          </>
                        ) : face.status === 'VERIFIED' ? (
                          <>
                            <Scan size={13} color={isCurrentTarget ? '#38bdf8' : '#f59e0b'} />
                            <span>{face.student_name} ({face.roll_number})</span>
                            <span style={{ fontSize: '0.65rem', color: '#38bdf8' }}>
                              {Math.round(face.confidence * 100)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <Scan size={13} color="#f59e0b" />
                            <span>Unenrolled Face</span>
                          </>
                        )}
                      </div>

                      {/* Bottom Distance & Row Telemetry Tag */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: -26,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(11, 17, 32, 0.94)',
                          border: '1px solid rgba(56, 189, 248, 0.35)',
                          backdropFilter: 'blur(6px)',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#7dd3fc',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span>{tier} ROW · {face.distance_meters}m</span>
                        <span style={{ color: '#94a3b8' }}>|</span>
                        <span>{face.recommended_zoom}x Zoom</span>
                      </div>
                    </div>
                  );
                })}

                {/* Radar Grid Overlay (Top Left Telemetry Deck) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: 'rgba(11, 17, 32, 0.85)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    minWidth: 200,
                  }}
                >
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Optical Telemetry</span>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>{roomPreset}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Zoom: {zoomLevel.toFixed(1)}x</span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: trackingMode === 'AUTO_PATROL' ? '#34d399' : trackingMode === 'SMART_FOCUS' ? '#38bdf8' : '#fbbf24',
                        fontWeight: 700,
                      }}
                    >
                      ({trackingMode})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Layers size={12} />
                    <span>Pan Offset: ({panPosition.x.toFixed(0)}%, {panPosition.y.toFixed(0)}%)</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 4, marginTop: 2 }}>
                    {statusMessage}
                  </div>
                </div>

                {/* Scanner Target Center Crosshair */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 34,
                    height: 34,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    opacity: detectedFaces.length > 0 ? 0.35 : 0.75,
                  }}
                >
                  <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 2, background: 'rgba(56, 189, 248, 0.7)' }} />
                  <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0, width: 2, background: 'rgba(56, 189, 248, 0.7)' }} />
                  <div style={{ width: '100%', height: '100%', border: '1px dashed rgba(56, 189, 248, 0.5)', borderRadius: '50%' }} />
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar: Classroom Distance Presets & Zoom Gauge */}
            <div
              style={{
                padding: '0.875rem 1.25rem',
                background: '#080d19',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {/* Row Distance Quick-Jump Buttons & Live Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Row Presets:</span>
                  <button
                    className="btn btn-xs"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#f8fafc',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '0.6875rem',
                    }}
                    onClick={() => handlePresetDistanceClick(1.0, 'Wide Classroom')}
                  >
                    Wide (1.0x)
                  </button>
                  <button
                    className="btn btn-xs"
                    style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      fontSize: '0.6875rem',
                    }}
                    onClick={() => handlePresetDistanceClick(1.5, 'Front Row ~2m')}
                  >
                    Front Row (1.5x)
                  </button>
                  <button
                    className="btn btn-xs"
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      fontSize: '0.6875rem',
                    }}
                    onClick={() => handlePresetDistanceClick(2.6, 'Middle Row ~4.5m')}
                  >
                    Mid Row (2.6x)
                  </button>
                  <button
                    className="btn btn-xs"
                    style={{
                      background: 'rgba(236, 72, 153, 0.15)',
                      color: '#f472b6',
                      border: '1px solid rgba(236, 72, 153, 0.3)',
                      fontSize: '0.6875rem',
                    }}
                    onClick={() => handlePresetDistanceClick(4.0, 'Back Row ~7.5m')}
                  >
                    Back Row (4.0x)
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                    {detectedFaces.length} Students in Optical Field
                  </span>
                </div>
              </div>

              {/* Quick Enroll Live Face Bar when an unenrolled face is detected in webcam */}
              {detectedFaces.some((f) => f.status === 'UNENROLLED') && activeMode === 'LIVE_WEBCAM' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.15), rgba(6, 182, 212, 0.15))',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e0f2fe', fontWeight: 600 }}>
                    <UserCheck size={16} color="#38bdf8" />
                    <span>Live Face Detected! Enroll & link to student to auto-mark:</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <select
                      value={selectedStudentToEnroll}
                      onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                      style={{
                        background: '#0f172a',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        padding: '4px 8px',
                      }}
                    >
                      <option value="">Select Student to Link…</option>
                      {enrolledStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.roll_number})
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary btn-xs"
                      disabled={!selectedStudentToEnroll}
                      onClick={() => {
                        const unenrolledFace = detectedFaces.find((f) => f.status === 'UNENROLLED');
                        if (unenrolledFace) {
                          handleQuickEnrollLiveFace(unenrolledFace, selectedStudentToEnroll);
                        }
                      }}
                    >
                      <CheckCircle2 size={13} style={{ marginRight: 3 }} /> Register Face Now
                    </button>
                  </div>
                </div>
              )}

              {/* Zoom Slider Gauge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ZoomOut size={16} color="#94a3b8" />
                <input
                  type="range"
                  min="1"
                  max={settings.maxZoom}
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => handleManualZoomChange(parseFloat(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#3b82f6',
                    cursor: 'pointer',
                  }}
                />
                <ZoomIn size={16} color="#94a3b8" />
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    color: '#38bdf8',
                    minWidth: 42,
                    textAlign: 'right',
                  }}
                >
                  {zoomLevel.toFixed(1)}x
                </span>
              </div>
            </div>
          </div>

          {/* Right: Real-Time Live Class Roster & Ticker */}
          <div
            style={{
              flex: '1 1 36%',
              display: 'flex',
              flexDirection: 'column',
              background: '#090e1c',
              overflow: 'hidden',
            }}
          >
            {/* Header Metrics Card */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Live Classroom Attendance
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
                    {presentCount} / {enrolledStudents.length} Present
                  </div>
                </div>
                <div
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '8px',
                    background: attendancePercentage >= 75 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: `1px solid ${attendancePercentage >= 75 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    color: attendancePercentage >= 75 ? '#34d399' : '#fbbf24',
                    fontWeight: 800,
                    fontSize: '1rem',
                  }}
                >
                  {attendancePercentage}%
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${attendancePercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              {/* Search filter */}
              <div style={{ marginTop: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Filter roster by roll no. or name..."
                  className="form-input form-input-sm"
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Live Ticker: Recently Verified Card */}
            {recentMarks.length > 0 && (
              <div
                style={{
                  padding: '0.625rem 1rem',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #10b981',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={recentMarks[0].avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={recentMarks[0].name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#34d399', fontWeight: 800 }}>Just Auto-Marked: </span>
                    <span style={{ color: '#f8fafc', fontWeight: 700 }}>{recentMarks[0].name}</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                    Roll {recentMarks[0].roll} · {recentMarks[0].distance}m · Zoom {recentMarks[0].zoom.toFixed(1)}x · {recentMarks[0].confidence}%
                  </div>
                </div>
              </div>
            )}

            {/* Enrolled Students Roster List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredRoster.map((stu) => {
                  const isPresent = presentStudentIds.has(stu.id);

                  return (
                    <div
                      key={stu.id}
                      style={{
                        padding: '0.625rem 0.875rem',
                        borderRadius: '10px',
                        background: isPresent ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isPresent ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `2px solid ${isPresent ? '#10b981' : 'rgba(255, 255, 255, 0.15)'}`,
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={stu.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={stu.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#f8fafc' }}>
                            {stu.name}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                            Roll: {stu.roll_number} · Div {stu.division}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isPresent ? (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              color: '#34d399',
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <CheckCircle2 size={12} /> Present
                          </span>
                        ) : (
                          <button
                            className="btn btn-ghost btn-xs"
                            style={{
                              fontSize: '0.6875rem',
                              color: '#94a3b8',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                            onClick={() => {
                              if (targetClass) {
                                manualUpdateAttendance(activeSession?.id || '', stu.id, targetClass.id, 'PRESENT');
                              }
                            }}
                          >
                            Mark Manual
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div
              style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 23, 42, 0.9)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Auto-mark active session synced
              </span>
              <button
                className="btn btn-secondary btn-xs"
                style={{ fontSize: '0.72rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                onClick={() => {
                  enrolledStudents.forEach((stu) => {
                    if (targetClass && !presentStudentIds.has(stu.id)) {
                      manualUpdateAttendance(activeSession?.id || '', stu.id, targetClass.id, 'PRESENT');
                    }
                  });
                }}
              >
                Mark All Present
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
