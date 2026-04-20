import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, History, Users, LogOut, Calculator, PieChart, PlusSquare, Smartphone, Sun, Moon, Shield, User } from 'lucide-react';
import { useTradeStore } from '../store/tradeStore';
import { useLayoutStore } from '../store/layoutStore';
import { useAuthStore } from '../store/authStore';
import { useTierStore } from '../store/tierStore';
import { exportTradesToCSV } from '../utils/exportUtils';
import { useThemeStore } from '../store/themeStore';
import './NavBar.css';

export const NavBar: React.FC = () => {
  const trades        = useTradeStore(state => state.trades);
  const setModalOpen  = useTradeStore(state => state.setModalOpen);
  const theme         = useThemeStore(state => state.theme);
  const toggleTheme   = useThemeStore(state => state.toggleTheme);
  const toggleMobileMode = useLayoutStore(state => state.toggleMobileMode);
  const navigate      = useNavigate();
  const logout        = useAuthStore(state => state.logout);
  const user          = useAuthStore(state => state.user);
  // user.tier 대신 tierStore에서 Tier 정보를 가져온다 (authStore에서 Tier 제거됨)
  const tier          = useTierStore(state => state.tier);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // v2.0: Free / Premium 2단계 메뉴 구조 (Basic 제거)
  const menuGroups = [
    {
      id: 'free',
      label: 'FREE',
      items: [
        { to: '/dashboard', label: '대시보드', icon: LayoutDashboard },
        { to: '/history',   label: '매매 내역', icon: History },
        { to: '/calendar',  label: '수익 캘린더', icon: Calendar },
      ]
    },
    {
      id: 'premium',
      label: 'PREMIUM',
      items: [
        { to: '/holdings',   label: '보유 종목 분석', icon: PieChart },
        { to: '/analysis',   label: 'AI 복기 분석', icon: Users },
        { to: '/calculator', label: '투자 계산기', icon: Calculator },
        { id: 'community',   label: '커뮤니티 (개미의 집)', icon: PlusSquare },
        ...(user?.isAdmin ? [{ to: '/admin/subscriptions', label: '구독 승인 관리', icon: Shield }] : []),
      ]
    }
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-logo">
          <div className="flex flex-col">
            <span className="brand-name">AntStockNote</span>
            {/* tierStore에서 Tier 표시 */}
            <span className={`user-tier-badge ${tier}`}>
              {tier.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="theme-toggle" onClick={() => toggleTheme()}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </div>
      </div>

      <div className="nav-scroll-area">
        <div className="nav-item action-btn mb-6" onClick={() => setModalOpen(true)}>
          <PlusSquare size={18} />
          <span>매매 기록하기</span>
        </div>

        {menuGroups.map((group) => (
          <div key={group.id} className={`nav-group tier-section ${group.id}`}>
            <h3 className="nav-group-title flex items-center justify-between">
              {group.label}
              <span className="tier-tag">{group.id === 'free' ? 'DEFAULT' : 'UPGRADE'}</span>
            </h3>
            {group.items.map((item) => {
              if (item.label.includes('내보내기')) {
                return (
                  <button 
                    key={item.label} 
                    onClick={() => exportTradesToCSV(trades)}
                    className="nav-item w-full text-left"
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              }
              if ('to' in item && item.to) {
                return (
                  <NavLink 
                    key={item.label} 
                    to={item.to} 
                    className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              }
              return null;
            })}
          </div>
        ))}

        <NavLink to="/calculator" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calculator size={20} />
          <span>계산기</span>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>프로필</span>
        </NavLink>

        {user?.isAdmin && (
          <NavLink to="/admin/subscriptions" className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}>
            <Shield size={20} />
            <span>어드민 센터</span>
          </NavLink>
        )}
      </div>

      <div className="nav-footer">
        <div className="nav-item action-btn" onClick={() => toggleMobileMode()}>
          <Smartphone size={18} />
          <span>모바일 뷰 전환</span>
        </div>
        <div className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>로그아웃</span>
        </div>
      </div>
    </nav>
  );
};
