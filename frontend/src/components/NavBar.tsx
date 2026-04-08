import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, History, PlusSquare, Settings, BarChart2 } from 'lucide-react';
import { useTradeStore } from '../store/tradeStore';
import './NavBar.css';

export const NavBar: React.FC = () => {
  const setModalOpen = useTradeStore(state => state.setModalOpen);
  return (
    <nav className="glass-panel navbar">
      <div className="nav-brand">
        <h2>🐜 개미의 집</h2>
      </div>
      <div className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={20} />
          <span>대시보드</span>
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Calendar size={20} />
          <span>캘린더</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <History size={20} />
          <span>매매기록</span>
        </NavLink>
        <NavLink to="/analysis" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <BarChart2 size={20} />
          <span>분석</span>
        </NavLink>
        <div className="nav-item action-btn" onClick={() => setModalOpen(true)}>
          <PlusSquare size={20} />
          <span>기록하기</span>
        </div>
      </div>
      <div className="nav-footer">
        <button className="nav-item">
          <Settings size={20} />
          <span>설정</span>
        </button>
      </div>
    </nav>
  );
};
