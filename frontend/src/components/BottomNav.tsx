import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Plus, BarChart2, Settings } from 'lucide-react';
import { useTradeStore } from '../store/tradeStore';
import './BottomNav.css';

export const BottomNav: React.FC = () => {
  const setModalOpen = useTradeStore(state => state.setModalOpen);

  return (
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
      <div className="bottom-nav-item" onClick={() => {
        import('../store/layoutStore').then(m => m.useLayoutStore.getState().setMobileMode(false));
      }} style={{ cursor: 'pointer' }}>
        <Settings size={22} />
        <span>PC 화면</span>
      </div>
    </nav>
  );
};
