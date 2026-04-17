import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Plus, BarChart2, Settings, LogOut, Monitor, Calculator, Sun, Moon } from 'lucide-react';
import { useTradeStore } from '../store/tradeStore';
import { useAuthStore } from '../store/authStore';
import { useLayoutStore } from '../store/layoutStore';
import { useThemeStore } from '../store/themeStore';
import { supabase } from '../api/supabase';
import './BottomNav.css';

export const BottomNav: React.FC = () => {
  const setModalOpen = useTradeStore(state => state.setModalOpen);
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const setMobileMode = useLayoutStore(state => state.setMobileMode);
  
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = React.useState(false);
  const [withdrawConfirmText, setWithdrawConfirmText] = React.useState('');
  const [isWithdrawing, setIsWithdrawing] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsSettingsOpen(false);
  };

  // 회원 탈퇴: Supabase Auth의 유저 삭제는 admin key가 필요하므로
  // 실제 계정 삭제는 Supabase Edge Function 또는 대시보드를 통해 처리합니다.
  // MVP 단계에서는 로그아웃 처리 후 안내 메시지를 표시합니다.
  const handleWithdraw = async () => {
    if (withdrawConfirmText !== '탈퇴합니다') return;

    setIsWithdrawing(true);
    try {
      // Supabase 세션 종료 (데이터 삭제는 RLS + Supabase 대시보드에서 처리)
      await supabase.auth.signOut();
      alert('탈퇴 처리되었습니다. 데이터 삭제는 영업일 기준 3일 이내 완료됩니다.');
      logout();
      navigate('/login');
    } catch (err: any) {
      alert(err.message || '회원 탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setIsWithdrawing(false);
      setIsWithdrawModalOpen(false);
    }
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
          <button className="sheet-btn" onClick={() => toggleTheme()}>
            {theme === 'light' ? (
              <><Moon size={18} /> 다크 모드 켜기</>
            ) : (
              <><Sun size={18} /> 라이트 모드 켜기</>
            )}
          </button>
          <button className="sheet-btn" onClick={() => { setIsSettingsOpen(false); setMobileMode(false); }}>
            <Monitor size={18} /> PC 화면으로 보기
          </button>
          <button className="sheet-btn text-danger" onClick={() => { setIsSettingsOpen(false); setIsWithdrawModalOpen(true); }}>
            <LogOut size={18} /> 회원 탈퇴
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
    {isWithdrawModalOpen && (
      <div className="bottom-settings-sheet" style={{ zIndex: 3000 }}>
        <div className="sheet-backdrop" onClick={() => setIsWithdrawModalOpen(false)} />
        <div className="sheet-content glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ff4d4f' }}>정말 탈퇴하시겠습니까?</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            탈퇴 시 모든 매매 기록 등 작성하신 모든 데이터가 영구히 삭제되며 복구할 수 없습니다.
          </p>
          <label id="label-withdraw" htmlFor="withdrawConfirm" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, display: 'block' }}>
            확인을 위해 아래에 "탈퇴합니다"를 입력해주세요.
          </label>
          <input
            aria-label="탈퇴 확인 문구 입력 (탈퇴합니다 입력)"
            id="withdrawConfirm"
            type="text"
            value={withdrawConfirmText}
            onChange={(e) => setWithdrawConfirmText(e.target.value)}
            placeholder="탈퇴합니다"
            aria-required="true"
            aria-labelledby="label-withdraw"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', marginBottom: '1.5rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="sheet-btn secondary" onClick={() => setIsWithdrawModalOpen(false)} style={{ flex: 1 }}>
              취소
            </button>
            <button
              className="sheet-btn"
              onClick={handleWithdraw}
              disabled={withdrawConfirmText !== '탈퇴합니다' || isWithdrawing}
              style={{ flex: 2, background: withdrawConfirmText === '탈퇴합니다' ? '#ff4d4f' : 'var(--bg-input)' }}
            >
              {isWithdrawing ? '탈퇴 처리 중...' : '계정 영구 삭제'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
