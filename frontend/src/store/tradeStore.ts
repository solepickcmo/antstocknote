import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface Trade {
  id: string;
  ticker: string;
  name: string;
  type: 'buy' | 'sell';
  price: number;        // 백엔드에서 숫자로 반환됨
  quantity: number;     // 백엔드에서 숫자로 반환됨
  fee: number;          // 백엔드에서 숫자로 반환됨
  pnl: number | null;   // 백엔드에서 숫자 또는 null로 반환됨
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

export const useTradeStore = create<TradeState>((set) => ({
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
      // 에러가 객체인 경우도 반드시 문자열로 변환 (React Error #31 방지)
      const msg = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || '매매 내역을 불러오는데 실패했습니다.';
      set({ error: typeof msg === 'string' ? msg : JSON.stringify(msg), isLoading: false });
    }
  },
  createTrade: async (tradeData: any) => {
    set({ isLoading: true, error: null });
    try {
      // 저장 후 목록을 새로 불러와 서버 데이터와 항상 동기화
      await apiClient.post('/trades', tradeData);
      const listResponse = await apiClient.get('/trades');
      set({ trades: listResponse.data.trades || [], isLoading: false });
    } catch (error: any) {
      // 에러가 객체인 경우도 반드시 문자열로 변환 (React Error #31 방지)
      const msg = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || '매매 내역 추가에 실패했습니다.';
      set({ error: typeof msg === 'string' ? msg : JSON.stringify(msg), isLoading: false });
      throw error;
    }
  }
}));
