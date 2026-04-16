import { create } from 'zustand';
import { supabase } from '../api/supabase';

export interface Tag {
  id: number;
  user_id: string;
  name: string;
  type: 'strategy' | 'emotion';
}

interface TagState {
  strategyTags: Tag[];
  emotionTags: Tag[];
  isLoading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  addTag: (name: string, type: 'strategy' | 'emotion') => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
}

// 기본 권장 태그 (사용자 태그가 없을 경우 초기화 용도)
const DEFAULT_STRATEGY = ['#돌파매매', '#눌림목', '#시가베팅', '#종가베팅', '#추세추종'];
const DEFAULT_EMOTION = ['#자신감', '#설렘', '#불안감', '#공포', '#차분함'];

export const useTagStore = create<TagState>((set, get) => ({
  strategyTags: [],
  emotionTags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*');

      if (error) throw error;

      const userTags = data as Tag[];
      
      // DB에 태그가 하나도 없으면 초기 세팅 진행
      if (userTags.length === 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const initialTags = [
            ...DEFAULT_STRATEGY.map(name => ({ user_id: user.id, name, type: 'strategy' })),
            ...DEFAULT_EMOTION.map(name => ({ user_id: user.id, name, type: 'emotion' }))
          ];
          const { data: inserted, error: insError } = await supabase
            .from('tags')
            .insert(initialTags)
            .select();
          
          if (!insError && inserted) {
            const result = inserted as Tag[];
            set({
              strategyTags: result.filter(t => t.type === 'strategy'),
              emotionTags: result.filter(t => t.type === 'emotion'),
              isLoading: false
            });
            return;
          }
        }
      }

      set({
        strategyTags: userTags.filter(t => t.type === 'strategy'),
        emotionTags: userTags.filter(t => t.type === 'emotion'),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addTag: async (name: string, type: 'strategy' | 'emotion') => {
    const tagName = name.startsWith('#') ? name : `#${name}`;
    const currentTags = type === 'strategy' ? get().strategyTags : get().emotionTags;

    if (currentTags.length >= 10) {
      throw new Error('태그는 최대 10개까지 등록 가능합니다.');
    }

    if (currentTags.some(t => t.name === tagName)) {
      throw new Error('이미 존재하는 태그입니다.');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await supabase
        .from('tags')
        .insert({ user_id: user.id, name: tagName, type })
        .select()
        .single();

      if (error) throw error;

      if (type === 'strategy') {
        set({ strategyTags: [...get().strategyTags, data as Tag] });
      } else {
        set({ emotionTags: [...get().emotionTags, data as Tag] });
      }
    } catch (err: any) {
      throw err;
    }
  },

  deleteTag: async (id: number) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({
        strategyTags: get().strategyTags.filter(t => t.id !== id),
        emotionTags: get().emotionTags.filter(t => t.id !== id)
      });
    } catch (err: any) {
      throw err;
    }
  }
}));
