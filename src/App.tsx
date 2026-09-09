import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import CreateTicketPage from './pages/CreateTicketPage';
import SettingsPage from './pages/SettingsPage';
import HeaderBar from './components/HeaderBar';
import { useHelpDeskStore } from './store/helpdeskStore';

const { Content } = Layout;

const App: React.FC = () => {
  const runAutomation = useHelpDeskStore((state) => state.runAutomation);
  
  // Run automation on mount and every minute
  useEffect(() => {
    runAutomation();
    const interval = setInterval(runAutomation, 60 * 1000);
    return () => clearInterval(interval);
  }, [runAutomation]);
  
  return (
    <ConfigProvider locale={ruRU}>
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <HeaderBar />
          <Content style={{ padding: '24px', background: '#f0f2f5' }}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/tickets/:id" element={<TicketDetailPage />} />
              <Route path="/create" element={<CreateTicketPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
