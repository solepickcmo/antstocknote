import React, { useEffect, useMemo } from 'react';
import { useTradeStore } from '../store/tradeStore';
import { AnalysisSummary } from '../components/analysis/AnalysisSummary';
import { AnalysisStats } from '../components/analysis/AnalysisStats';
import { EmotionAnalysis } from '../components/analysis/EmotionAnalysis';
import { SubscriptionSection } from '../components/subscription/SubscriptionSection';
import { TierGate } from '../components/common/TierGate';
import { HelpTooltip } from '../components/ui/HelpTooltip';

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
        <h1 className="text-fintech-2xl font-fintech-black flex items-center">
          매매 복기 / 분석
          <HelpTooltip content="전략 및 감정 태그별 승률을 분석하여 투자 습관을 개선할 수 있는 공간입니다." iconSize={24} className="ml-2" />
        </h1>
      </header>

      {/* 구독 상태 및 업그레이드 안내 */}
      <SubscriptionSection />

      {/* 요약 대시보드 (컴포넌트화) */}
      <AnalysisSummary 
        overallWinRate={stats.overallWinRate}
        totalPnl={stats.totalPnl}
        totalAssets={stats.totalAssets}
        totalTradesCount={stats.totalTrades}
      />

      <div className="grid grid-cols-1 gap-2">
        {/* 분석 요약 섹션 */}
        <div className="xl:col-span-3">
          <AnalysisStats 
            strategies={stats.strategyStats}
            mistakes={stats.mistakeStats}
          />
          <TierGate feature="emotion_analysis">
            <EmotionAnalysis stats={stats.emotionStats || []} />
          </TierGate>
        </div>
      </div>
    </div>
  );
};
