import { create } from 'zustand';
import { useAuthStore } from './authStore';

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────
export interface StockAnalysis {
  id: string;
  user_id: string;
  ticker: string | null;
  stock_name: string | null;
  title: string;
  content: string;
  analysis_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAnalysisInput {
  ticker?: string;
  stock_name?: string;
  title: string;
  content: string;
  analysis_date?: string;
}

export interface UpdateAnalysisInput {
  title?: string;
  content?: string;
  analysis_date?: string;
}

interface StockAnalysisState {
  analyses: StockAnalysis[];
  total: number;
  isLoading: boolean;
  error: string | null;

  fetchAnalyses: (filters?: { ticker?: string; page?: number }) => Promise<void>;
  fetchByTicker: (ticker: string) => Promise<StockAnalysis[]>;
  createAnalysis: (input: CreateAnalysisInput) => Promise<StockAnalysis>;
  updateAnalysis: (id: string, input: UpdateAnalysisInput) => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
  clearError: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const accessToken = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
};

export const useStockAnalysisStore = create<StockAnalysisState>((set) => ({
  analyses: [],
  total: 0,
  isLoading: false,
  error: null,

  /**
   * 전체 분석 목록 조회 (ticker 필터 가능)
   * 왜 state를 완전히 교체하는가:
   * - 필터 변경 시 이전 데이터가 남아있으면 혼란이 생기므로 항상 새로 불러옴
   */
  fetchAnalyses: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.ticker) params.set('ticker', filters.ticker);
      if (filters.page !== undefined) params.set('page', String(filters.page));

      const res = await fetch(`${API_BASE}/api/v1/stock-analyses?${params}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('분석 목록 조회 실패');
      const data = await res.json();
      set({ analyses: data.analyses, total: data.total });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  /** 특정 종목 분석 목록 조회 (HoldingsPage → 모달 연동) */
  fetchByTicker: async (ticker: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/stock-analyses/ticker/${encodeURIComponent(ticker)}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error('종목 분석 조회 실패');
      return res.json() as Promise<StockAnalysis[]>;
    } catch (err: any) {
      set({ error: err.message });
      return [];
    }
  },

  /** 신규 분석 생성 후 로컬 상태 앞에 삽입 (낙관적 UI) */
  createAnalysis: async (input: CreateAnalysisInput) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/stock-analyses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || '분석 생성 실패');
      }
      const created: StockAnalysis = await res.json();
      // 최신 항목이 맨 위에 오도록 앞에 삽입
      set((state) => ({ analyses: [created, ...state.analyses], total: state.total + 1 }));
      return created;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /** 분석 수정 후 로컬 상태 교체 */
  updateAnalysis: async (id: string, input: UpdateAnalysisInput) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/stock-analyses/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('분석 수정 실패');
      const updated: StockAnalysis = await res.json();
      set((state) => ({
        analyses: state.analyses.map((a) => (a.id === id ? updated : a)),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /** 분석 삭제 후 로컬 상태에서 제거 */
  deleteAnalysis: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/stock-analyses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('분석 삭제 실패');
      set((state) => ({
        analyses: state.analyses.filter((a) => a.id !== id),
        total: state.total - 1,
      }));
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
