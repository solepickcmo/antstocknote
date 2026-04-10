import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface Trade {
  id: string;
  ticker: string;
  name: string;
  type: 'buy' | 'sell';
  price: string;
  quantity: string;
  pnl: string | null;
  traded_at: string;
  strategy_tag: string | null;
  emotion_tag: string | null;
  is_open: boolean;
  is_public: boolean;
}

interface TradeState {
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  fetchTrades: () => Promise<void>;
  createTrade: (tradeData: any) => Promise<void>;
}

export const useTradeStore = create<TradeState>((set, get) => ({
  trades: [],
  isLoading: false,
  error: null,
  isModalOpen: false,
  setModalOpen: (isOpen: boolean) => set({ isModalOpen: isOpen }),
  fetchTrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/trades');
      set({ trades: response.data.trades || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || '매매 내역을 불러오는데 실패했습니다.', isLoading: false });
    }
  },
  createTrade: async (tradeData: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/trades', tradeData);
      const newTrade = response.data;
      set({ trades: [newTrade, ...get().trades], isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || '매매 내역 추가에 실패했습니다.', isLoading: false });
      throw error;
    }
  }
}));
