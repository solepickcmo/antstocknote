import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { NoteModal } from '../components/NoteModal';
import './AnalysisPage.css';

interface StrategyStat {
  tag: string;
  total: number;
  winRate: number;
  avgPnl: number;
}

interface MistakeStat {
  type: string;
  count: number;
}

interface Note {
  id: string;
  trade_id: string;
  content: string;
  created_at: string;
  // trades 테이블 조인으로 가져오는 필드
  trades?: {
    name: string;
    ticker: string;
    traded_at: string;
    strategy_tag: string | null;
  };
}

// 색상 팔레트: 전략은 파랑/초록계열, 실수는 붉은/노란계열
const STRATEGY_COLORS = ['#F0B90B', '#F8D33A', '#D49100', '#FFD700', '#B0800B', '#E6A23C'];
const MISTAKE_COLORS  = ['#F6465D', '#D9304E', '#FF3B5C', '#CF304A', '#EB6179', '#AE263E'];

export const AnalysisPage: React.FC = () => {
  const [strategies, setStrategies] = useState<StrategyStat[]>([]);
  const [mistakes, setMistakes] = useState<MistakeStat[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [visibleNotesCount, setVisibleNotesCount] = useState(2);

  // Supabase에서 직접 집계: 별도 백엔드 없이 trades 테이블을 기반으로 분석
  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);

      // 매도 거래 전체 조회 (RLS 자동 적용)
      const { data: sellTrades, error: tradesErr } = await supabase
        .from('trades')
        .select('*')
        .eq('type', 'sell');

      if (tradesErr) throw tradesErr;

      // 전략별 승률 집계 (클라이언트 사이드)
      const strategyMap = new Map<string, { total: number; wins: number; pnlSum: number }>();
      (sellTrades || []).forEach(t => {
        const tag = t.strategy_tag || '태그 없음';
        if (!strategyMap.has(tag)) {
          strategyMap.set(tag, { total: 0, wins: 0, pnlSum: 0 });
        }
        const s = strategyMap.get(tag)!;
        s.total++;
        if ((t.pnl ?? 0) > 0) s.wins++;
        s.pnlSum += Number(t.pnl ?? 0);
      });

      const strategyStats: StrategyStat[] = Array.from(strategyMap.entries()).map(([tag, s]) => ({
        tag,
        total: s.total,
        winRate: s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0,
        avgPnl: s.total > 0 ? Math.round(s.pnlSum / s.total) : 0,
      }));
      setStrategies(strategyStats);

      // 실수 유형: 손실 거래의 전략 태그 기준으로 집계 (SDD FR-062)
      const mistakeMap = new Map<string, number>();
      (sellTrades || [])
        .filter(t => (t.pnl ?? 0) < 0)
        .forEach(t => {
          const tag = t.strategy_tag || '태그 없음';
          mistakeMap.set(tag, (mistakeMap.get(tag) ?? 0) + 1);
        });

      const mistakeStats: MistakeStat[] = Array.from(mistakeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
      setMistakes(mistakeStats);

      // 오답 노트 조회 (trades 정보 함께 조인)
      const { data: notesData, error: notesErr } = await supabase
        .from('notes')
        .select('*, trades(name, ticker, traded_at, strategy_tag)')
        .order('created_at', { ascending: false });

      if (notesErr) throw notesErr;
      setNotes((notesData as Note[]) || []);

    } catch (err) {
      console.error('분석 데이터 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">데이터를 집계 중입니다...</div>;
  }

  // 상단 요약 계산
  const totalTrades = strategies.reduce((acc, s) => acc + s.total, 0);
  const totalWins = strategies.reduce((acc, s) => acc + Math.round(s.total * (s.winRate / 100)), 0);
  const overallWinRate = totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(1) : '0.0';
  const totalPnlSum = strategies.reduce((acc, s) => acc + (s.avgPnl * s.total), 0);
  const overallAvgPnl = totalTrades > 0 ? Math.round(totalPnlSum / totalTrades) : 0;

  const maxMistakeCount = mistakes.length > 0 ? Math.max(...mistakes.map(m => m.count)) : 1;
  const visibleNotes = notes.slice(0, visibleNotesCount);

  return (
    <div className="analysis-page animate-fade-in">
      <header className="page-header analysis-header">
        <h1>매매 복기 / 분석</h1>
      </header>

      {/* 요약 대시보드 */}
      <div className="summary-cards">
        <div className="summary-card glass-panel">
          <h3>전체 승률</h3>
          <p className="summary-val">{overallWinRate}%</p>
        </div>
        <div className="summary-card glass-panel">
          <h3>평균수익률</h3>
          <p className={`summary-val ${overallAvgPnl > 0 ? 'profit' : overallAvgPnl < 0 ? 'loss' : ''}`}>
            {overallAvgPnl > 0 ? '+' : ''}{overallAvgPnl.toLocaleString()}
          </p>
        </div>
        <div className="summary-card glass-panel">
          <h3>오답 노트</h3>
          <p className="summary-val">{notes.length}건</p>
        </div>
      </div>

      <div className="analysis-grid">
        {/* 좌측: 전략별 승률 / 실수 유형 */}
        <div className="analysis-col">
          <section className="stats-section">
            <h2>전략별 승률</h2>
            <div className="bar-list">
              {strategies.map((s, idx) => (
                <div className="bar-row" key={s.tag}>
                  <span className="bar-label">{s.tag}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${s.winRate}%`,
                        backgroundColor: STRATEGY_COLORS[idx % STRATEGY_COLORS.length]
                      }}
                    ></div>
                  </div>
                  <span className="bar-value">{s.winRate}%</span>
                </div>
              ))}
              {strategies.length === 0 && <p className="empty-msg text-sm">데이터가 없습니다.</p>}
            </div>
          </section>

          <section className="stats-section">
            <h2>실수 유형 분석</h2>
            <div className="bar-list">
              {mistakes.map((m, idx) => (
                <div className="bar-row" key={m.type}>
                  <span className="bar-label">{m.type}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(m.count / maxMistakeCount) * 100}%`,
                        backgroundColor: MISTAKE_COLORS[idx % MISTAKE_COLORS.length]
                      }}
                    ></div>
                  </div>
                  <span className="bar-value">{m.count}건</span>
                </div>
              ))}
              {mistakes.length === 0 && <p className="empty-msg text-sm">데이터가 없습니다.</p>}
            </div>
          </section>
        </div>

        {/* 우측: 오답 노트 */}
        <div className="analysis-col">
          <section className="notes-section">
            <div className="notes-header">
              <h2>오답 노트</h2>
              <button className="btn-add-note" onClick={() => setIsNoteModalOpen(true)}>작성하기</button>
            </div>

            <div className="notes-list">
              {visibleNotes.map(n => (
                <div className="note-card glass-panel" key={n.id}>
                  <div className="note-header">
                    <span className="note-badge">{n.trades?.strategy_tag || '태그 없음'}</span>
                    <span className="note-meta">
                      {n.trades?.name} · {n.trades?.traded_at
                        ? new Date(n.trades.traded_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })
                        : ''}
                    </span>
                  </div>
                  <p className="note-content">{n.content}</p>
                </div>
              ))}
              {notes.length === 0 && <p className="empty-msg">기록된 오답 노트가 없습니다.</p>}
            </div>

            {notes.length > visibleNotesCount && (
              <div className="more-btn-container">
                <button
                  className="btn-more"
                  onClick={() => setVisibleNotesCount(prev => prev + 2)}
                >
                  <span className="more-icon">↓</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={() => fetchAnalysis()}
      />
    </div>
  );
};
