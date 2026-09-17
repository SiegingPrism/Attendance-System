import React, { useState } from 'react';
import { calculateAttendanceMetrics } from '../../utils/attendanceCalc';
import { Calculator, AlertTriangle, CheckCircle } from 'lucide-react';

interface AttendanceCalculatorCardProps {
  present: number;
  conducted: number;
  defaultThreshold?: number;
}

export const AttendanceCalculatorCard: React.FC<AttendanceCalculatorCardProps> = ({
  present, conducted, defaultThreshold = 0.75,
}) => {
  const [threshold, setThreshold] = useState(defaultThreshold);
  const metrics = calculateAttendanceMetrics(present, conducted, threshold);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-heading)' }}>
          <Calculator size={15} />
          Attendance Calculator
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
        >
          <option value={0.70}>70% target</option>
          <option value={0.75}>75% (required)</option>
          <option value={0.80}>80% target</option>
          <option value={0.85}>85% target</option>
        </select>
      </div>

      <div
        className={`alert ${metrics.isLowAttendance ? 'alert-danger' : 'alert-success'}`}
        style={{ padding: '0.75rem', marginBottom: '0.75rem' }}
      >
        {metrics.isLowAttendance
          ? <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          : <CheckCircle size={14} style={{ flexShrink: 0 }} />}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
            {metrics.isLowAttendance
              ? `Attend next ${metrics.requiredAttend} classes`
              : `Safe to miss ${metrics.safeMisses} more`}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: 2, opacity: 0.85 }}>{metrics.message}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {[
          { l: 'Attended / Total', v: `${present} / ${conducted}` },
          { l: 'Current %', v: `${metrics.percentage}%` },
        ].map(({ l, v }) => (
          <div key={l} style={{ padding: '0.5rem 0.625rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 2 }}>{l}</div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-heading)' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
