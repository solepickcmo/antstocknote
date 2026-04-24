import { create } from 'zustand';
import { supabase } from '../api/supabase';

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

  fetchPrinciples: () => Promise<void>;
  savePrinciples: (principles: { order_num: number; content: string }[]) => Promise<void>;
  deletePrinciple: (id: string) => Promise<void>;
  clearError: () => void;
}

export const usePrincipleStore = create<PrincipleState>((set) => ({
  principles: [],
  isLoading: false,
  error: null,

  /** 내 투자 원칙 목록을 Supabase에서 불러온다 */
  fetchPrinciples: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('investment_principles')
        .select('*')
        .eq('user_id', user.id)
        .order('order_num', { ascending: true });

      if (error) throw error;
      set({ principles: (data as InvestmentPrinciple[]) || [] });
    } catch (err: any) {
      console.error('[PrincipleStore] 원칙 조회 실패:', err.message);
      set({ error: '투자 원칙을 불러오지 못했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 원칙 배열 전체를 서버에 저장한다.
   * Supabase 방식: 기존 항목 삭제 후 새 항목 삽입 (배열 통째 교체 대응)
   */
  savePrinciples: async (principles) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      // 1. 기존 원칙 전체 삭제 (순서가 바뀔 수 있으므로 초기화 후 삽입)
      const { error: deleteError } = await supabase
        .from('investment_principles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // 2. 새 원칙 목록 생성
      const toInsert = principles.map(p => ({
        user_id: user.id,
        order_num: p.order_num,
        content: p.content
      }));

      const { data, error: insertError } = await supabase
        .from('investment_principles')
        .insert(toInsert)
        .select();

      if (insertError) throw insertError;

      set({ principles: (data as InvestmentPrinciple[]).sort((a, b) => a.order_num - b.order_num) });
    } catch (err: any) {
      console.error('[PrincipleStore] 원칙 저장 실패:', err.message);
      set({ error: err.message || '원칙 저장 중 오류가 발생했습니다.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /** 단일 원칙을 삭제한다 */
  deletePrinciple: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('investment_principles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        principles: state.principles.filter((p) => p.id !== id),
      }));
    } catch (err: any) {
      console.error('[PrincipleStore] 원칙 삭제 실패:', err.message);
      set({ error: '원칙 삭제에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

/** 원칙이 1개 이상 작성되어 있는지 여부를 반환하는 selector */
export const selectHasPrinciples = (state: PrincipleState) =>
  state.principles.length > 0;
