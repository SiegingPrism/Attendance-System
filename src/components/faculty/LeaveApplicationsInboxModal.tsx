import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { LeaveApplication } from '../../types';
import { X, FileText, CheckCircle2, XCircle, Clock, Calendar, Paperclip, MessageSquare } from 'lucide-react';

interface LeaveApplicationsInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveApplicationsInboxModal: React.FC<LeaveApplicationsInboxModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { leaveApplications, reviewLeave } = useAttendance();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleCommentChange = (id: string, val: string) => {
    setCommentInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handleReview = (id: string, status: 'APPROVED' | 'REJECTED') => {
    const comment = commentInputs[id] || (status === 'APPROVED' ? 'Approved by faculty.' : 'Rejected due to insufficient documentation.');
    reviewLeave(id, status, comment);
  };

  // Sort: PENDING on top, then newest applied_at
  const sortedLeaves = [...leaveApplications].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
  });

  const filteredLeaves = sortedLeaves.filter((l) => {
    if (activeTab === 'PENDING') return l.status === 'PENDING';
    if (activeTab === 'RESOLVED') return l.status !== 'PENDING';
    return true;
  });

  const pendingCount = leaveApplications.filter((l) => l.status === 'PENDING').length;

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case 'MEDICAL':
        return <span className="badge badge-warning">Medical Leave</span>;
      case 'ON_DUTY_EVENT':
        return <span className="badge badge-info">College OD</span>;
      case 'SPORTS':
        return <span className="badge badge-success">Sports OD</span>;
      default:
        return <span className="badge badge-neutral">Personal</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 680, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--gray-900)' }}>
                Medical &amp; Duty Leave Applications
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Review student absence requests and authorize excused attendance credits
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--gray-200)', marginBottom: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'PENDING' ? '2px solid var(--blue-600)' : '2px solid transparent',
              color: activeTab === 'PENDING' ? 'var(--blue-600)' : 'var(--gray-500)',
              padding: '0.35rem 0.5rem',
              cursor: 'pointer',
            }}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'ALL' ? '2px solid var(--blue-600)' : '2px solid transparent',
              color: activeTab === 'ALL' ? 'var(--blue-600)' : 'var(--gray-500)',
              padding: '0.35rem 0.5rem',
              cursor: 'pointer',
            }}
          >
            All Requests ({leaveApplications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RESOLVED')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'RESOLVED' ? '2px solid var(--blue-600)' : '2px solid transparent',
              color: activeTab === 'RESOLVED' ? 'var(--blue-600)' : 'var(--gray-500)',
              padding: '0.35rem 0.5rem',
              cursor: 'pointer',
            }}
          >
            Resolved ({leaveApplications.length - pendingCount})
          </button>
        </div>

        {/* Applications List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: 4 }}>
          {filteredLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-400)', fontSize: '0.8125rem' }}>
              No leave applications found in this view.
            </div>
          ) : (
            filteredLeaves.map((leave) => {
              const isPending = leave.status === 'PENDING';
              return (
                <div
                  key={leave.id}
                  style={{
                    padding: '0.875rem',
                    border: isPending ? '1px solid var(--blue-200)' : '1px solid var(--gray-200)',
                    borderRadius: 'var(--r-md)',
                    background: isPending ? 'var(--white)' : 'var(--gray-50)',
                    boxShadow: isPending ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--gray-900)' }}>{leave.student_name}</strong>
                        <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '0.1rem 0.35rem', borderRadius: 4 }}>
                          Roll {leave.roll_number}
                        </span>
                        {getLeaveTypeBadge(leave.leave_type)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem', color: 'var(--gray-500)', marginTop: 3 }}>
                        <Calendar size={12} />
                        <span>Duration: {leave.start_date} to {leave.end_date}</span>
                      </div>
                    </div>

                    <div>
                      {leave.status === 'PENDING' ? (
                        <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={11} /> Pending
                        </span>
                      ) : leave.status === 'APPROVED' ? (
                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <CheckCircle2 size={11} /> Approved (Excused)
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <XCircle size={11} /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-700)', padding: '0.5rem 0.625rem', background: isPending ? 'var(--gray-50)' : 'var(--white)', borderRadius: 'var(--r-sm)', border: '1px solid var(--gray-200)', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>Reason: </span>
                    {leave.reason}
                  </div>

                  {leave.document_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
                      <Paperclip size={12} />
                      <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{leave.document_name}</span>
                    </div>
                  )}

                  {leave.faculty_comment && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      <MessageSquare size={12} color="var(--gray-400)" />
                      <span>Note: {leave.faculty_comment}</span>
                    </div>
                  )}

                  {isPending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--gray-200)' }}>
                      <input
                        type="text"
                        className="form-input form-input-sm"
                        placeholder="Remarks or faculty note (optional)..."
                        value={commentInputs[leave.id] || ''}
                        onChange={(e) => handleCommentChange(leave.id, e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        style={{ color: 'var(--red-600)', borderColor: 'var(--red-200)' }}
                        onClick={() => handleReview(leave.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-xs"
                        onClick={() => handleReview(leave.id, 'APPROVED')}
                      >
                        Approve (Grant Excused)
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-200)', marginTop: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
