import { create } from 'zustand';
import { supabase } from '../api/supabase';
import { useTierStore } from './tierStore';

// ─────────────────────────────────────────────
// 타입 정의
//
// Tier는 orchestration.md §13 기준:
//   'free' | 'premium' — Basic 없음 (v2.0 폐기)
// ─────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'user' | 'admin';
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User | null, accessToken: string | null) => void;
  logout: () => void;
  setInitialized: (val: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (user, accessToken) => {
    set({ user, accessToken, isAuthenticated: !!user });

    if (user) {
      useTierStore.getState().fetchTier(user.id);
      // 프로필 정보(role) 조회
      get().fetchProfile(user.id);
    }
  },

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[AuthStore] 프로필 조회 실패:', error.message);
      return;
    }

    if (data) {
      set((state) => ({
        user: state.user ? { 
          ...state.user, 
          role: data.role as 'user' | 'admin',
          isAdmin: data.role === 'admin' || state.user.email === 'antstocknote@gmail.com'
        } : null
      }));
    } else {
      // 프로필이 없는 경우 기본값 설정 (어드민 이메일 체크 포함)
      set((state) => ({
        user: state.user ? { 
          ...state.user, 
          role: state.user.email === 'antstocknote@gmail.com' ? 'admin' : 'user',
          isAdmin: state.user.email === 'antstocknote@gmail.com'
        } : null
      }));
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setInitialized: (val) => set({ isInitialized: val }),
}));
