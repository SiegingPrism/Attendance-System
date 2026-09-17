import React from 'react';
import { AttendanceStatus, SessionStatus, RequestStatus } from '../../types';

type StatusValue = AttendanceStatus | SessionStatus | RequestStatus | 'QR' | 'MANUAL' | string;

const CONFIG: Record<string, { cls: string; label: string }> = {
  PRESENT:  { cls: 'badge-success', label: 'Present' },
  ABSENT:   { cls: 'badge-danger',  label: 'Absent' },
  LATE:     { cls: 'badge-warning', label: 'Late' },
  EXCUSED:  { cls: 'badge-violet',  label: 'Excused' },
  ACTIVE:   { cls: 'badge-success', label: '● Live' },
  CLOSED:   { cls: 'badge-neutral', label: 'Closed' },
  PENDING:  { cls: 'badge-warning', label: 'Pending' },
  APPROVED: { cls: 'badge-success', label: 'Approved' },
  REJECTED: { cls: 'badge-danger',  label: 'Rejected' },
  QR:       { cls: 'badge-primary', label: 'QR Scan' },
  MANUAL:   { cls: 'badge-neutral', label: 'Manual' },
};

export const Badge: React.FC<{ status: StatusValue; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const cfg = CONFIG[status] ?? { cls: 'badge-neutral', label: status };
  return (
    <span className={`badge ${cfg.cls}${size === 'sm' ? ' btn-sm' : ''}`}>
      {cfg.label}
    </span>
  );
};
