import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTierStore } from '../store/tierStore';
import { 
  User, Mail, Shield, Sparkles, LogOut, 
  Trash2, Edit2, CheckCircle, Clock 
} from 'lucide-react';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateNickname, withdraw, logout } = useAuthStore();
  const { tier, status, expiresAt, requestPremium } = useTierStore();
  
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.nickname || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateNickname = async () => {
    if (!user || !newNickname.trim()) return;
    setLoading(true);
    const result = await updateNickname(user.id, newNickname.trim());
    if (result.success) {
      setIsEditingNickname(false);
    } else {
      alert('닉네임 수정 실패: ' + result.error);
    }
    setLoading(false);
  };

  const handleRequestPremium = async () => {
    if (!user) return;
    setLoading(true);
    const result = await requestPremium(user.id);
    if (!result.success) {
      alert('신청 실패: ' + result.error);
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까? 모든 매매 데이터가 영구적으로 삭제됩니다.')) return;
    setLoading(true);
    const result = await withdraw();
    if (result.success) {
      navigate('/login');
    } else {
      alert('탈퇴 처리 실패: ' + result.error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="profile-container animate-fade-in">
      <header className="profile-header">
        <h1 className="text-3xl font-black tracking-tighter">프로필 설정</h1>
        <p className="text-muted text-sm mt-1">계정 정보 및 구독 상태를 관리하세요.</p>
      </header>

      <div className="profile-grid">
        {/* User Info Card */}
        <section className="profile-card user-card">
          <div className="card-inner">
            <div className="user-avatar-large">
              <User size={40} className="text-primary" />
            </div>
            
            <div className="user-details mt-4 text-center">
              {isEditingNickname ? (
                <div className="flex flex-col gap-2 w-full max-w-[200px] mx-auto">
                  <input 
                    type="text" 
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="edit-input"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button className="btn-save" onClick={handleUpdateNickname}>저장</button>
                    <button className="btn-cancel" onClick={() => setIsEditingNickname(false)}>취소</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-bold">{user.nickname}</h2>
                  <button className="icon-btn" onClick={() => setIsEditingNickname(true)}>
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
              <p className="text-muted text-sm flex items-center justify-center gap-1 mt-1">
                <Mail size={12} /> {user.email}
              </p>
            </div>

            <div className="role-tag mt-4">
              {user.isAdmin ? (
                <span className="badge admin"><Shield size={12} /> ADMIN</span>
              ) : (
                <span className="badge user"><User size={12} /> 일반 사용자</span>
              )}
            </div>
          </div>
        </section>

        {/* Subscription Card */}
        <section className="profile-card sub-card">
          <div className="card-label">SUBSCRIPTION</div>
          <div className="sub-status-box mt-4">
            <div className="flex items-center gap-3">
              <div className={`status-icon ${tier}`}>
                <Sparkles size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold uppercase">{tier} TIER</h3>
                  <span className={`status-pill ${status || 'inactive'}`}>
                    {status === 'active' ? '사용 중' : status === 'pending' ? '승인 대기' : '미구독'}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  {status === 'active' 
                    ? (expiresAt ? `${new Date(expiresAt).toLocaleDateString()} 까지 유효` : '평생 이용권') 
                    : '다양한 프리미엄 기능을 만나보세요.'}
                </p>
              </div>
            </div>

            {tier === 'free' && status !== 'pending' && (
              <button className="btn-upgrade mt-6" onClick={handleRequestPremium} disabled={loading}>
                <Sparkles size={16} /> Premium 신청하기
              </button>
            )}

            {status === 'pending' && (
              <div className="pending-msg mt-4 flex items-center gap-2">
                <Clock size={14} className="animate-spin-slow" />
                <span>관리자가 검토 중입니다. 잠시만 기다려 주세요.</span>
              </div>
            )}
          </div>

          <div className="premium-features mt-6">
            <h4 className="text-xs font-bold text-muted mb-3 uppercase tracking-widest">Premium 혜택</h4>
            <ul className="feature-list">
              <li><CheckCircle size={14} className="text-primary" /> 무제한 매매 기록</li>
              <li><CheckCircle size={14} className="text-primary" /> 전체 기간 히스토리 조회</li>
              <li><CheckCircle size={14} className="text-primary" /> 투자 시뮬레이터 4종 전체</li>
              <li><CheckCircle size={14} className="text-primary" /> 감정 × 수익 상관 관계 분석</li>
            </ul>
          </div>
        </section>

        {/* Account Settings Card */}
        <section className="profile-card danger-card col-span-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">기타 설정</h3>
              <p className="text-xs text-muted">로그아웃 및 서비스 탈퇴를 관리합니다.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex items-center gap-2" onClick={handleLogout}>
                <LogOut size={16} /> 로그아웃
              </button>
              <button className="btn-danger flex items-center gap-2" onClick={handleWithdraw}>
                <Trash2 size={16} /> 계정 탈퇴
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
