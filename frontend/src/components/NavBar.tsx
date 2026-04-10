import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, History, BarChart2, Users, Settings, PieChart, PlusSquare, Smartphone, LogOut } from 'lucide-react';
import { useTradeStore } from '../store/tradeStore';
import { useLayoutStore } from '../store/layoutStore';
import { useAuthStore } from '../store/authStore';
import './NavBar.css';

export const NavBar: React.FC = () => {
  const setModalOpen = useTradeStore(state => state.setModalOpen);
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-logo">개미의 집</div>
      </div>
      
      <div className="nav-group">
        <div className="nav-item action-btn" onClick={() => setModalOpen(true)} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
          <PlusSquare size={18} />
          <span>기록하기</span>
        </div>
        <h3 className="nav-group-title">메인</h3>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={18} />
          <span>대시보드</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <History size={18} />
          <span>매매 내역</span>
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Calendar size={18} />
          <span>수익 캘린더</span>
        </NavLink>
      </div>

      <div className="nav-group">
        <h3 className="nav-group-title">분석</h3>
        <NavLink to="/holdings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <PieChart size={18} />
          <span>보유 종목</span>
        </NavLink>
        <NavLink to="/analysis" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <BarChart2 size={18} />
          <span>매매 복기</span>
        </NavLink>
      </div>

      <div className="nav-group">
        <h3 className="nav-group-title">커뮤니티</h3>
        <div className="nav-item disabled">
          <Users size={18} />
          <span>개미의 집</span>
        </div>
      </div>

      <div className="nav-group" style={{marginTop: 'auto'}}>
        <h3 className="nav-group-title">도구</h3>
        <div className="nav-item disabled">
          <Settings size={18} />
          <span>설정 / 도구</span>
        </div>
        <div className="nav-item action-btn" onClick={() => useLayoutStore.getState().toggleMobileMode()} style={{ marginTop: '0.5rem' }}>
          <Smartphone size={18} />
          <span>모바일 뷰 전환</span>
        </div>
        <div className="nav-item" onClick={handleLogout} style={{ marginTop: '0.5rem', color: '#ff4d4f', cursor: 'pointer' }}>
          <LogOut size={18} />
          <span>로그아웃</span>
        </div>
      </div>
    </nav>
  );
};
