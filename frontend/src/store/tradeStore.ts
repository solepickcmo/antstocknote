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
  
  // --- Derived State (Selectors) ---
  getHoldings: () => any[];          // 현재 보유 중인 종목 리스트
  getAnalysisStats: () => any;       // 승률 및 전략별 분석 데이터
  getChartData: (days?: number) => any[]; // 수익금 추이 차트 데이터
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

  // 매매 기록 저장
  createTrade: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const existingTrades = get().trades;

      if (input.type === 'sell') {
        const tickerBuyQty = existingTrades
          .filter((trade) => trade.ticker === input.ticker && trade.type === 'buy')
          .reduce((sum, trade) => sum + Number(trade.quantity), 0);
        const tickerSellQty = existingTrades
          .filter((trade) => trade.ticker === input.ticker && trade.type === 'sell')
          .reduce((sum, trade) => sum + Number(trade.quantity), 0);
        
        const currentHeldQty = tickerBuyQty - tickerSellQty;
        
        if (input.quantity > currentHeldQty + 0.00000001) { 
          throw new Error(`보유 주식이 부족합니다. (현재 보유: ${currentHeldQty.toLocaleString()}주)`);
        }
      }

      const pnl =
        input.type === 'sell'
          ? calcPnlForSell(
              input.ticker,
              input.price,
              input.quantity,
              existingTrades
            )
          : null;

      const totalBuyQty = existingTrades
        .filter((trade) => trade.ticker === input.ticker && trade.type === 'buy')
        .reduce((sum, trade) => sum + trade.quantity, 0);
      const totalSellQty = existingTrades
        .filter((trade) => trade.ticker === input.ticker && trade.type === 'sell')
        .reduce((sum, trade) => sum + trade.quantity, 0);

      // 부동소수점 오차 방어: 30 - 30 = 2.84e-14 같은 케이스 처리
      // toFixed(8)로 소수점 8자리에서 반올림하여 오차 제거
      const rawRemaining =
        input.type === 'sell'
          ? totalBuyQty - totalSellQty - input.quantity
          : totalBuyQty + input.quantity - totalSellQty;
      const remainingQty = parseFloat(rawRemaining.toFixed(8));

      // 0.000001 이하는 전량 매도로 처리 (floating point 안전 마진)
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
      await get().fetchTrades();
    } catch (err: any) {
      const msg = err.message || '매매 내역 추가에 실패했습니다.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  // --- Derived State Implementations ---
  
  getHoldings: () => {
    const { trades } = get();
    const grouped = trades.reduce((acc: any, curr: Trade) => {
      if (!acc[curr.ticker]) {
        acc[curr.ticker] = { ticker: curr.ticker, name: curr.name, trades: [] };
      }
      acc[curr.ticker].trades.push(curr);
      return acc;
    }, {});

    // BR-002: 실질적 보유 수량이 있는 종목만 필터링
    return Object.values(grouped).filter((h: any) => {
      const buyQty = h.trades.filter((t: any) => t.type === 'buy').reduce((s: any, t: any) => s + t.quantity, 0);
      const sellQty = h.trades.filter((t: any) => t.type === 'sell').reduce((s: any, t: any) => s + t.quantity, 0);
      return buyQty - sellQty > 0.000001;
    });
  },

  getAnalysisStats: () => {
    const { trades } = get();
    const sellTrades = trades.filter(t => t.type === 'sell');
    
    const strategyMap = new Map<string, { total: number; wins: number; pnlSum: number }>();
    const mistakeMap = new Map<string, number>();

    sellTrades.forEach(t => {
      const tag = t.strategy_tag || '태그 없음';
      
      // 전략 통계
      if (!strategyMap.has(tag)) strategyMap.set(tag, { total: 0, wins: 0, pnlSum: 0 });
      const s = strategyMap.get(tag)!;
      s.total++;
      if ((t.pnl ?? 0) > 0) s.wins++;
      s.pnlSum += Number(t.pnl ?? 0);

      // 실수 분석 (손실 거래)
      if ((t.pnl ?? 0) < 0) {
        mistakeMap.set(tag, (mistakeMap.get(tag) ?? 0) + 1);
      }
    });

    const strategyStats = Array.from(strategyMap.entries()).map(([tag, s]) => ({
      tag,
      total: s.total,
      winRate: s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0,
      avgPnl: s.total > 0 ? Math.round(s.pnlSum / s.total) : 0,
    }));

    const mistakeStats = Array.from(mistakeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const totalTrades = strategyStats.reduce((acc, s) => acc + s.total, 0);
    const totalWins = strategyStats.reduce((acc, s) => acc + Math.round(s.total * (s.winRate / 100)), 0);
    const totalPnlSum = trades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0);

    return {
      strategyStats,
      mistakeStats,
      overallWinRate: totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(1) : '0.0',
      overallAvgPnl: totalTrades > 0 ? Math.round(totalPnlSum / totalTrades) : 0,
      totalPnl: totalPnlSum,
      totalTrades
    };
  },

  getChartData: (days = 7) => {
    const { trades } = get();
    const today = new Date();
    const result = [];
    const pnlMap: Record<string, number> = {};

    trades.forEach(trade => {
      const dateStr = trade.traded_at.substring(5, 10); // MM-DD
      pnlMap[dateStr] = (pnlMap[dateStr] || 0) + (Number(trade.pnl) || 0);
    });

    const half = Math.floor(days / 2);
    for (let i = -half; i <= half; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().substring(5, 10);
      result.push({
        date: dateStr,
        pnl: pnlMap[dateStr] || 0
      });
    }
    return result;
  }
}));

/**
 * 매도 시 실현 손익을 계산합니다 (이동평균법 기준)
 */
function calcPnlForSell(ticker: string, sellPrice: number, sellQty: number, trades: Trade[]): number {
  const tickerBuyTrades = trades.filter(t => t.ticker === ticker && t.type === 'buy');
  
  if (tickerBuyTrades.length === 0) return 0;

  // 전체 매수 총액 및 총 수량 계산
  let totalBuyCost = 0;
  let totalBuyQty = 0;
  
  tickerBuyTrades.forEach(t => {
    totalBuyCost += Number(t.price) * Number(t.quantity);
    totalBuyQty += Number(t.quantity);
  });

  const avgBuyPrice = totalBuyCost / totalBuyQty;
  // PnL = (매도가 - 평단가) * 매도수량
  return Math.floor((sellPrice - avgBuyPrice) * sellQty);
}

