import { create } from 'zustand';
import { useAuthStore } from './authStore';

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────
export interface InvestmentPrinciple {
  id: string;
  user_id: string;
  order_num: number;
  content: string;
  created_at: string;
  updated_at: string;
}

interface PrincipleState {
  principles: InvestmentPrinciple[];
  isLoading: boolean;
  error: string | null;

  // 파생 상태: 원칙이 1개 이상 작성되어 있는지 여부
  // 왜 Computed 대신 직접 계산인가: Zustand에서 selector로 컴포넌트에서 미리 계산하는 것이 더 단순
  fetchPrinciples: () => Promise<void>;
  savePrinciples: (principles: { order_num: number; content: string }[]) => Promise<void>;
  deletePrinciple: (id: string) => Promise<void>;
  clearError: () => void;
}

// ─────────────────────────────────────────────
// API Base URL: 기존 다른 store와 동일한 패턴
// ─────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/** Authorization 헤더를 생성하는 헬퍼 함수 */
const getAuthHeaders = () => {
  const accessToken = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
};

export const usePrincipleStore = create<PrincipleState>((set) => ({
  principles: [],
  isLoading: false,
  error: null,

  /** 내 투자 원칙 목록을 서버에서 불러온다 */
  fetchPrinciples: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/principles`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('원칙 목록 조회 실패');
      const data: InvestmentPrinciple[] = await res.json();
      set({ principles: data });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 원칙 배열 전체를 서버에 저장한다.
   * 왜 배열 통째로 전송인가:
   * - 사용자가 여러 개를 편집한 뒤 한 번에 저장하는 UX를 위해
   * - 백엔드에서 upsert로 처리하므로 기존 데이터를 덮지 않음
   */
  savePrinciples: async (principles) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/principles`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ principles }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || '원칙 저장 실패');
      }
      const saved: InvestmentPrinciple[] = await res.json();
      // 저장 후 최신 상태로 교체
      set({ principles: saved.sort((a, b) => a.order_num - b.order_num) });
    } catch (err: any) {
      set({ error: err.message });
      throw err; // 컴포넌트에서 catch해 토스트를 보여줄 수 있게 re-throw
    } finally {
      set({ isLoading: false });
    }
  },

  /** 단일 원칙을 삭제하고 로컬 상태에서도 제거한다 */
  deletePrinciple: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/principles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('원칙 삭제 실패');
      // 로컬 상태에서 즉시 제거 (낙관적 업데이트)
      set((state) => ({
        principles: state.principles.filter((p) => p.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

/** 원칙이 1개 이상 작성되어 있는지 여부를 반환하는 selector */
export const selectHasPrinciples = (state: PrincipleState) =>
  state.principles.length > 0;
