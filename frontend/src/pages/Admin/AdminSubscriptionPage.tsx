import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { useAuthStore } from '../../store/authStore';
import { Shield, CheckCircle, XCircle, User as UserIcon, Calendar as CalendarIcon, Filter } from 'lucide-react';
import './AdminSubscriptionPage.css';

interface UserSubscription {
  user_id: string;
  email: string;
  nickname: string;
  tier: 'free' | 'premium';
  status: 'active' | 'pending' | 'expired' | 'canceled';
  expires_at: string | null;
  request_message: string | null; // 신청 메시지 추가
}

export const AdminSubscriptionPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const user = useAuthStore(state => state.user);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_admin_subscriptions');
    if (error || !data?.success) {
      console.error('구독 목록 조회 실패:', error?.message || data?.error);
      setLoading(false);
      return;
    }
    setSubscriptions(data.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchSubscriptions();
    }
  }, [user]);

  const handleApprove = async (userId: string) => {
    // 30일 후로 만료일 설정 (기본값)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 새로 설계된 RPC (manage_premium_access) 호출
    const { data, error } = await supabase.rpc('manage_premium_access', {
      target_user_id: userId, 
      sub_action: 'approve',
      expires_at_val: expiresAt.toISOString()
    });
    
    if (error || !data?.success) {
      alert('승인 실패: ' + (error?.message || data?.error || '알 수 없는 오류'));
    } else {
      fetchSubscriptions();
    }
  };

  const handleDecline = async (userId: string) => {
    const { data, error } = await supabase.rpc('manage_premium_access', {
      target_user_id: userId, 
      sub_action: 'decline' 
    });
 
    if (error || !data?.success) {
      alert('거절 실패: ' + (error?.message || data?.error || '알 수 없는 오류'));
    } else {
      fetchSubscriptions();
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filtered = subscriptions.filter(s => {
    const matchesStatus = filterStatus === 'all' ? true : s.status === filterStatus;
    const matchesSearch = s.nickname.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <Shield className="w-16 h-16 text-red-500 mb-4 opacity-20" />
        <h2 className="text-2xl font-bold">접근 권한이 없습니다.</h2>
        <p className="text-muted mt-2">관리자 계정으로 로그인해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="flex items-center gap-3">
          <Shield className="text-primary w-8 h-8" />
          <h1 className="text-3xl font-black tracking-tighter">구독 승인 관리</h1>
        </div>
        <button className="btn-refresh" onClick={fetchSubscriptions}>
          새로고침
        </button>
      </div>

      <div className="admin-filters">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted" />
              <span className="text-xs font-bold text-muted uppercase tracking-widest">상태 필터</span>
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'active', 'expired', 'canceled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`filter-chip ${filterStatus === status ? 'active' : ''}`}
                >
                  {status.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="search-box relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="닉네임 또는 이메일 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="admin-grid">
          {filtered.length === 0 ? (
            <div className="col-span-full p-20 text-center bg-white/5 rounded-3xl border border-white/5">
              <p className="text-muted">데이터가 없습니다.</p>
            </div>
          ) : (
            filtered.map((sub) => (
              <div key={sub.user_id} className="sub-card">
                <div className="sub-card-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold">{sub.nickname}</h3>
                      <p className="text-[10px] text-muted">{sub.email}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${sub.status}`}>
                    {sub.status.toUpperCase()}
                  </span>
                </div>

                <div className="sub-card-body">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-muted">TIER</span>
                    <span className={`tier-text ${sub.tier}`}>{sub.tier.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted">EXPIRES</span>
                    <span className="flex items-center gap-1 text-[11px] font-medium">
                      <CalendarIcon size={12} className="text-muted" />
                      {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'LIFETIME'}
                    </span>
                  </div>
                </div>

                {sub.request_message && (
                  <div className="sub-card-message">
                    <p className="message-label">신청 메시지 / 입금자명</p>
                    <p className="message-content">{sub.request_message}</p>
                  </div>
                )}

                {sub.status === 'pending' && (
                  <div className="sub-card-actions">
                    <button className="btn-approve" onClick={() => handleApprove(sub.user_id)}>
                      <CheckCircle size={14} /> 승인
                    </button>
                    <button className="btn-decline" onClick={() => handleDecline(sub.user_id)}>
                      <XCircle size={14} /> 거절
                    </button>
                  </div>
                )}
                
                {sub.status === 'active' && (
                   <div className="sub-card-actions">
                     <button className="btn-decline w-full" onClick={() => handleDecline(sub.user_id)}>
                        권한 취소
                     </button>
                   </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
