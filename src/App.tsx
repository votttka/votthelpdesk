import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { MainLayout } from './MainLayout';
import { Dashboard } from './Dashboard';
import { TicketList } from './TicketList';
import { TicketDetail } from './TicketDetail';
import { CreateTicket } from './CreateTicket';
import { Settings } from './Settings';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    navigate(`/tickets/${ticketId}`);
  };

  const handleBack = () => {
    setSelectedTicketId(null);
    navigate('/tickets');
  };

  const getCurrentPath = () => {
    const path = location.pathname;
    if (path.includes('/tickets/')) return '/tickets';
    return path;
  };

  return (
    <MainLayout currentPath={getCurrentPath()} onNavigate={handleNavigate}>
      <Routes>
        <Route 
          path="/" 
          element={<Dashboard onTicketClick={handleTicketClick} />} 
        />
        <Route 
          path="/tickets" 
          element={<TicketList onTicketClick={handleTicketClick} />} 
        />
        <Route 
          path="/tickets/new" 
          element={<CreateTicket />} 
        />
        <Route 
          path="/tickets/:id" 
          element={
            selectedTicketId ? (
              <TicketDetail ticketId={selectedTicketId} onBack={handleBack} />
            ) : (
              <TicketList onTicketClick={handleTicketClick} />
            )
          } 
        />
        <Route 
          path="/settings" 
          element={<Settings />} 
        />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
