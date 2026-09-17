import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Navbar } from './components/layout/Navbar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ActiveSessionModal } from './components/faculty/ActiveSessionModal';

const AppContent: React.FC = () => {
  const { currentRole } = useAttendance();
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

  return (
    <div className="app-container">
      <Navbar onOpenLiveSession={() => setIsLiveModalOpen(true)} />

      <main className="main-content">
        {currentRole === 'STUDENT' && <StudentDashboard />}
        {currentRole === 'FACULTY' && <FacultyDashboard />}
        {currentRole === 'ADMIN' && <AdminDashboard />}
      </main>

      <ActiveSessionModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        onStart={() => {}}
      />

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1rem 1.5rem',
        background: 'var(--bg-white)',
      }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>AttendPulse</strong> — Multi-role college attendance management
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            <span>30s Rolling QR</span>
            <span>75% Eligibility Engine</span>
            <span>Dispute Workflow</span>
            <span>CSV Reports</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
