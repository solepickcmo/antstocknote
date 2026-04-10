import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { HistoryPage } from './pages/HistoryPage';
import { HoldingsPage } from './pages/HoldingsPage';
import { AnalysisPage } from './pages/AnalysisPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import { useAuthStore } from './store/authStore';
import { useTradeStore } from './store/tradeStore';
import { useLayoutStore } from './store/layoutStore';
import { TradeModal } from './components/TradeModal';
import { BottomNav } from './components/BottomNav';
import './App.css';

const ProtectedLayout: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isModalOpen = useTradeStore(state => state.isModalOpen);
  const setModalOpen = useTradeStore(state => state.setModalOpen);
  const isMobileMode = useLayoutStore(state => state.isMobileMode);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`app-wrapper ${isMobileMode ? 'mobile-mode' : ''}`}>
      <div className="app-layout">
        {!isMobileMode && <NavBar />}
        <main className={`main-content ${isMobileMode ? 'mobile-main' : ''}`}>
          <div className="container">
            <Outlet />
          </div>
        </main>
        {isMobileMode && <BottomNav />}
        <TradeModal 
          isOpen={isModalOpen} 
          onClose={() => setModalOpen(false)} 
        />
      </div>
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
          <Route path="/holdings" element={<HoldingsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
