import React, { useState, useEffect } from 'react';
import {
  GraduationCap, UserCheck, ShieldCheck, QrCode, ArrowRight,
  Sparkles, CheckCircle2, AlertTriangle, Video, Layers, Users,
  Calendar, FileText, Database, Activity, Server, Radio
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AppRoute } from '../utils/router';

interface PortalGatewayPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const PortalGatewayPage: React.FC<PortalGatewayPageProps> = ({ onNavigate }) => {
  const { students, facultyList, classes, switchUser, minAttendanceThreshold } = useAttendance();
  const [backendHealth, setBackendHealth] = useState<{ status: string; fps: number; latency: number } | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then((r) => r.json())
      .then((data) => {
        setBackendHealth({
          status: 'ONLINE',
          fps: data.fps || 30.0,
          latency: data.frame_latency_ms || 2.1,
        });
      })
      .catch(() => {
        setBackendHealth({ status: 'OFFLINE', fps: 0, latency: 0 });
      });
  }, []);

  const handleLaunch = (role: 'STUDENT' | 'FACULTY' | 'ADMIN', userId?: string) => {
    switchUser(role, userId);
    onNavigate(role);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-100)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner Header */}
      <header
        style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--gray-200)',
          padding: '1rem 2rem',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              }}
            >
              <QrCode size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
                AttendPulse
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: 'var(--blue-50)',
                    color: 'var(--blue-600)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: '1px solid var(--blue-100)',
                  }}
                >
                  Enterprise 2.0
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                Multi-Role College Attendance &amp; Computer Vision System
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* AI Backend Health Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: '9999px',
                background: backendHealth?.status === 'ONLINE' ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${backendHealth?.status === 'ONLINE' ? '#bbf7d0' : '#fde68a'}`,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: backendHealth?.status === 'ONLINE' ? '#15803d' : '#b45309',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: backendHealth?.status === 'ONLINE' ? '#16a34a' : '#d97706',
                  boxShadow: backendHealth?.status === 'ONLINE' ? '0 0 8px #16a34a' : 'none',
                }}
              />
              <Server size={13} />
              <span>
                YOLO11 AI Microservice: {backendHealth?.status === 'ONLINE' ? `Live (${backendHealth.fps} FPS · ${backendHealth.latency}ms)` : 'Standby (localhost:8000)'}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
              Localhost Environment · Port 5173
            </div>
          </div>
        </div>
      </header>

      {/* Hero Welcome Section */}
      <section style={{ padding: '3.5rem 1.5rem 2rem', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            background: 'var(--blue-50)',
            border: '1px solid var(--blue-100)',
            borderRadius: '9999px',
            color: 'var(--blue-700)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={14} color="#2563eb" /> Dedicated Role Portals
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--gray-900)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: '1rem',
          }}
        >
          Choose Your Institutional Portal
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--gray-600)',
            lineHeight: 1.6,
            maxWidth: 680,
            margin: '0 auto',
          }}
        >
          AttendPulse separates student learning views, faculty classroom execution, and administrative compliance into dedicated, purpose-built workspaces.
        </p>
      </section>

      {/* 3 Portal Cards Grid */}
      <main style={{ maxWidth: 1320, width: '100%', margin: '0 auto', padding: '1rem 1.5rem 4rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch',
          }}
        >
          {/* 1. STUDENT PORTAL CARD */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: '16px',
              border: '1px solid var(--gray-200)',
              background: 'var(--white)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GraduationCap size={26} />
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  Student Hub
                </span>
              </div>

              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                Student Portal
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Track personal attendance metrics, scan live rotating QR codes, calculate safe lecture leaves, and verify exam hall tickets.
              </p>

              {/* Feature Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                {[
                  { text: '30s Dynamic Rolling QR Scanner', desc: 'Auto-expiring signed tokens' },
                  { text: '75% Eligibility & Safe Misses Predictor', desc: 'Prevents semester detention' },
                  { text: 'Official Exam Hall Ticket Verification', desc: 'Clearance badge & QR slip' },
                  { text: 'Medical Leave & Attendance Dispute Workflow', desc: 'Direct review with faculty' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: '0.8125rem' }}>
                      <strong style={{ color: 'var(--gray-900)' }}>{item.text}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* Quick Persona Launchers */}
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-500)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Quick Demo Student Login:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {[
                    { name: 'Aarav (85%)', id: 'usr-stu-1' },
                    { name: 'Priya (92%)', id: 'usr-stu-2' },
                    { name: 'Rohan (64% ⚠)', id: 'usr-stu-3' },
                  ].map((stu) => (
                    <button
                      key={stu.id}
                      className="btn btn-xs btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      onClick={() => handleLaunch('STUDENT', stu.id)}
                    >
                      {stu.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem 1rem' }}
                onClick={() => handleLaunch('STUDENT', 'usr-stu-1')}
              >
                <span>Enter Student Portal</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* 2. FACULTY PORTAL CARD */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: '16px',
              border: '1px solid var(--gray-200)',
              background: 'var(--white)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top highlight bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#10b981' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: '#f0fdf4',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserCheck size={26} />
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  Faculty Console
                </span>
              </div>

              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                Faculty Portal
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Conduct classroom sessions with 30s rolling QR codes, YOLO11 + ByteTrack facial recognition, and manage student attendance records.
              </p>

              {/* Feature Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                {[
                  { text: 'YOLO11 + ByteTrack AI Classroom Scanner', desc: 'Auto-detects 40+ students at once' },
                  { text: 'Zero-Latency Pipeline Flushing Engine', desc: 'RTSP ceiling & USB webcam support' },
                  { text: '30-Second Rolling Encrypted QR Code', desc: 'Prevents proxy and screen photo spoofing' },
                  { text: 'Manual Mark Sheet & Dispute Approvals', desc: 'Quick override for late arrivals' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#15803d" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: '0.8125rem' }}>
                      <strong style={{ color: 'var(--gray-900)' }}>{item.text}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* Quick Persona Launchers */}
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-500)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Quick Demo Faculty Login:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {[
                    { name: 'Dr. Rajesh Sharma (CS)', id: 'usr-fac-1' },
                    { name: 'Dr. Sunita Rao (CS)', id: 'usr-fac-2' },
                  ].map((fac) => (
                    <button
                      key={fac.id}
                      className="btn btn-xs btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      onClick={() => handleLaunch('FACULTY', fac.id)}
                    >
                      {fac.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  background: '#16a34a',
                  borderColor: '#16a34a',
                }}
                onClick={() => handleLaunch('FACULTY', 'usr-fac-1')}
              >
                <span>Enter Faculty Console</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* 3. ADMIN PORTAL CARD */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: '16px',
              border: '1px solid var(--gray-200)',
              background: 'var(--white)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: '#f5f3ff',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={26} />
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: '#f5f3ff',
                    color: '#7c3aed',
                    border: '1px solid #ddd6fe',
                  }}
                >
                  Administration
                </span>
              </div>

              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                Admin Portal
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Institution-wide governance: department analytics, faculty/student allocations, curriculum setup, academic calendar, and audit trails.
              </p>

              {/* Feature Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                {[
                  { text: 'College-Wide 75% Compliance Dashboard', desc: 'Department attendance benchmarks' },
                  { text: 'Student & Faculty Directory Management', desc: 'Allot classes, divisions & semesters' },
                  { text: 'Academic Calendar & Extra Classes', desc: 'Holidays, exam weeks & makeup slots' },
                  { text: 'System Configuration & CSV Export', desc: 'Full institutional ledger backup' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: '0.8125rem' }}>
                      <strong style={{ color: 'var(--gray-900)' }}>{item.text}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* Quick Persona Launchers */}
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-500)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Quick Demo Administrator:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  <button
                    className="btn btn-xs btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    onClick={() => handleLaunch('ADMIN', 'usr-admin')}
                  >
                    System Administrator (Dean Office)
                  </button>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  background: '#7c3aed',
                  borderColor: '#7c3aed',
                }}
                onClick={() => handleLaunch('ADMIN', 'usr-admin')}
              >
                <span>Enter Admin Portal</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Live System Specs Bar */}
        <div
          style={{
            marginTop: '2.5rem',
            padding: '1.25rem 1.5rem',
            background: 'var(--white)',
            borderRadius: '14px',
            border: '1px solid var(--gray-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} color="var(--blue-600)" />
              <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                Enrolled Students: <strong style={{ color: 'var(--gray-900)' }}>{students.length}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} color="var(--green-600)" />
              <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                Active Classes: <strong style={{ color: 'var(--gray-900)' }}>{classes.length}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} color="var(--violet-600)" />
              <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                Faculty Members: <strong style={{ color: 'var(--gray-900)' }}>{facultyList.length}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
              Direct URL Routing Supported: <code>#/student</code> · <code>#/faculty</code> · <code>#/admin</code>
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--gray-200)',
          padding: '1.25rem 1.5rem',
          background: 'var(--white)',
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.8125rem',
            color: 'var(--gray-500)',
          }}
        >
          <div>
            <strong style={{ color: 'var(--gray-800)' }}>AttendPulse</strong> — Multi-Portal Academic Attendance Management System
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
            <span>Zero-Latency ByteTrack Face AI</span>
            <span>30s Rolling QR Codes</span>
            <span>75% Statutory Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
