import React, { useState } from 'react';
import { Student } from '../../types';
import { X, Send, Mail, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DefaulterItem {
  student: Student;
  pct: number;
  total: number;
  present: number;
  absent: number;
}

interface DispatchWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaulters: DefaulterItem[];
  thresholdPct: number;
  onDispatchSuccess: (count: number, channel: string) => void;
}

export const DispatchWarningModal: React.FC<DispatchWarningModalProps> = ({
  isOpen,
  onClose,
  defaulters,
  thresholdPct,
  onDispatchSuccess,
}) => {
  const [channel, setChannel] = useState<'EMAIL' | 'SMS' | 'BOTH'>('BOTH');
  const [includeParents, setIncludeParents] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsDone(true);
      onDispatchSuccess(defaulters.length, channel);
    }, 900);
  };

  const handleClose = () => {
    setIsDone(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-box"
        style={{ maxWidth: 680 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Head */}
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--r-sm)',
                background: 'var(--amber-50)',
                border: '1px solid var(--amber-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--amber-600)',
              }}
            >
              <AlertTriangle size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', margin: 0, fontWeight: 700, color: 'var(--gray-900)' }}>
                Dispatch Defaulter Warning Notices
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Official institutional alert for students with attendance below {thresholdPct}%
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleClose}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {isDone ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--green-50)',
                  border: '1px solid var(--green-200)',
                  color: 'var(--green-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.125rem', color: 'var(--gray-900)' }}>
                Official Warnings Dispatched Successfully!
              </h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', maxWidth: 440, margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                Notices have been delivered to <strong>{defaulters.length} students</strong> {includeParents && 'and their registered parent guardians'} via <strong>{channel === 'BOTH' ? 'Email & SMS' : channel}</strong>.
              </p>
              <button className="btn btn-primary" onClick={handleClose}>
                Done &amp; Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Defaulter Count Summary Banner */}
              <div
                style={{
                  background: 'var(--red-50)',
                  border: '1px solid var(--red-200)',
                  borderRadius: 'var(--r-sm)',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--red-700)', fontSize: '0.875rem' }}>
                    {defaulters.length} Student(s) Selected for Notice
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: 2 }}>
                    Criteria: Overall attendance strictly below {thresholdPct}% minimum mandatory requirement
                  </div>
                </div>
                <span className="badge badge-danger" style={{ fontWeight: 800 }}>
                  CRITICAL DEFICIT
                </span>
              </div>

              {/* Roster Preview */}
              <div>
                <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, color: 'var(--gray-400)', marginBottom: '0.5rem' }}>
                  Recipients Preview ({defaulters.length} Students)
                </div>
                <div
                  style={{
                    maxHeight: 170,
                    overflowY: 'auto',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--gray-50)',
                  }}
                >
                  <table className="data-table" style={{ margin: 0, fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th>Roll</th>
                        <th>Student Name</th>
                        <th>Sem / Div</th>
                        <th>Attendance %</th>
                        <th>Shortfall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defaulters.map(({ student: s, pct, total, absent }) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 700 }}>{s.roll_number}</td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>Sem {s.semester}-{s.division}</td>
                          <td style={{ color: 'var(--red-600)', fontWeight: 800 }}>{pct}%</td>
                          <td style={{ color: 'var(--gray-500)' }}>{absent} missed of {total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dispatch Options */}
              <div className="grid-2" style={{ gap: '0.875rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Notification Channels</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                      { id: 'BOTH', label: 'Email & SMS' },
                      { id: 'EMAIL', label: 'Email Only' },
                      { id: 'SMS', label: 'SMS Only' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`btn btn-xs ${channel === c.id ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setChannel(c.id as any)}
                        style={{ flex: 1, padding: '0.35rem 0.25rem', fontSize: '0.6875rem' }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Guardian Notification</label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                      color: 'var(--gray-800)',
                      cursor: 'pointer',
                      padding: '0.35rem 0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={includeParents}
                      onChange={(e) => setIncludeParents(e.target.checked)}
                      style={{ accentColor: 'var(--blue-600)', width: 16, height: 16 }}
                    />
                    <span>CC Registered Parent / Guardian Contacts</span>
                  </label>
                </div>
              </div>

              {/* Notice Message Preview */}
              <div
                style={{
                  background: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--r-sm)',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--gray-600)',
                  lineHeight: 1.45,
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: 2 }}>
                  Message Subject: URGENT: Attendance Shortfall &amp; Exam Detention Warning Notice
                </div>
                <div>
                  "Dear Student &amp; Guardian, This is an official notice from the Attendance Committee. Your current attendance is below the mandatory {thresholdPct}% threshold. Failure to attend upcoming lectures may result in exam detention as per University Ordinance 0.6086."
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSending}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={isSending || defaulters.length === 0}
                >
                  <Send size={14} />
                  {isSending ? 'Sending Notifications…' : `Dispatch Notices to ${defaulters.length} Defaulters`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
