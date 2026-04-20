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
}

export const AdminSubscriptionPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const user = useAuthStore(state => state.user);

  const fetchSubscriptions = async () => {
    setLoading(true);
    // profiles와 subscriptions를 조인하여 유저 이메일/닉네임까지 가져온다.
    // 참고: Supabase에서 단순 쿼리로 수행하거나 RPC를 사용할 수 있음.
    // 여기서는 subscriptions를 먼저 가져오고 profiles 정보와 합친다.
    
    // 1. subscriptions 가져오기
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      setLoading(false);
      return;
    }

    // 2. profiles 가져오기 (이메일은 auth.users에 있으나, profiles에 연동된 경우 활용)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, nickname');

    if (profileError) console.error('Error fetching profiles:', profileError);

    // 3. 데이터 결합
    const merged = subData.map((sub: any) => {
      const profile = profileData?.find(p => p.id === sub.user_id);
      return {
        ...sub,
        nickname: profile?.nickname || 'Unknown',
        // 이메일은 보안상 admin 기능으로 auth 데이터 조회가 필요할 수 있으나 
        // 여기서는 profiles나 다른 메타데이터를 활용한다고 가정.
        email: '---' 
      };
    });

    setSubscriptions(merged);
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

    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'active', 
        tier: 'premium', 
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      alert('승인 실패: ' + error.message);
    } else {
      fetchSubscriptions();
    }
  };

  const handleDecline = async (userId: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      alert('거절 실패: ' + error.message);
    } else {
      fetchSubscriptions();
    }
  };

  const filtered = subscriptions.filter(s => 
    filterStatus === 'all' ? true : s.status === filterStatus
  );

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
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted" />
          <span className="text-xs font-bold text-muted uppercase tracking-widest">필터링</span>
        </div>
        <div className="flex gap-2 mt-2">
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
                      <p className="text-[10px] text-muted">{sub.user_id.slice(0, 8)}...</p>
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
