import { create } from 'zustand';
import { supabase } from '../api/supabase';

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

export interface Trade {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  fee: number;
  pnl: number | null;     // 단순 차익 (수수료 제외)
  traded_at: string;
  strategy_tag: string | null;
  emotion_tag: string | null;
  memo: string | null;
  is_open: boolean;
  is_public: boolean;
}

// 매매 생성 시 전달받는 데이터 형태
export interface CreateTradeInput {
  ticker: string;
  name: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  fee: number;
  tradedAt: string;
  strategyTag?: string | null;
  emotionTag?: string | null;
  memo?: string | null;
  isPublic?: boolean;
}

interface TradeState {
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  fetchTrades: () => Promise<void>;
  createTrade: (input: CreateTradeInput) => Promise<void>;
}

// ─────────────────────────────────────────────
// PnL 계산 유틸 (이동평균법)
// SDD BR-001 기준: PnL = (매도가 - 평균매수가) × 수량 - 수수료
// ─────────────────────────────────────────────

function calcPnlForSell(
  ticker: string,
  sellPrice: number,
  sellQuantity: number,
  existingTrades: Trade[]
): number {
  // 해당 종목의 매수 거래만 필터링하여 이동평균 단가를 계산합니다.
  const buyTrades = existingTrades.filter(
    (trade) => trade.ticker === ticker && trade.type === 'buy'
  );

  const totalBuyQty = buyTrades.reduce((sum, trade) => sum + trade.quantity, 0);
  const totalBuyCost = buyTrades.reduce(
    (sum, trade) => sum + trade.price * trade.quantity,
    0
  );

  // 평균 매수 단가 산출
  const averageBuyPrice = totalBuyQty > 0 ? totalBuyCost / totalBuyQty : 0;
  
  // 단순 차익 계산: (매도가 - 평균매수가) * 수량
  // 사용자 요청에 따라 제세공과금(수수료)은 제외한 순수 매매 차익만 산출합니다.
  return (sellPrice - averageBuyPrice) * sellQuantity;
}

// ─────────────────────────────────────────────
// Zustand Store
// ─────────────────────────────────────────────

export const useTradeStore = create<TradeState>((set, get) => ({
  trades: [],
  isLoading: false,
  error: null,
  isModalOpen: false,

  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

  // 로그인된 유저의 전체 매매 내역을 Supabase에서 직접 조회
  // RLS 정책으로 인해 auth.uid() = user_id 조건이 자동 적용됨
  fetchTrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('traded_at', { ascending: false });

      if (error) throw error;
      set({ trades: (data as Trade[]) || [], isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || '매매 내역을 불러오는데 실패했습니다.',
        isLoading: false,
      });
    }
  },

  // 매매 기록 저장: 매도일 경우 PnL을 이동평균법으로 계산 후 저장
  // 수량이 0이 되는 경우 is_open을 FALSE로 업데이트 (BR-002)
  createTrade: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const existingTrades = get().trades;

      // --- 공매도 방지 체크 (v2.1) ---
      // 매도 주문 시 사용자가 실제로 보유한 수량보다 많이 팔 수 없도록 차단합니다.
      if (input.type === 'sell') {
        const tickerBuyQty = existingTrades
          .filter((trade) => trade.ticker === input.ticker && trade.type === 'buy')
          .reduce((sum, trade) => sum + Number(trade.quantity), 0);
        const tickerSellQty = existingTrades
          .filter((trade) => trade.ticker === input.ticker && trade.type === 'sell')
          .reduce((sum, trade) => sum + Number(trade.quantity), 0);
        
        const currentHeldQty = tickerBuyQty - tickerSellQty;
        
        // 부동소수점 오차(0.00000001)를 고려하여 보유 수량 검증
        if (input.quantity > currentHeldQty + 0.00000001) { 
          throw new Error(`보유 주식이 부족합니다. (현재 보유: ${currentHeldQty.toLocaleString()}주)`);
        }
      }

      // 매도 시 이동평균법으로 PnL 계산 (매수 시에는 null)
      const pnl =
        input.type === 'sell'
          ? calcPnlForSell(
              input.ticker,
              input.price,
              input.quantity,
              existingTrades
            )
          : null;

      // 저장 후 잔여 수량 계산 (is_open 결정 로직)
      const totalBuyQty = existingTrades
        .filter((trade) => trade.ticker === input.ticker && trade.type === 'buy')
        .reduce((sum, trade) => sum + trade.quantity, 0);
      const totalSellQty = existingTrades
        .filter((trade) => trade.ticker === input.ticker && trade.type === 'sell')
        .reduce((sum, trade) => sum + trade.quantity, 0);

      // 이번 거래 반영 후 최종 잔여 수량 계산
      const remainingQty =
        input.type === 'sell'
          ? totalBuyQty - totalSellQty - input.quantity
          : totalBuyQty + input.quantity - totalSellQty;

      // 잔여 수량이 거의 0에 가까우면 '청산(Closed)'으로 간주하여 is_open을 false로 설정
      const isOpen = remainingQty > 0.000001;

      const { error } = await supabase.from('trades').insert({
        user_id: user.id,
        ticker: input.ticker,
        name: input.name,
        type: input.type,
        price: input.price,
        quantity: input.quantity,
        fee: input.fee,
        pnl,
        traded_at: input.tradedAt,
        strategy_tag: input.strategyTag ?? null,
        emotion_tag: input.emotionTag ?? null,
        memo: input.memo ?? null,
        is_open: isOpen,
        is_public: input.isPublic ?? false,
      });

      if (error) throw error;

      // 저장 완료 후 최신 목록 새로고침
      await get().fetchTrades();
    } catch (err: any) {
      const msg = err.message || '매매 내역 추가에 실패했습니다.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },
}));
