import React from 'react';
import { AttendanceProvider } from './context/AttendanceContext';
import { useAppRouter } from './utils/router';
import { PortalGatewayPage } from './pages/PortalGatewayPage';
import { StudentPage } from './pages/StudentPage';
import { FacultyPage } from './pages/FacultyPage';
import { AdminPage } from './pages/AdminPage';

const AppContent: React.FC = () => {
  const { currentRoute, navigateTo } = useAppRouter();

  switch (currentRoute) {
    case 'STUDENT':
      return <StudentPage onNavigate={navigateTo} />;
    case 'FACULTY':
      return <FacultyPage onNavigate={navigateTo} />;
    case 'ADMIN':
      return <AdminPage onNavigate={navigateTo} />;
    case 'GATEWAY':
    default:
      return <PortalGatewayPage onNavigate={navigateTo} />;
  }
};

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
