import React, { useState, useEffect, useRef } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import {
  Camera, CheckCircle2, AlertTriangle, X, ShieldAlert, Sparkles,
  RefreshCw, Video, VideoOff, Play, ShieldCheck, Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../../utils/cameraZoomController';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const {
    activeSession,
    classes,
    subjects,
    startAttendanceSession,
    markAttendanceViaQR,
    getActiveSessionQRPayload,
    currentStudent,
    getStudentStats,
  } = useAttendance();

  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; subject?: string } | null>(null);
  const [qrPayload, setQrPayload] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync token payload and rotation countdown
  useEffect(() => {
    if (!isOpen || !activeSession) {
      setQrPayload('');
      return;
    }

    setQrPayload(getActiveSessionQRPayload());

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((activeSession.expires_at - Date.now()) / 1000));
      setTimeLeft(remaining);
      setQrPayload(getActiveSessionQRPayload());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeSession, getActiveSessionQRPayload]);

  // Start/Stop camera stream
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setUseCamera(true);
    } catch {
      setCameraActive(false);
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScanResult(null);
    }
    return () => stopCamera();
  }, [isOpen]);

  if (!isOpen) return null;

  const targetClass = activeSession ? classes.find((c) => c.id === activeSession.class_id) : null;
  const targetSubject = targetClass ? subjects.find((s) => s.id === targetClass.subject_id) : null;
  const studentMetrics = currentStudent ? getStudentStats(currentStudent.id).overall : null;

  const handleScan = (payload: string) => {
    const res = markAttendanceViaQR(payload);
    setScanResult(res);
    if (res.success) {
      soundEffects.playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#16a34a', '#f59e0b', '#3b82f6'],
      });
    }
  };

  const handleStartDemoSession = () => {
    if (classes.length > 0) {
      startAttendanceSession(classes[0].id, 'Live QR Demonstration Lecture');
    }
  };

  const handleExpiredTest = () => {
    const fake = JSON.stringify({
      sessionId: activeSession?.id ?? 'sess-expired-demo',
      classId: activeSession?.class_id ?? (classes[0]?.id || 'cls-1'),
      token: 'AP-OLD-EXPIRED-TOKEN-001',
      generatedAt: Date.now() - 90_000,
      expiresAt: Date.now() - 60_000,
    });
    handleScan(fake);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 480, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--r-md)',
                background: 'var(--blue-50)',
                color: 'var(--blue-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--gray-900)' }}>
                Scan Attendance QR Code
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Anti-proxy encrypted dynamic QR scanner
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Scan Result State */}
        {scanResult ? (
          <div
            className={`alert ${scanResult.success ? 'alert-success' : 'alert-danger'}`}
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '1.75rem 1.25rem',
              marginBottom: '1rem',
              borderRadius: 'var(--r-lg)',
            }}
          >
            {scanResult.success ? (
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--green-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  color: 'var(--green-700)',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
            ) : (
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--red-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  color: 'var(--red-700)',
                }}
              >
                <AlertTriangle size={32} />
              </div>
            )}

            <div style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.375rem', color: scanResult.success ? 'var(--green-900)' : 'var(--red-900)' }}>
              {scanResult.success ? 'Attendance Verified & Recorded!' : 'Verification Failed'}
            </div>
            <p style={{ fontSize: '0.875rem', opacity: 0.95, lineHeight: 1.5, margin: 0 }}>
              {scanResult.message}
            </p>

            {scanResult.success && studentMetrics && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.625rem 1rem',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--green-200)',
                  width: '100%',
                  fontSize: '0.75rem',
                  color: 'var(--green-900)',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Current Overall Attendance:</span>
                <strong style={{ fontSize: '0.875rem' }}>{studentMetrics.percentage}%</strong>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem', justifyContent: 'center', width: '100%' }}>
              {scanResult.success ? (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
                  Done &amp; View Dashboard
                </button>
              ) : (
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setScanResult(null)}>
                  Try Scanning Again
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Viewfinder Window */}
            <div
              style={{
                height: 220,
                background: '#090d16',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--gray-700)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Optional Live Video Feed */}
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: cameraActive ? 'block' : 'none',
                }}
              />

              {/* Viewfinder HUD Target Reticle */}
              <div
                style={{
                  width: 150,
                  height: 150,
                  border: '2px solid rgba(59, 130, 246, 0.7)',
                  borderRadius: 'var(--r-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                  boxShadow: '0 0 25px rgba(37, 99, 235, 0.25)',
                }}
              >
                {/* 4 Corner Markers */}
                <span style={{ position: 'absolute', top: -3, left: -3, width: 14, height: 14, borderTop: '3px solid #3b82f6', borderLeft: '3px solid #3b82f6' }} />
                <span style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderTop: '3px solid #3b82f6', borderRight: '3px solid #3b82f6' }} />
                <span style={{ position: 'absolute', bottom: -3, left: -3, width: 14, height: 14, borderBottom: '3px solid #3b82f6', borderLeft: '3px solid #3b82f6' }} />
                <span style={{ position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderBottom: '3px solid #3b82f6', borderRight: '3px solid #3b82f6' }} />

                {/* Animated Laser Scan Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 2,
                    right: 2,
                    height: 2,
                    background: '#38bdf8',
                    boxShadow: '0 0 8px #38bdf8',
                    animation: 'scanLaser 2.2s ease-in-out infinite alternate',
                  }}
                />

                {!cameraActive && (
                  <Camera size={36} color="rgba(255,255,255,0.4)" />
                )}
              </div>

              {/* Viewfinder Footer status */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 12,
                  right: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 3,
                }}
              >
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: '#93c5fd',
                    background: 'rgba(15, 23, 42, 0.75)',
                    padding: '2px 8px',
                    borderRadius: 'var(--r-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span className="pulse-indicator" style={{ width: 6, height: 6 }} />
                  {cameraActive ? 'Live Camera Feed' : 'Optical Viewfinder Ready'}
                </span>

                <button
                  type="button"
                  onClick={cameraActive ? stopCamera : startCamera}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    borderRadius: 'var(--r-xs)',
                    padding: '3px 8px',
                    fontSize: '0.6875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {cameraActive ? <VideoOff size={11} /> : <Video size={11} />}
                  {cameraActive ? 'Turn Off Cam' : 'Use Webcam'}
                </button>
              </div>

              <style>{`
                @keyframes scanLaser {
                  0% { top: 6%; opacity: 0.3; }
                  50% { opacity: 1; }
                  100% { top: 92%; opacity: 0.3; }
                }
              `}</style>
            </div>

            {/* Active Session Card */}
            {activeSession ? (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--blue-50)',
                  border: '1px solid var(--blue-200)',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="pulse-indicator" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue-700)', textTransform: 'uppercase' }}>
                      Ongoing Lecture Detected
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--blue-800)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Clock size={11} /> Refreshes in {timeLeft}s
                  </span>
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--gray-900)' }}>
                    {targetSubject?.name || 'Class Lecture'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: 2 }}>
                    Room {targetClass?.room} · Division {targetClass?.division} · Semester {targetClass?.semester}
                  </div>
                  {activeSession.topic && (
                    <div style={{ fontSize: '0.6875rem', color: 'var(--blue-800)', marginTop: 4 }}>
                      Topic: <strong>{activeSession.topic}</strong>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={() => handleScan(qrPayload)}
                >
                  <Sparkles size={14} />
                  Scan &amp; Mark My Attendance Now
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--amber-50)',
                  border: '1px solid var(--amber-200)',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amber-800)' }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    No lecture attendance session is currently open.
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--amber-900)', margin: 0, lineHeight: 1.4 }}>
                  Faculty opens rolling QR codes during class. You can also start a demo lecture session right now to test the scanner!
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', borderColor: 'var(--amber-300)', background: 'var(--white)', color: 'var(--amber-900)' }}
                  onClick={handleStartDemoSession}
                >
                  <Play size={12} /> Launch Instant Demo Lecture Session
                </button>
              </div>
            )}

            {/* Anti-Proxy Security Testing */}
            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Institutional Security Engine
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--green-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <ShieldCheck size={11} /> 30s Replay Protection
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', fontSize: '0.75rem', color: 'var(--gray-600)', padding: '0.35rem 0.5rem', border: '1px dashed var(--gray-300)' }}
                onClick={handleExpiredTest}
              >
                Test Expired QR Token Rejection (Anti-Proxy Simulation)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
