import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalysisPage } from './pages/AnalysisPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import { useAuthStore } from './store/authStore';
import { useTradeStore } from './store/tradeStore';
import { TradeModal } from './components/TradeModal';
import './App.css';

const ProtectedLayout: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isModalOpen = useTradeStore(state => state.isModalOpen);
  const setModalOpen = useTradeStore(state => state.setModalOpen);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // MVP용 하드코딩된 accountId 전달, 차후 계좌 선택 등 로직 추가 가능
  const defaultAccountId = '1';

  return (
    <div className="app-layout">
      <NavBar />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <TradeModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        accountId={defaultAccountId} 
      />
    </div>
  );
};

const AuthLayout: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
