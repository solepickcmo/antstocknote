import { create } from 'zustand';
import { supabase } from '../api/supabase';

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

/** 서비스 Tier — Basic은 v2.0에서 폐기. free / premium 2단계만 존재한다. */
export type Tier = 'free' | 'premium';

/** 기능 키 목록 — PERMISSIONS 맵의 키와 1:1 대응 */
export type FeatureKey =
  | 'trade_record'
  | 'calendar'
  | 'history_recent'
  | 'history_date_range'
  | 'calculators'
  | 'export_csv'
  | 'analysis'
  | 'theme_toggle'
  | 'goal_tracking'
  | 'emotion_analysis'
  | 'csv_bulk_upload'
  | 'ai_analysis'
  | 'investment_goal'
  | 'investment_rule'
  | 'community';

export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'canceled';

interface SubscriptionData {
  tier: Tier;
  status: SubscriptionStatus;
  expires_at: string | null;
}

interface TierState {
  tier: Tier;
  status: SubscriptionStatus | null;
  expiresAt: string | null;
  isLoadingTier: boolean;
  canAccess: (feature: FeatureKey) => boolean;
  fetchTier: (userId: string) => Promise<void>;
  // 프리미엄 신청 (pending 상태 생성)
  requestPremium: (userId: string, message?: string) => Promise<{ success: boolean; error?: string }>;
}

// ─────────────────────────────────────────────
// PERMISSIONS 맵 (orchestration.md §10 기준)
// 각 기능이 어느 Tier에서 허용되는지 정의한다.
// ─────────────────────────────────────────────
const PERMISSIONS: Record<FeatureKey, Tier[]> = {
  // ── Free 이상 허용 ─────────────────────────
  trade_record:       ['free', 'premium'], // 매매 기록 (Free: 월 30건 제한)
  calendar:           ['free', 'premium'], // 수익 캘린더
  history_recent:     ['free', 'premium'], // 히스토리 최근 3개월 조회
  export_csv:         ['free', 'premium'], // CSV 다운로드
  analysis:           ['premium'], // AI 복기 분석 (Premium 전용)
  theme_toggle:       ['free', 'premium'], // 다크/라이트 테마

  // ── Premium 전용 ────────────────────────────
  history_date_range: ['premium'],         // 히스토리 기간 직접 설정
  calculators:        ['premium'],         // 계산기 4종
  goal_tracking:      ['premium'],         // 목표 손익 설정 + 트래킹
  emotion_analysis:   ['premium'],         // 감정×수익 상관 분석
  csv_bulk_upload:    ['premium'],         // CSV 일괄 업로드
  ai_analysis:        ['premium'],         // AI 고급 분석
  investment_goal:    ['premium'],         // 투자 목표 설정
  investment_rule:    ['premium'],         // 투자 원칙 설정
  community:          ['premium'],         // 커뮤니티 기능
};

// ─────────────────────────────────────────────
// Zustand Store
// ─────────────────────────────────────────────

export const useTierStore = create<TierState>((set, get) => ({
  tier: 'free',
  status: null,
  expiresAt: null,
  isLoadingTier: false,

  /**
   * 특정 기능에 대한 접근 권한을 확인한다.
   * PERMISSIONS 맵과 현재 tier를 비교하여 허용 여부를 반환한다.
   */
  canAccess: (feature: FeatureKey): boolean => {
    const { tier } = get();
    const allowedTiers = PERMISSIONS[feature];
    return allowedTiers.includes(tier);
  },

  /**
   * Supabase subscriptions 테이블에서 현재 유저의 Tier를 조회한다.
   * 테이블이 없거나 조회 실패 시 'free'를 유지한다 (안전 기본값).
   *
   * subscriptions 테이블 스키마 (예정):
   *   user_id: uuid, tier: text ('free' | 'premium'), expires_at: timestamptz
   */
  fetchTier: async (userId: string) => {
    set({ isLoadingTier: true });

    const { data, error } = await supabase
      .from('subscriptions')
      .select('tier, status, expires_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[TierStore] Tier 조회 실패:', error.message);
      set({ isLoadingTier: false, tier: 'free', status: null });
      return;
    }

    if (!data) {
      set({ tier: 'free', status: null, expiresAt: null, isLoadingTier: false });
      return;
    }

    const { tier: fetchedTier, status, expires_at } = data as SubscriptionData;
    
    // 권한 검증: status가 active이고, 만료일이 없거나 아직 지나지 않았어야 함
    const now = new Date();
    const isExpired = expires_at ? new Date(expires_at) < now : false;
    const isActive = status === 'active' && !isExpired;

    set({
      tier: isActive ? (fetchedTier as Tier) : 'free',
      status: status,
      expiresAt: expires_at,
      isLoadingTier: false,
    });
  },

  requestPremium: async (userId: string, message?: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({ 
        user_id: userId, 
        tier: 'premium', 
        status: 'pending',
        request_message: message, // 유저가 입력한 신청 메시지 저장
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[TierStore] Premium 신청 실패:', error.message);
      return { success: false, error: error.message };
    }

    await get().fetchTier(userId);
    return { success: true };
  },
}));

// ─────────────────────────────────────────────
// 독립 유틸 함수 — 스토어 없이도 테스트 가능하도록 분리
// ─────────────────────────────────────────────

/**
 * 특정 기능이 주어진 Tier에서 허용되는지 확인한다.
 * 단위 테스트에서 스토어 없이 직접 호출하기 위해 분리.
 */
export const canAccessFeature = (feature: FeatureKey, tier: Tier): boolean => {
  return PERMISSIONS[feature].includes(tier);
};
