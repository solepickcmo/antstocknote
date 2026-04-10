import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Plus, BarChart2, Settings, LogOut, Monitor } from 'lucide-react';
import { useTradeStore } from '../store/tradeStore';
import { useAuthStore } from '../store/authStore';
import { useLayoutStore } from '../store/layoutStore';
import './BottomNav.css';

export const BottomNav: React.FC = () => {
  const setModalOpen = useTradeStore(state => state.setModalOpen);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsSettingsOpen(false);
  };

  return (
    <>
      <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={22} />
        <span>홈</span>
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <History size={22} />
        <span>매매 내역</span>
      </NavLink>
      <div className="bottom-nav-fab-container">
        <button className="bottom-nav-fab" onClick={() => setModalOpen(true)}>
          <Plus size={24} color="#fff" />
        </button>
        <span className="fab-label">기록</span>
      </div>
      <NavLink to="/analysis" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <BarChart2 size={22} />
        <span>복기</span>
      </NavLink>
      <div className={`bottom-nav-item ${isSettingsOpen ? 'active' : ''}`} onClick={() => setIsSettingsOpen(!isSettingsOpen)} style={{ cursor: 'pointer' }}>
        <Settings size={22} />
        <span>설정</span>
      </div>
    </nav>

    {isSettingsOpen && (
      <div className="bottom-settings-sheet">
        <div className="sheet-backdrop" onClick={() => setIsSettingsOpen(false)} />
        <div className="sheet-content glass-panel">
          <button className="sheet-btn" onClick={() => { setIsSettingsOpen(false); useLayoutStore.getState().setMobileMode(false); }}>
            <Monitor size={18} /> PC 화면으로 보기
          </button>
          <button className="sheet-btn text-danger" onClick={handleLogout}>
            <LogOut size={18} /> 로그아웃
          </button>
          <button className="sheet-btn secondary" onClick={() => setIsSettingsOpen(false)}>
            닫기
          </button>
        </div>
      </div>
    )}
    </>
  );
};
