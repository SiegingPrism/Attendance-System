import React from 'react';

interface ProgressBarProps {
  value: number;
  threshold?: number;
  height?: number;
  showLabel?: boolean;
}

function getColor(value: number, threshold: number) {
  if (value >= threshold) return 'var(--green)';
  if (value >= threshold - 10) return 'var(--amber)';
  return 'var(--red)';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, threshold = 75, height = 6, showLabel = false }) => {
  const clamped = Math.min(100, Math.max(0, value));
  const color = getColor(clamped, threshold);
  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--text-muted)' }}>Attendance</span>
          <span style={{ color }}>{clamped}%</span>
        </div>
      )}
      <div className="progress-bar-track" style={{ height }}>
        <div className="progress-bar-fill" style={{ width: `${clamped}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  threshold?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ value, size = 120, strokeWidth = 10, threshold = 75 }) => {
  const radius = (size - strokeWidth) / 2;
  const circ = radius * 2 * Math.PI;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circ - (clamped / 100) * circ;
  const color = getColor(clamped, threshold);
  const label = clamped >= threshold ? 'Eligible' : 'At Risk';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--bg-subtle-2)" strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: size > 100 ? '1.625rem' : '1.25rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}%
        </span>
        <span style={{ fontSize: '0.6875rem', color, fontWeight: 600, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
    </div>
  );
};
