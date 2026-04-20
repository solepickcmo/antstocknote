import React from 'react';
import { useTierStore, type FeatureKey } from '../../store/tierStore';
import { useAuthStore } from '../../store/authStore';
import { Sparkles, Lock, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import './TierGate.css';

interface TierGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  /** 이미 해당 기능을 보완하는 UI가 있는 경우(예: 일부 섹션 가림)를 위한 fallback */
  fallback?: React.ReactNode;
}

/**
 * [TierGate] 프리미엄 접근 제어 컴포넌트
 * 권한이 없는 유저에게 프리미엄 가치를 제안하고 업그레이드를 유도하는 UI를 표시합니다.
 */
export const TierGate: React.FC<TierGateProps> = ({ feature, children, fallback }) => {
  const { canAccess, status, requestPremium } = useTierStore();
  const user = useAuthStore(state => state.user);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const hasAccess = canAccess(feature);

  // 신청하기 핸들러
  const handleRequest = async () => {
    if (!user) return;
    
    // Binance 스타일의 간단한 입력 유도
    const msg = window.prompt('신청 사유 또는 입금자명을 입력해주세요.\n(예: 홍길동 / 입금완료)', '');
    if (msg === null) return; // 취소 시 중단

    setIsSubmitting(true);
    try {
      const result = await requestPremium(user.id, msg);
      if (!result.success) {
        alert('신청 처리 중 오류가 발생했습니다: ' + result.error);
      }
    } catch (err) {
      console.error('Premium request error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. 접근 권한이 있으면 원본 콘텐츠 렌더링
  if (hasAccess) {
    return <>{children}</>;
  }

  // 2. 특정 fallback UI가 정의된 경우 가이드 UI 대신 fallback 노출
  if (fallback) {
    return <>{fallback}</>;
  }

  // 3. 기본 프리미엄 가이드 UI (Binance Style)
  return (
    <div className="tier-gate-root animate-fade-in">
      <div className="tier-gate-inner">
        {/* 상단 아이콘 섹션 */}
        <div className="tier-gate-visual">
          <div className="lock-circle">
            <Lock size={32} className="text-secondary" />
          </div>
          <Sparkles className="sparkle-effect text-primary" size={24} />
        </div>

        {/* 텍스트 정보 */}
        <div className="tier-gate-header">
          <h2 className="tier-gate-title">프리미엄 전용 기능</h2>
          <p className="tier-gate-desc">
            더 깊이 있는 분석과 무제한 매매 기록이 필요하신가요? 
            지금 바로 Premium 멤버십으로 업그레이드하세요.
          </p>
        </div>

        {/* 혜택 리스트 */}
        <ul className="tier-gate-benefits">
          <li>
            <CheckCircle size={16} className="text-primary" />
            <span>AI 기반 정밀 매매 복기 및 분석</span>
          </li>
          <li>
            <CheckCircle size={16} className="text-primary" />
            <span>모든 투자 시뮬레이터 무제한 사용</span>
          </li>
          <li>
            <CheckCircle size={16} className="text-primary" />
            <span>매매 데이터 무제한 저장 및 CSV 추출</span>
          </li>
        </ul>

        {/* 하단 액션 버튼 */}
        <div className="tier-gate-footer">
          {status === 'pending' ? (
            <div className="status-pending-badge">
              <Clock size={18} className="animate-pulse" />
              <span>신청 정보 검토 중...</span>
            </div>
          ) : (
            <button 
              className="btn btn-primary tier-upgrade-btn" 
              onClick={handleRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리 중...' : '지금 바로 신청하기'}
              <ArrowRight size={18} className="ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
