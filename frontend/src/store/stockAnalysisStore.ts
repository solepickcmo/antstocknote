import { create } from 'zustand';
import { supabase } from '../api/supabase';

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

export const useStockAnalysisStore = create<StockAnalysisState>((set) => ({
  analyses: [],
  total: 0,
  isLoading: false,
  error: null,

  /** 전체 분석 목록 조회 (ticker 필터 가능) */
  fetchAnalyses: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('stock_analyses')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (filters.ticker) {
        query = query.eq('ticker', filters.ticker);
      }

      // 페이지네이션 처리 (10개씩)
      const page = filters.page || 1;
      const from = (page - 1) * 10;
      const to = from + 9;

      const { data, error, count } = await query
        .order('analysis_date', { ascending: false })
        .range(from, to);

      if (error) throw error;
      set({ analyses: (data as StockAnalysis[]) || [], total: count || 0 });
    } catch (err: any) {
      console.error('[StockAnalysisStore] 분석 조회 실패:', err.message);
      set({ error: '종목 분석 목록을 불러오지 못했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** 특정 종목 분석 목록 조회 (HoldingsPage → 모달 연동) */
  fetchByTicker: async (ticker: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('stock_analyses')
        .select('*')
        .eq('user_id', user.id)
        .eq('ticker', ticker)
        .order('analysis_date', { ascending: false });

      if (error) throw error;
      return (data as StockAnalysis[]) || [];
    } catch (err: any) {
      console.error('[StockAnalysisStore] 종목별 분석 조회 실패:', err.message);
      return [];
    }
  },

  /** 신규 분석 생성 */
  createAnalysis: async (input: CreateAnalysisInput) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await supabase
        .from('stock_analyses')
        .insert({
          user_id: user.id,
          ticker: input.ticker || null,
          stock_name: input.stock_name || null,
          title: input.title,
          content: input.content,
          analysis_date: input.analysis_date || new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      const created = data as StockAnalysis;
      set((state) => ({ analyses: [created, ...state.analyses], total: state.total + 1 }));
      return created;
    } catch (err: any) {
      console.error('[StockAnalysisStore] 분석 생성 실패:', err.message);
      set({ error: err.message || '분석 생성 중 오류가 발생했습니다.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /** 분석 수정 */
  updateAnalysis: async (id: string, input: UpdateAnalysisInput) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('stock_analyses')
        .update({
          title: input.title,
          content: input.content,
          analysis_date: input.analysis_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const updated = data as StockAnalysis;
      set((state) => ({
        analyses: state.analyses.map((a) => (a.id === id ? updated : a)),
      }));
    } catch (err: any) {
      console.error('[StockAnalysisStore] 분석 수정 실패:', err.message);
      set({ error: '분석 수정에 실패했습니다.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /** 분석 삭제 */
  deleteAnalysis: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('stock_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        analyses: state.analyses.filter((a) => a.id !== id),
        total: state.total - 1,
      }));
    } catch (err: any) {
      console.error('[StockAnalysisStore] 분석 삭제 실패:', err.message);
      set({ error: '분석 삭제에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
