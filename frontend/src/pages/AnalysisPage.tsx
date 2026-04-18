import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../api/supabase';
import { useTradeStore } from '../store/tradeStore';
import { AnalysisSummary } from '../components/analysis/AnalysisSummary';
import { AnalysisStats } from '../components/analysis/AnalysisStats';
import { NoteModal } from '../components/NoteModal';

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
      <header className="page-header analysis-header mb-12">
        <h1 className="text-fintech-2xl font-fintech-black">매매 복기 / 분석</h1>
      </header>

      {/* 요약 대시보드 (컴포넌트화) */}
      <AnalysisSummary 
        overallWinRate={stats.overallWinRate}
        overallAvgPnl={stats.overallAvgPnl}
        notesCount={notes.length}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 통계 섹션 (컴포넌트화) */}
        <div className="xl:col-span-2 space-y-8">
          <AnalysisStats 
            strategies={stats.strategyStats}
            mistakes={stats.mistakeStats}
          />
        </div>

        {/* 오답 노트 섹션 */}
        <div className="space-y-6">
          <section className="notes-section">
            <div className="flex justify-between items-center mb-8 bg-primary/5 p-4 rounded-xl border border-primary/10">
              <h2 className="text-fintech-base font-fintech-black primary-text">오답 노트</h2>
              <button 
                className="btn-fintech-primary py-2 px-4 text-xs shadow-md shadow-primary/10" 
                onClick={() => setIsNoteModalOpen(true)}
              >
                노트 작성하기
              </button>
            </div>

            <div className="space-y-4">
              {isLoadingNotes ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-24 bg-card rounded-xl"></div>)}
                </div>
              ) : (
                <>
                  {visibleNotes.map(n => (
                    <div className="card-fintech group hover:border-primary/40 hover:shadow-lg transition-all p-6 bg-white" key={n.id}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-[10px] font-extrabold border border-primary/20 tracking-tight">
                          {n.trades?.strategy_tag || '태그 없음'}
                        </span>
                        <span className="text-[10px] text-muted font-medium">
                          {n.trades?.traded_at ? new Date(n.trades.traded_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <h4 className="text-fintech-base font-fintech-black mb-3">{n.trades?.name}</h4>
                      <p className="text-fintech-xs text-secondary leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                        {n.content}
                      </p>
                    </div>
                  ))}
                  {notes.length === 0 && <p className="text-muted text-center py-8">기록된 노트가 없습니다.</p>}
                </>
              )}
            </div>

            {notes.length > visibleNotesCount && (
              <button
                className="w-full mt-4 py-2 text-fintech-xs text-muted hover:text-primary transition-colors flex items-center justify-center gap-2"
                onClick={() => setVisibleNotesCount(prev => prev + 4)}
              >
                더 보기 ↓
              </button>
            )}
          </section>
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
