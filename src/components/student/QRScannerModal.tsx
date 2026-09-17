import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Camera, CheckCircle2, AlertTriangle, X, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const { activeSession, classes, subjects, markAttendanceViaQR, getActiveSessionQRPayload } = useAttendance();
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [qrPayload, setQrPayload] = useState('');

  useEffect(() => {
    if (activeSession) setQrPayload(getActiveSessionQRPayload());
    else setQrPayload('');
  }, [activeSession, getActiveSessionQRPayload]);

  if (!isOpen) return null;

  const targetClass = activeSession ? classes.find((c) => c.id === activeSession.class_id) : null;
  const targetSubject = targetClass ? subjects.find((s) => s.id === targetClass.subject_id) : null;

  const handleScan = (payload: string) => {
    const res = markAttendanceViaQR(payload);
    setScanResult(res);
    if (res.success) confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: ['#2563eb', '#16a34a', '#d97706'] });
  };

  const handleExpiredTest = () => {
    const fake = JSON.stringify({
      sessionId: activeSession?.id ?? 'sess-test',
      classId: activeSession?.class_id ?? 'cls-dbms',
      token: 'OLD-EXPIRED-TOKEN',
      generatedAt: Date.now() - 90_000,
      expiresAt: Date.now() - 60_000,
    });
    handleScan(fake);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-heading)' }}>Scan Attendance QR</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Point camera at the rolling QR on the faculty screen</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Scan result state */}
        {scanResult ? (
          <div className={`alert ${scanResult.success ? 'alert-success' : 'alert-danger'}`} style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem', marginBottom: '1rem' }}>
            {scanResult.success
              ? <CheckCircle2 size={40} style={{ marginBottom: '0.75rem', color: 'var(--green)' }} />
              : <AlertTriangle size={40} style={{ marginBottom: '0.75rem', color: 'var(--red)' }} />}
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem' }}>
              {scanResult.success ? 'Attendance Recorded!' : 'Verification Failed'}
            </div>
            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>{scanResult.message}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
              {scanResult.success
                ? <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
                : <button className="btn btn-secondary btn-sm" onClick={() => setScanResult(null)}>Try Again</button>}
            </div>
          </div>
        ) : (
          <>
            {/* Camera viewfinder */}
            <div style={{
              height: 200, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', overflow: 'hidden', position: 'relative',
            }}>
              <div style={{ width: 140, height: 140, border: '2px solid var(--brand-muted)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: 2,
                  background: 'var(--brand)', opacity: 0.6,
                  animation: 'qrScan 2s ease-in-out infinite alternate',
                }} />
                <Camera size={32} color="var(--text-muted)" />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.625rem' }}>Camera viewfinder active</p>
              <style>{`@keyframes qrScan { from { top: 8%; } to { top: 88%; } }`}</style>
            </div>

            {/* Active session quick scan */}
            {activeSession ? (
              <div className="alert alert-info" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ fontWeight: 600 }}>Active session detected</div>
                  <span className="badge badge-success">Live</span>
                </div>
                <p style={{ fontSize: '0.8125rem' }}>{targetSubject?.name} · Room {targetClass?.room} · Div {targetClass?.division}</p>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleScan(qrPayload)}>
                  <Sparkles size={14} />
                  Simulate QR Scan (Demo)
                </button>
              </div>
            ) : (
              <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>No live session is running. Switch to Faculty to start one.</span>
              </div>
            )}

            {/* Anti-proxy test */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>Security Testing</div>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', fontSize: '0.75rem' }} onClick={handleExpiredTest}>
                Test Expired Token Rejection (Anti-Proxy Demo)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
