import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { NavBar } from './components/layout/NavBar';
import { useAuthStore } from './store/authStore';
import { useTradeStore } from './store/tradeStore';
import { useLayoutStore } from './store/layoutStore';
import { useThemeStore } from './store/themeStore';
import { TradeModal } from './components/TradeModal';
import { BottomNav } from './components/layout/BottomNav';

// Lazy load pages
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const HoldingsPage = lazy(() => import('./pages/HoldingsPage').then(m => ({ default: m.HoldingsPage })));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage').then(m => ({ default: m.AnalysisPage })));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage').then(m => ({ default: m.CalculatorPage })));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const AdminSubscriptionPage = lazy(() => import('./pages/Admin/AdminSubscriptionPage').then(m => ({ default: m.AdminSubscriptionPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PrinciplesPage = lazy(() => import('./pages/PrinciplesPage').then(m => ({ default: m.PrinciplesPage })));
import { TierGate } from './components/common/TierGate';

const PageLoader = () => (
  <div className="flex items-center justify-center p-20">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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
            { 
              id: session.user.id, 
              email: session.user.email!, 
              nickname: session.user.user_metadata?.nickname || '사용자',
              role: session.user.email === 'antstocknote@gmail.com' ? 'admin' : 'user',
              isAdmin: session.user.email === 'antstocknote@gmail.com'
            },
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
            { 
              id: session.user.id, 
              email: session.user.email!, 
              nickname: session.user.user_metadata?.nickname || '사용자',
              role: session.user.email === 'antstocknote@gmail.com' ? 'admin' : 'user',
              isAdmin: session.user.email === 'antstocknote@gmail.com'
            },
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
        <Suspense fallback={<PageLoader />}>
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
              <Route path="/holdings" element={
                <TierGate feature="history_date_range"><HoldingsPage /></TierGate>
              } />
              <Route path="/analysis" element={
                <TierGate feature="analysis"><AnalysisPage /></TierGate>
              } />
              <Route path="/calculator" element={
                <TierGate feature="calculators"><CalculatorPage /></TierGate>
              } />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/principles" element={<PrinciplesPage />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptionPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
