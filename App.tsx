import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import TechSupportDashboard from './components/TechSupportDashboard';
import AdminDashboard from './components/AdminDashboard';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <Login />;
  }

  switch (currentUser.role) {
    case UserRole.EMPLOYEE:
      return <EmployeeDashboard />;
    case UserRole.TECH:
      return <TechSupportDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    default:
      return <Login />;
  }
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
