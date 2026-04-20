import { create } from 'zustand';
import { supabase } from '../api/supabase';

interface Goal {
  id?: string;
  user_id: string;
  target_month: string; // YYYY-MM
  target_pnl: number;
}

interface GoalState {
  currentGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
  fetchGoal: (month: string) => Promise<void>;
  updateGoal: (month: string, pnl: number) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set) => ({
  currentGoal: null,
  isLoading: false,
  error: null,

  fetchGoal: async (month: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_month', month)
        .maybeSingle();

      if (error) throw error;
      set({ currentGoal: data, isLoading: false });
    } catch (err: any) {
      console.error('Fetch goal error:', err);
      // 테이블이 없는 경우 등을 대비해 로컬 스토리지 페일오버 고려 가능하나 우선은 에러만 기록
      set({ error: err.message, isLoading: false });
    }
  },

  updateGoal: async (month: string, pnl: number) => {
    try {
      set({ isLoading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          target_month: month,
          target_pnl: pnl
        }, { onConflict: 'user_id,target_month' })
        .select()
        .single();

      if (error) throw error;
      set({ currentGoal: data, isLoading: false });
    } catch (err: any) {
      console.error('Update goal error:', err);
      set({ error: err.message, isLoading: false });
    }
  }
}));
