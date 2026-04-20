import React, { useState } from 'react';
import { useTierStore } from '../../store/tierStore';
import { useAuthStore } from '../../store/authStore';
import { Sparkles, Check, Clock, ArrowRight } from 'lucide-react';
import './SubscriptionSection.css';

export const SubscriptionSection: React.FC = () => {
  const { tier, status, expiresAt, requestPremium } = useTierStore();
  const user = useAuthStore(state => state.user);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!user) return;
    setLoading(true);
    const result = await requestPremium(user.id);
    if (!result.success) {
      alert('신청 실패: ' + result.error);
    }
    setLoading(false);
  };

  if (tier === 'premium' && status === 'active') {
    return (
      <div className="sub-section premium-active">
        <div className="flex items-center gap-4">
          <div className="icon-badge active">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">PREMIUM 구독 중</h3>
            <p className="text-xs text-muted">
              {expiresAt ? `${new Date(expiresAt).toLocaleDateString()} 까지 유효합니다.` : '평생 이용 가능합니다.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <Check size={16} /> 모든 기능 사용 가능
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="sub-section premium-pending">
        <div className="flex items-center gap-4">
          <div className="icon-badge pending">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Premium 승인 대기 중</h3>
            <p className="text-xs text-muted">관리자가 곧 검토 후 승인할 예정입니다.</p>
          </div>
        </div>
        <div className="loader-small"></div>
      </div>
    );
  }

  return (
    <div className="sub-section free-upgrade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="icon-badge free">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-amber-200 to-primary bg-clip-text text-transparent">
              PREMIUM으로 업그레이드
            </h3>
            <p className="text-xs text-muted">무제한 기록, 실시간 보유 분석, 투자 시뮬레이터를 이용해 보세요.</p>
          </div>
        </div>
        <button 
          className="btn-premium-request" 
          onClick={handleRequest}
          disabled={loading}
        >
          {loading ? '신청 중...' : '지금 신청하기'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
