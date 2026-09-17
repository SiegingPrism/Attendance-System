import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { QRCodeSVG } from 'qrcode.react';
import { X, Clock, RefreshCw, Power, QrCode, CheckCircle2, Users } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ActiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (classId: string, topic?: string) => void;
}

export const ActiveSessionModal: React.FC<ActiveSessionModalProps> = ({ isOpen, onClose, onStart }) => {
  const {
    activeSession, classes, subjects, students, records,
    rotateSessionToken, closeAttendanceSession, manualUpdateAttendance,
    getActiveSessionQRPayload, currentFaculty,
  } = useAttendance();

  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (!isOpen || !activeSession) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((activeSession.expires_at - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) rotateSessionToken(activeSession.id);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeSession, rotateSessionToken]);

  if (!isOpen) return null;

  const currentClass = activeSession ? classes.find((c) => c.id === activeSession.class_id) : null;
  const currentSubject = currentClass ? subjects.find((s) => s.id === currentClass.subject_id) : null;
  const enrolledStudents = currentClass
    ? students.filter((s) => s.semester === currentClass.semester && s.division === currentClass.division)
    : [];
  const sessionRecords = activeSession ? records.filter((r) => r.session_id === activeSession.id) : [];
  const presentIds = new Set(sessionRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').map((r) => r.student_id));
  const presentCount = presentIds.size;
  const total = enrolledStudents.length;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;
  const qrPayload = getActiveSessionQRPayload();

  const myClasses = currentFaculty ? classes.filter((c) => c.faculty_id === currentFaculty.id) : [];

  const handleClose = () => {
    if (window.confirm('Close this session? Students who have not scanned will be marked absent.')) {
      closeAttendanceSession(activeSession!.id);
      onClose();
    }
  };

  // --- No active session: class picker ---
  if (!activeSession) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-heading)' }}>Start QR Attendance Session</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Select a class to generate a rolling QR code</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="form-group">
            <label className="form-label">Select Class</label>
            <select className="form-select form-select-sm" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
              <option value="">Choose a class…</option>
              {myClasses.map((c) => {
                const s = subjects.find((sub) => sub.id === c.subject_id);
                return <option key={c.id} value={c.id}>{s?.name} — Sem {c.semester} Div {c.division} · {c.schedule_time}</option>;
              })}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Topic Covered Today (Optional)</label>
            <input
              type="text"
              className="form-input form-input-sm"
              placeholder="e.g. Graph Traversals (BFS & DFS Algorithms)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>
            <QrCode size={14} style={{ flexShrink: 0 }} />
            The QR token rotates every 30 seconds — students must scan the current token to mark attendance.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!selectedClassId} onClick={() => { onStart(selectedClassId, topic); }}>
              <QrCode size={14} />
              Start Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Active session: QR display + live roster ---
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 820, width: '95%' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="pulse-indicator" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-heading)' }}>
                {currentSubject?.name} — Division {currentClass?.division}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Room {currentClass?.room} · Started {new Date(activeSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {activeSession.topic && <span> · Topic: <strong>{activeSession.topic}</strong></span>}
              </div>
            </div>
            <span className="badge badge-success">Live Session</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-danger btn-sm" onClick={handleClose}>
              <Power size={13} />
              End Session
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        {/* Body: QR left, roster right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* QR side */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: 'var(--brand-light)', border: '1px solid var(--brand-muted)',
              borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            }}>
              <div className="dynamic-qr-card">
                <div className="qr-timer-pill">
                  <Clock size={11} />
                  Rotates in {timeLeft}s
                </div>
                <div style={{ margin: '0.75rem 0' }}>
                  <QRCodeSVG
                    value={qrPayload || 'attendpulse'}
                    size={200} level="H" includeMargin={true}
                    bgColor="#ffffff" fgColor="#0f172a"
                  />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', background: 'var(--bg-subtle)', color: 'var(--text-muted)', padding: '0.2rem 0.5rem', borderRadius: 4, fontWeight: 600, letterSpacing: '0.04em' }}>
                  TOKEN: {activeSession.qr_token}
                </div>
              </div>

              {/* Timer bar */}
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RefreshCw size={11} /> Auto-rotates every 30s</span>
                  <span style={{ fontWeight: 700, color: timeLeft <= 8 ? 'var(--red)' : 'var(--brand)' }}>{timeLeft}s</span>
                </div>
                <div className="progress-bar-track" style={{ height: 5 }}>
                  <div className="progress-bar-fill" style={{ width: `${(timeLeft / 30) * 100}%`, backgroundColor: timeLeft <= 8 ? 'var(--red)' : 'var(--brand)', transition: 'width 1s linear, background-color 0.3s' }} />
                </div>
              </div>
            </div>

            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => rotateSessionToken(activeSession.id)}>
              <RefreshCw size={12} />
              Force Refresh Token
            </button>

            {/* Attendance rate */}
            <div style={{ width: '100%', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Users size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Attendance Rate
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: rate >= 75 ? 'var(--green)' : 'var(--amber)' }}>{presentCount}/{total} ({rate}%)</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${rate}%`, backgroundColor: rate >= 75 ? 'var(--green)' : 'var(--amber)' }} />
              </div>
            </div>
          </div>

          {/* Roster side */}
          <div>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>
              Live Roster ({presentCount} present)
            </div>
            <div style={{ maxHeight: 440, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {enrolledStudents.map((stu) => {
                const isPresent = presentIds.has(stu.id);
                const rec = sessionRecords.find((r) => r.student_id === stu.id);
                return (
                  <div key={stu.id} className={`roster-row${isPresent ? ' is-present' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 'var(--radius-full)', flexShrink: 0,
                        background: isPresent ? 'var(--green)' : 'var(--bg-subtle-2)',
                        color: isPresent ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700,
                      }}>
                        {stu.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stu.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{stu.roll_number}</div>
                      </div>
                    </div>
                    {isPresent ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: 'var(--green)', flexShrink: 0 }}>
                        <CheckCircle2 size={13} />
                        {rec?.method === 'QR' ? 'QR' : 'Manual'}
                      </span>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flexShrink: 0, fontSize: '0.6875rem' }}
                        onClick={() => manualUpdateAttendance(activeSession.id, stu.id, activeSession.class_id, 'PRESENT')}
                      >
                        Mark Present
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
