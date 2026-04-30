import { create } from 'zustand';
import { supabase } from '../api/supabase';
import { calcPnlForSell, calcRemainingQty } from '../lib/utils/calcPnl';
import type { TradeLike } from '../lib/utils/calcPnl';
import { useTierStore } from './tierStore';
import { startOfMonth, endOfMonth } from 'date-fns';

// ─────────────────────────────────────────────
// 상수 (Magic Number 금지 원칙 — orchestration.md §7)
// ─────────────────────────────────────────────

/** Free Tier의 월 최대 기록 건수 */
const FREE_TIER_MONTHLY_LIMIT = 30;

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

/** TradeLike unused 경고 방지 — Trade가 TradeLike를 구조적으로 포함 */
export interface Trade extends TradeLike {
  id: string;
  user_id: string;
  name: string;
  fee: number;
  pnl: number | null;     // 매도 시 실현 손익 (이동평균법)
  traded_at: string;
  strategy_tag: string | null;
  emotion_tag: string | null;
  memo: string | null;
  is_open: boolean;
  is_public: boolean;
  market: string;         // [추가] KRX, NASDAQ 등
  currency: string;       // [추가] KRW, USD
  exchange_rate: number | null; // [추가] 적용 환율
}

/** 매매 기록 생성 시 전달받는 입력 데이터 */
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
  market?: string;
  currency?: string;
  exchangeRate?: number | null;
}

/** 보유 종목 (getHoldings 반환 타입) */
export interface Holding {
  ticker: string;
  name: string;
  market: string;
  trades: Trade[];
  buyQty: number;
  sellQty: number;
  remainingQty: number;
  totalCost: number;
  avgBuyPrice: number;
}

/** 전략/감정 분석 통계 */
interface TagStat {
  tag: string;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
  avgPnl: number;
  totalPnl?: number;
}

/** getAnalysisStats 반환 타입 */
interface AnalysisStats {
  strategyStats: TagStat[];
  emotionStats: (TagStat & { totalPnl: number })[];
  mistakeStats: { type: string; count: number }[];
  overallWinRate: string;
  overallAvgPnl: number;
  totalPnl: number;
  totalTrades: number;
  totalAssets: number; // [추가] 보유 총 자산
}

/** 차트 데이터 포인트 */
interface ChartDataPoint {
  date: string;
  pnl: number;
}

interface TradeState {
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  exchangeRate: number; // [추가] 실시간 환율 (USD/KRW)
  setModalOpen: (isOpen: boolean) => void;
  fetchTrades: () => Promise<void>;
  createTrade: (input: CreateTradeInput) => Promise<void>;
  fetchExchangeRate: () => Promise<void>; // [추가] 환율 조회
  // Derived State
  getHoldings: () => Holding[];
  getAnalysisStats: () => AnalysisStats;
  getChartData: (days?: number) => ChartDataPoint[];
}

// ─────────────────────────────────────────────
// Zustand Store
// ─────────────────────────────────────────────

export const useTradeStore = create<TradeState>((set, get) => ({
  trades: [],
  isLoading: false,
  error: null,
  isModalOpen: false,
  exchangeRate: 1350, // 기본값 (추후 fetch)

  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

  /** 
   * 실시간 환율을 가져온다.
   * 1. Supabase의 system_configs 테이블에서 최신 환율과 업데이트 날짜를 확인.
   * 2. 오늘 날짜와 다를 경우에만 외부 API(ExchangeRate-API)를 호출하여 갱신.
   * 3. 일반 유저의 무분별한 호출을 방지하기 위해 DB 캐시를 우선 활용.
   */
  fetchExchangeRate: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. DB에서 캐시된 환율 정보 조회
      const { data: config } = await supabase
        .from('system_configs')
        .select('value, updated_at')
        .eq('key', 'usd_krw_rate')
        .single();

      if (config) {
        const { rate, date } = config.value as { rate: number; date: string };
        
        // 날짜가 오늘이라면 API 호출 없이 캐시된 값 사용
        if (date === today) {
          set({ exchangeRate: rate });
          return;
        }
      }

      // 2. 날짜가 다르거나 데이터가 없는 경우 외부 API 호출
      // 일반 유저의 호출을 방지하기 위해 프리미엄 유저(또는 관리자)만 갱신 권한 부여
      const { useTierStore } = await import('./tierStore');
      const userTier = useTierStore.getState().tier;
      
      if (userTier !== 'premium') {
        console.log('[TradeStore] 일반 유저는 환율 갱신 권한이 없습니다. 캐시된 데이터를 사용합니다.');
        if (config) {
          set({ exchangeRate: (config.value as any).rate });
        }
        return;
      }

      const API_KEY = import.meta.env.VITE_EXCHANGERATE_API_KEY;
      if (!API_KEY || API_KEY === 'YOUR-API-KEY') {
        console.warn('[TradeStore] API 키가 설정되지 않았습니다. 기본 환율을 사용합니다.');
        return;
      }

      const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/pair/USD/KRW`);
      const data = await response.json();
      
      if (data.result === 'success') {
        const newRate = parseFloat(data.conversion_rate.toFixed(2));
        
        // 3. DB에 새로운 환율 정보 저장 (캐시 업데이트)
        // RLS에 의해 인증된 사용자만 업데이트 가능하도록 설정됨
        const { error: updateError } = await supabase
          .from('system_configs')
          .upsert({
            key: 'usd_krw_rate',
            value: { rate: newRate, date: today },
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          console.error('[TradeStore] 환율 캐시 업데이트 실패:', updateError.message);
        }

        set({ exchangeRate: newRate });
      } else {
        console.error('[TradeStore] 환율 API 응답 오류:', data['error-type']);
      }
    } catch (err) {
      console.error('[TradeStore] 환율 조회 및 동기화 실패:', err);
    }
  },

  /**
   * 로그인된 유저의 전체 매매 내역을 Supabase에서 조회한다.
   * RLS 정책에 의해 자신의 데이터만 반환되지만,
   * eq('user_id') 조건을 명시하여 이중 방어한다.
   */
  fetchTrades: async () => {
    set({ isLoading: true, error: null });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)      // RLS 이중 방어
      .order('traded_at', { ascending: false });

    if (error) {
      console.error('[TradeStore] 매매 내역 조회 실패:', error);
      set({ error: '매매 내역을 불러오지 못했습니다.', isLoading: false });
      return;
    }

    set({ trades: (data as Trade[]) ?? [], isLoading: false });
  },

  /**
   * 매매 기록을 Supabase에 저장한다.
   *
   * 저장 전 수행 검증:
   *   1. Free Tier 월 30건 제한 확인
   *   2. 매도 시 보유 수량 초과 여부 확인
   *   3. 전량 매도 시 is_open = false 업데이트
   */
  createTrade: async (input) => {
    set({ isLoading: true, error: null });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ error: '로그인이 필요합니다.', isLoading: false });
      throw new Error('로그인이 필요합니다.');
    }

    // ── 1. Free Tier 월 30건 제한 검증 ─────────
    const { tier } = useTierStore.getState();
    if (tier === 'free') {
      const { count, error: countError } = await supabase
        .from('trades')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('traded_at', startOfMonth(new Date()).toISOString())
        .lte('traded_at', endOfMonth(new Date()).toISOString());

      if (countError) {
        console.error('[TradeStore] 월 기록 수 조회 실패:', countError);
      } else if ((count ?? 0) >= FREE_TIER_MONTHLY_LIMIT) {
        const msg = '무료 플랜은 월 30건까지 기록할 수 있습니다. Premium으로 업그레이드하세요.';
        set({ error: msg, isLoading: false });
        throw new Error(msg);
      }
    }

    const existingTrades = get().trades;

    // ── 2. 매도 수량 초과 검증 ──────────────────
    if (input.type === 'sell') {
      const buyQty = existingTrades
        .filter((t) => t.ticker === input.ticker && t.type === 'buy')
        .reduce((sum, t) => sum + Number(t.quantity), 0);
      const sellQty = existingTrades
        .filter((t) => t.ticker === input.ticker && t.type === 'sell')
        .reduce((sum, t) => sum + Number(t.quantity), 0);

      const heldQty = buyQty - sellQty;
      if (input.quantity > heldQty + 0.00000001) {
        const msg = `보유 주식이 부족합니다. (현재 보유: ${heldQty.toLocaleString()}주)`;
        set({ error: msg, isLoading: false });
        throw new Error(msg);
      }
    }

    // ── 3. PnL 계산 (매도 시) ───────────────────
    const pnl =
      input.type === 'sell'
        ? calcPnlForSell(input.ticker, input.price, input.quantity, existingTrades)
        : null;

    // ── 4. 잔여 수량 및 전량 매도 여부 ──────────
    const totalBuyQty = existingTrades
      .filter((t) => t.ticker === input.ticker && t.type === 'buy')
      .reduce((sum, t) => sum + Number(t.quantity), 0);
    const totalSellQty = existingTrades
      .filter((t) => t.ticker === input.ticker && t.type === 'sell')
      .reduce((sum, t) => sum + Number(t.quantity), 0);

    const rawRemaining =
      input.type === 'sell'
        ? totalBuyQty - totalSellQty - input.quantity
        : totalBuyQty + input.quantity - totalSellQty;

    const { isFullySold } = calcRemainingQty(rawRemaining, 0);
    const isOpen = !isFullySold;

    // ── 5. 전량 매도 시 기존 매수 기록 is_open = false ──
    if (isFullySold && input.type === 'sell') {
      const { error: updateError } = await supabase
        .from('trades')
        .update({ is_open: false })
        .eq('user_id', user.id)
        .eq('ticker', input.ticker)
        .eq('type', 'buy')
        .eq('is_open', true);

      if (updateError) {
        console.error('[TradeStore] is_open 업데이트 실패:', updateError);
        set({ error: '기록 업데이트에 실패했습니다.', isLoading: false });
        throw updateError;
      }
    }

    // ── 6. 매매 기록 삽입 ───────────────────────
    const { error: insertError } = await supabase.from('trades').insert({
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
      market: input.market ?? 'KRX',
      currency: input.currency ?? 'KRW',
      exchange_rate: input.exchangeRate ?? null,
    });

    if (insertError) {
      console.error('[TradeStore] 매매 기록 저장 실패:', insertError);
      set({ error: '매매 내역 추가에 실패했습니다.', isLoading: false });
      throw insertError;
    }

    // 저장 성공 후 최신 데이터 재조회
    await get().fetchTrades();
  },

  // ─────────────────────────────────────────────
  // Derived State
  // ─────────────────────────────────────────────

  /**
   * 현재 보유 중인 종목 목록을 계산한다.
   * 잔여 수량 > 0.000001인 종목만 반환 (부동소수점 안전 마진).
   */
  getHoldings: (): Holding[] => {
    const { trades } = get();

    // 종목 코드별로 그룹화
    const grouped = trades.reduce<Record<string, Holding>>((acc, trade) => {
      if (!acc[trade.ticker]) {
        acc[trade.ticker] = {
          ticker: trade.ticker,
          name: trade.name,
          market: trade.market || 'KRX',
          trades: [],
          buyQty: 0,
          sellQty: 0,
          remainingQty: 0,
          totalCost: 0,
          avgBuyPrice: 0,
        };
      }
      acc[trade.ticker].trades.push(trade);
      return acc;
    }, {});

    // 잔여 수량 계산 후 실질 보유 종목만 필터링
    return Object.values(grouped)
      .map((holding) => {
        const buyQty = holding.trades
          .filter((t) => t.type === 'buy')
          .reduce((sum, t) => sum + Number(t.quantity), 0);
        const sellQty = holding.trades
          .filter((t) => t.type === 'sell')
          .reduce((sum, t) => sum + Number(t.quantity), 0);
        const totalCost = holding.trades
          .filter((t) => t.type === 'buy')
          .reduce((sum, t) => sum + Number(t.price) * Number(t.quantity), 0);

        const { remaining } = calcRemainingQty(buyQty, sellQty);
        return {
          ...holding,
          buyQty,
          sellQty,
          remainingQty: remaining,
          totalCost,
          avgBuyPrice: buyQty > 0 ? totalCost / buyQty : 0,
        };
      })
      .filter((h) => h.remainingQty > 0.000001);
  },

  /** 전략/감정별 승률 분석 통계를 계산한다. */
  getAnalysisStats: (): AnalysisStats => {
    const { trades } = get();
    const sellTrades = trades.filter((t) => t.type === 'sell');

    const strategyMap = new Map<string, { total: number; wins: number; pnlSum: number }>();
    const emotionMap  = new Map<string, { total: number; wins: number; pnlSum: number }>();
    const mistakeMap  = new Map<string, number>();

    sellTrades.forEach((t) => {
      const sTag = t.strategy_tag || '태그 없음';
      const eTag = t.emotion_tag  || '기타';

      // 전략 통계
      if (!strategyMap.has(sTag)) strategyMap.set(sTag, { total: 0, wins: 0, pnlSum: 0 });
      const s = strategyMap.get(sTag)!;
      s.total++;
      if ((t.pnl ?? 0) > 0) s.wins++;
      s.pnlSum += Number(t.pnl ?? 0);

      // 감정 통계
      if (!emotionMap.has(eTag)) emotionMap.set(eTag, { total: 0, wins: 0, pnlSum: 0 });
      const e = emotionMap.get(eTag)!;
      e.total++;
      if ((t.pnl ?? 0) > 0) e.wins++;
      e.pnlSum += Number(t.pnl ?? 0);

      // 실수 분석 (손실 거래)
      if ((t.pnl ?? 0) < 0) {
        mistakeMap.set(eTag, (mistakeMap.get(eTag) ?? 0) + 1);
      }
    });

    const toTagStat = ([tag, stat]: [string, { total: number; wins: number; pnlSum: number }]): TagStat => ({
      tag,
      count: stat.total,
      wins: stat.wins,
      losses: stat.total - stat.wins,
      winRate: stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : 0,
      avgPnl: stat.total > 0 ? Math.round(stat.pnlSum / stat.total) : 0,
    });

    const strategyStats = Array.from(strategyMap.entries()).map(toTagStat).sort((a, b) => b.count - a.count);
    const emotionStats  = Array.from(emotionMap.entries()).map(([tag, e]) => ({
      ...toTagStat([tag, e]),
      totalPnl: e.pnlSum,
    })).sort((a, b) => b.totalPnl - a.totalPnl);
    const mistakeStats  = Array.from(mistakeMap.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);

    const totalTrades = strategyStats.reduce((acc, s) => acc + s.count, 0);
    const totalWins   = strategyStats.reduce((acc, s) => acc + s.wins,  0);
    const totalPnl    = trades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0);

    // 보유 총 자산 계산 (보유 종목의 총 매수금액 합계 + 실현손익)
    // 실제로는 '현재가' 기준 평가금액이어야 하나, 여기서는 매수원가 기준 자산으로 표시
    const holdings = get().getHoldings();
    const totalAssets = holdings.reduce((sum, h) => sum + h.totalCost, 0);

    return {
      strategyStats,
      emotionStats,
      mistakeStats,
      overallWinRate: totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(1) : '0.0',
      overallAvgPnl:  totalTrades > 0 ? Math.round(totalPnl / totalTrades) : 0,
      totalPnl,
      totalTrades,
      totalAssets: totalAssets + totalPnl, // 투자원금 + 실현손익 (간이 자산 계산)
    };
  },

  /** 기간별 일일 수익금 추이 차트 데이터를 생성한다. */
  getChartData: (days = 7): ChartDataPoint[] => {
    const { trades } = get();
    const today = new Date();

    // 날짜별 PnL 합산
    const pnlMap: Record<string, number> = {};
    trades.forEach((trade) => {
      const dateStr = trade.traded_at.substring(5, 10); // MM-DD
      pnlMap[dateStr] = (pnlMap[dateStr] || 0) + (Number(trade.pnl) || 0);
    });

    const half = Math.floor(days / 2);
    const result: ChartDataPoint[] = [];

    for (let i = -half; i <= half; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().substring(5, 10);
      result.push({ date: dateStr, pnl: pnlMap[dateStr] || 0 });
    }

    return result;
  },
}));
