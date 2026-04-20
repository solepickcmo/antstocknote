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
  updateNickname: (userId: string, newNickname: string) => Promise<{ success: boolean; error?: string }>;
  withdraw: () => Promise<{ success: boolean; error?: string }>;
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
      .select('role, deleted_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[AuthStore] 프로필 조회 실패:', error.message);
      return;
    }

    if (data) {
      const profileData = data as { role: string; deleted_at: string | null };
      
      // ✅ 탈퇴 유효 기간 체크 (Soft Delete)
      if (profileData.deleted_at) {
        console.warn('[AuthStore] 탈퇴 처리된 계정입니다. 로그인을 차단합니다.');
        get().logout();
        return;
      }

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

  updateNickname: async (userId: string, newNickname: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ nickname: newNickname, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('[AuthStore] 닉네임 수정 실패:', error.message);
      return { success: false, error: error.message };
    }

    set((state) => ({
      user: state.user ? { ...state.user, nickname: newNickname } : null
    }));
    return { success: true };
  },

  withdraw: async () => {
    const user = get().user;
    if (!user) return { success: false, error: 'User not found' };

    // 1. 프로필 및 유저 테이블에 탈퇴 일시 마킹
    const deletedAt = new Date().toISOString();
    
    // profiles 테이블 업데이트
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ deleted_at: deletedAt })
      .eq('id', user.id);

    if (profileError) {
       console.error('[AuthStore] 탈퇴 처리 실패:', profileError.message);
       return { success: false, error: profileError.message };
    }

    // 2. 구독 상태 취소 및 탈퇴 마킹
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', deleted_at: deletedAt })
      .eq('user_id', user.id);

    // 3. 즉시 로그아웃 (이후 로그인 시 deleted_at 체크로 차단됨)
    await get().logout();
    
    return { success: true };
  },
}));
