import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { X, AlertCircle } from 'lucide-react';

interface CorrectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CorrectionRequestModal: React.FC<CorrectionRequestModalProps> = ({ isOpen, onClose }) => {
  const { currentStudent, classes, subjects, submitCorrectionRequest } = useAttendance();
  const [classId, setClassId] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !reason.trim()) return;
    const cls = classes.find((c) => c.id === classId);
    const sub = subjects.find((s) => s.id === cls?.subject_id);
    submitCorrectionRequest(classId, sub?.name ?? 'Unknown', new Date().toLocaleDateString('en-IN'), reason);
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-heading)' }}>Dispute / OD Request</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Request a correction or medical/on-duty leave</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>

        {submitted ? (
          <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem' }}>
            <AlertCircle size={36} style={{ marginBottom: '0.5rem', color: 'var(--green)' }} />
            <strong>Request Submitted</strong>
            <p style={{ fontSize: '0.8125rem', marginTop: 6, opacity: 0.85 }}>Your faculty will review and respond soon. You'll see the status in your dashboard.</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Class</label>
              <select className="form-select" value={classId} onChange={(e) => setClassId(e.target.value)} required>
                <option value="">Choose a class…</option>
                {classes.map((cls) => {
                  const sub = subjects.find((s) => s.id === cls.subject_id);
                  return <option key={cls.id} value={cls.id}>{sub?.name} — {cls.schedule_time}</option>;
                })}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe why you were absent or why the record needs correction…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <div className="alert alert-warning" style={{ marginBottom: '1rem', fontSize: '0.75rem', padding: '0.625rem 0.875rem' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              Supporting documents (medical certificate, OD letter) should be submitted physically to your faculty.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Request</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
