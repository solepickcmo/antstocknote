import React, { useEffect, useMemo } from 'react';
import { useTradeStore } from '../store/tradeStore';
import { AnalysisSummary } from '../components/analysis/AnalysisSummary';
import { AnalysisStats } from '../components/analysis/AnalysisStats';
import { EmotionAnalysis } from '../components/analysis/EmotionAnalysis';
import { SubscriptionSection } from '../components/subscription/SubscriptionSection';
import { HelpTooltip } from '../components/ui/HelpTooltip';
// TierGate 제거: '매매패턴 분석'은 일반 기능으로 변경

export const AnalysisPage: React.FC = () => {
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const trades = useTradeStore(state => state.trades);
  const getAnalysisStats = useTradeStore(state => state.getAnalysisStats);
  
  // 분석 데이터는 Store에서 가져옴
  const stats = useMemo(() => getAnalysisStats(), [trades, getAnalysisStats]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return (
    <div className="analysis-page animate-fade-in pb-20">
      <header className="page-header analysis-header mb-2">
        <h1 className="flex items-center text-3xl font-black tracking-tight">
          매매패턴 분석
          <HelpTooltip content="나의 매매 습관과 전략별 수익률을 시각화하여 분석합니다." className="ml-2" iconSize={24} />
        </h1>
      </header>

      {/* 구독 상태 및 업그레이드 안내 */}
      <SubscriptionSection />

      {/* 요약 대시보드 */}
      <AnalysisSummary 
        overallWinRate={stats.overallWinRate}
        totalPnl={stats.totalPnl}
        totalAssets={stats.totalAssets}
        totalTradesCount={stats.totalTrades}
      />

      <div className="grid grid-cols-1 gap-2">
        <div className="xl:col-span-3">
          {/* 전략별 승률 + 오답노트 (매도 종목) */}
          <AnalysisStats 
            strategies={stats.strategyStats}
            mistakes={stats.mistakeStats}
            trades={trades}
          />
          {/* 감정 분석은 프리미엄 전용 유지 */}
          <EmotionAnalysis stats={stats.emotionStats || []} />
        </div>
      </div>
    </div>
  );
};
