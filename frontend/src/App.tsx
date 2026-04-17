import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavBar } from './components/NavBar';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { HistoryPage } from './pages/HistoryPage';
import { HoldingsPage } from './pages/HoldingsPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { CalculatorPage } from './pages/CalculatorPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage';
import { useAuthStore } from './store/authStore';
import { useTradeStore } from './store/tradeStore';
import { useLayoutStore } from './store/layoutStore';
import { useThemeStore } from './store/themeStore';
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
  const setAuth = useAuthStore(state => state.setAuth);
  const setInitialized = useAuthStore(state => state.setInitialized);
  const isInitialized = useAuthStore(state => state.isInitialized);
  const theme = useThemeStore(state => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Initial session loading
    import('./api/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setAuth(
            { id: session.user.id, email: session.user.email!, nickname: session.user.user_metadata?.nickname || '사용자' },
            session.access_token
          );
        } else {
          setAuth(null, null);
        }
        setInitialized(true);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setAuth(
            { id: session.user.id, email: session.user.email!, nickname: session.user.user_metadata?.nickname || '사용자' },
            session.access_token
          );
        } else {
          setAuth(null, null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }, [setAuth, setInitialized]);

  if (!isInitialized) return null; // 로딩 처리

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
          
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/holdings" element={<HoldingsPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
