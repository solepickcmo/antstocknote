import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../api/supabase';
import { useTradeStore } from '../store/tradeStore';
import { AnalysisSummary } from '../components/analysis/AnalysisSummary';
import { AnalysisStats } from '../components/analysis/AnalysisStats';
import { EmotionAnalysis } from '../components/analysis/EmotionAnalysis';
import { NoteModal } from '../components/NoteModal';
import { SubscriptionSection } from '../components/subscription/SubscriptionSection';
import { TierGate } from '../components/common/TierGate';
import { HelpTooltip } from '../components/ui/HelpTooltip';

interface Note {
  id: string;
  trade_id: string;
  content: string;
  created_at: string;
  trades?: {
    name: string;
    ticker: string;
    traded_at: string;
    strategy_tag: string | null;
  };
}

export const AnalysisPage: React.FC = () => {
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const trades = useTradeStore(state => state.trades);
  const getAnalysisStats = useTradeStore(state => state.getAnalysisStats);
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [visibleNotesCount, setVisibleNotesCount] = useState(2);

  // 분석 데이터는 Store에서 가져옴
  const stats = useMemo(() => getAnalysisStats(), [trades, getAnalysisStats]);

  const fetchNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*, trades(name, ticker, traded_at, strategy_tag)')
        // 대시보드 쪿어리와 동일한 조건 적용 — 빈 content 노트 제외
        .not('content', 'is', null)
        .neq('content', '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes((data as Note[]) || []);
    } catch (err) {
      console.error('오답 노트 조회 실패:', err);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    fetchNotes();
  }, [fetchTrades]);

  const visibleNotes = notes.slice(0, visibleNotesCount);

  return (
    <div className="analysis-page animate-fade-in pb-20">
      <header className="page-header analysis-header mb-2">
        <h1 className="text-fintech-2xl font-fintech-black flex items-center">
          매매 복기 / 분석
          <HelpTooltip content="전략 및 감정 태그별 승률을 분석하고, 오답 노트를 작성하여 투자 습관을 개선할 수 있는 공간입니다." iconSize={24} className="ml-2" />
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

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={() => fetchNotes()}
      />
    </div>
  );
};
