import { create } from 'zustand';
import { supabase } from '../api/supabase';
import { useAuthStore } from './authStore';

export interface CommunityProfile {
  user_id: string;
  nickname: string;
  level: number;
  exp: number;
  active_skin_id: string | null;
  profile_image_url: string | null;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  trade_id: number | null;
  likes: number;
  views: number;
  created_at: string;
  
  // joined from community_profiles
  author?: {
    nickname: string;
    level: number;
  };
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;

  author?: {
    nickname: string;
    level: number;
  };
}

interface CommunityState {
  myProfile: CommunityProfile | null;
  posts: CommunityPost[];
  isLoading: boolean;
  isLoadingPosts: boolean;
  
  fetchMyProfile: () => Promise<void>;
  updateMyProfile: (nickname: string) => Promise<boolean>;
  
  fetchPosts: () => Promise<void>;
  createPost: (content: string, title?: string, tradeId?: number) => Promise<boolean>;
  
  deletePost: (postId: string) => Promise<boolean>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  myProfile: null,
  posts: [],
  isLoading: false,
  isLoadingPosts: false,

  fetchMyProfile: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('community_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      set({ myProfile: data as CommunityProfile });
    } catch (err) {
      console.error('[CommunityStore] fetchMyProfile failed:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateMyProfile: async (nickname: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('community_profiles')
        .upsert({
          user_id: user.id,
          nickname,
          updated_at: new Date().toISOString() // Fixed to ISO string
        }, { onConflict: 'user_id' })
        .select()
        .single();
        
      if (error) throw error;
      set({ myProfile: data as CommunityProfile });
      return true;
    } catch (err) {
      console.error('[CommunityStore] updateMyProfile failed:', err);
      return false;
    }
  },

  fetchPosts: async () => {
    set({ isLoadingPosts: true });
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:community_profiles!community_posts_user_id_fkey(nickname, level)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      // Foreign key relationship will exist via Postgres References on 'user_id' column
      // Workaround depending on Supabase relations generated, we assumed author:community_profiles() but without explicit FK might need manual stitching.
      // However, we explicitly defined REFERENCES community_profiles(user_id) in SQL.

      if (error) throw error;
      set({ posts: data as unknown as CommunityPost[] });
    } catch (err) {
      console.error('[CommunityStore] fetchPosts failed:', err);
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  createPost: async (content: string, title?: string, tradeId?: number) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;
    
    if (!get().myProfile) {
      alert('커뮤니티 프로필을 먼저 생성해주세요. 닉네임 설정 후 이용 가능합니다.');
      return false;
    }

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: title || null,
          content,
          trade_id: tradeId || null,
        });

      if (error) throw error;
      await get().fetchPosts();
      return true;
    } catch (err) {
      console.error('[CommunityStore] createPost failed:', err);
      return false;
    }
  },

  deletePost: async (postId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      await get().fetchPosts();
      return true;
    } catch (err) {
      console.error('[CommunityStore] deletePost failed:', err);
      return false;
    }
  }
}));
