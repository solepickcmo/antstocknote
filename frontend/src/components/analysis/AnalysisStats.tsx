import React, { useState, useMemo } from 'react';
import type { Trade } from '../../store/tradeStore';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp, FileText } from 'lucide-react';

const STRATEGY_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#2563EB', '#4F46E5', '#7C3AED'];
const MISTAKE_COLORS  = ['#F6465D', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'];

interface AnalysisStatsProps {
  strategies: any[];
  mistakes: any[];
  // 오답노트를 위해 전체 거래 데이터를 받는다
  trades?: Trade[];
}

// ─────────────────────────────────────────────
// 오답노트 컴포넌트
// 매도 완료된 종목별 거래 내역을 보여준다.
// ─────────────────────────────────────────────
const WrongAnswerNote: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);

  // 매도 완료(is_open=false) 종목들을 종목별로 그룹화
  // 매도 거래가 있는 종목만 포함한다
  const soldStockGroups = useMemo(() => {
    const sellTrades = trades.filter(t => t.type === 'sell');
    const grouped = new Map<string, { ticker: string; name: string; trades: Trade[]; totalPnl: number }>();

    sellTrades.forEach(trade => {
      const key = trade.ticker;
      if (!grouped.has(key)) {
        grouped.set(key, {
          ticker: trade.ticker,
          name: trade.name,
          trades: [],
          totalPnl: 0,
        });
      }
      const group = grouped.get(key)!;
      group.trades.push(trade);
      group.totalPnl += Number(trade.pnl ?? 0);
    });

    // 총 손익 기준으로 정렬 (손실 큰 순)
    return Array.from(grouped.values()).sort((a, b) => a.totalPnl - b.totalPnl);
  }, [trades]);

  if (soldStockGroups.length === 0) {
    return (
      <p className="text-muted text-center py-4">매도 완료된 종목이 없습니다.</p>
    );
  }

  return (
    <div className="space-y-2">
      {soldStockGroups.map((group) => {
        const isExpanded = expandedTicker === group.ticker;
        const isProfit = group.totalPnl >= 0;

        return (
          <div key={group.ticker} className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
            {/* 종목 헤더 — 클릭 시 거래 내역 펼침 */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              onClick={() => setExpandedTicker(isExpanded ? null : group.ticker)}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-3">
                {/* 수익/손실 방향 아이콘 */}
                {isProfit ? (
                  <TrendingUp size={16} className="text-emerald-500 shrink-0" />
                ) : (
                  <TrendingDown size={16} className="text-red-400 shrink-0" />
                )}
                <div className="text-left">
                  {/* KRX 종목(숫자코드)은 name으로 표시 */}
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                    {/^\d+$/.test(group.ticker) ? group.name : group.ticker}
                  </span>
                  {!/^\d+$/.test(group.ticker) && (
                    <span className="ml-2 text-xs text-gray-400">{group.name}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-sm font-bold ${isProfit ? 'text-emerald-500' : 'text-red-400'}`}>
                  {isProfit ? '+' : ''}{group.totalPnl.toLocaleString()}원
                </span>
                <span className="text-xs text-gray-400">({group.trades.length}회 매도)</span>
                {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>
            </button>

            {/* 펼쳐진 거래 상세 내역 */}
            {isExpanded && (
              <div className="border-t border-gray-100 dark:border-white/10 px-4 py-3 space-y-3 bg-gray-50 dark:bg-white/2">
                {group.trades.map((trade) => (
                  <div key={trade.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(trade.traded_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {' '}매도
                      </span>
                      <span className={`text-xs font-bold ${Number(trade.pnl ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {Number(trade.pnl ?? 0) >= 0 ? '+' : ''}{Number(trade.pnl ?? 0).toLocaleString()}원
                      </span>
                    </div>

                    {/* 전략 태그 */}
                    {trade.strategy_tag && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                          {trade.strategy_tag}
                        </span>
                      </div>
                    )}

                    {/* 매수 이유 메모 (선택메모) */}
                    {trade.memo ? (
                      <div className="flex items-start gap-2 bg-white dark:bg-white/5 rounded-lg px-3 py-2">
                        <FileText size={12} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          {trade.memo}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-300 dark:text-gray-600 italic">메모 없음</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// AnalysisStats 메인 컴포넌트
// ─────────────────────────────────────────────
export const AnalysisStats: React.FC<AnalysisStatsProps> = ({ strategies, mistakes, trades = [] }) => {
  const maxMistakeCount = mistakes.length > 0 ? Math.max(...mistakes.map(m => m.count)) : 1;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* 전략별 승률 */}
        <div className="card-fintech">
          <h2 className="text-fintech-lg font-fintech-bold mb-2">전략별 승률</h2>
          <div className="space-y-2">
            {strategies.map((s, idx) => (
              <div key={s.tag} className="space-y-2">
                <div className="flex justify-between text-fintech-xs font-medium px-0.5">
                  <div>
                    <span className="text-secondary">{s.tag}</span>
                    <span className="ml-2 text-muted text-[10px]">{s.total}회 거래</span>
                    {s.total < 10 && <span className="ml-1 text-[10px] text-red-400">(표본 부족)</span>}
                  </div>
                  <span className="primary-text font-bold">
                    {s.winRate}% <span className="text-muted text-[10px] font-normal">({s.wins}승 {s.losses}패)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-slate/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 ease-out"
                    style={{
                      width: `${s.winRate}%`,
                      backgroundColor: STRATEGY_COLORS[idx % STRATEGY_COLORS.length]
                    }}
                  ></div>
                </div>
              </div>
            ))}
            {strategies.length === 0 && <p className="text-muted text-center py-4">데이터가 없습니다.</p>}
          </div>
        </div>

        {/* 실수 유형 분석 */}
        <div className="card-fintech">
          <h2 className="text-fintech-lg font-fintech-bold mb-2">실수 유형 분석</h2>
          <div className="space-y-2">
            {mistakes.map((m, idx) => (
              <div key={m.type} className="space-y-2">
                <div className="flex justify-between text-fintech-xs font-medium px-0.5">
                  <span className="text-secondary">{m.type}</span>
                  <span className="loss-text font-bold">{m.count}건</span>
                </div>
                <div className="h-1.5 bg-slate/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(m.count / maxMistakeCount) * 100}%`,
                      backgroundColor: MISTAKE_COLORS[idx % MISTAKE_COLORS.length]
                    }}
                  ></div>
                </div>
              </div>
            ))}
            {mistakes.length === 0 && <p className="text-muted text-center py-4">데이터가 없습니다.</p>}
          </div>
        </div>
      </div>

      {/* 오답노트: 매도 완료 종목 복기 */}
      {/* 종목별 매도 내역과 매수 이유(메모)를 함께 확인할 수 있는 복기 섹션 */}
      <div className="card-fintech">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-fintech-lg font-fintech-bold">오답노트</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full">
            매도 완료 종목
          </span>
        </div>
        <p className="text-xs text-muted mb-3">
          매도한 종목의 거래 기록과 당시 메모를 복기합니다.
        </p>
        <WrongAnswerNote trades={trades} />
      </div>
    </div>
  );
};
