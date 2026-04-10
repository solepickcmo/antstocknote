import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
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
  tradeId: string;
  content: string;
  createdAt: string;
  stockName: string;
  ticker: string;
  tradeDate: string;
  strategyTag: string;
}

// 겹치지 않는 색상 부여 (전략은 주로 푸른/초록/보라계열, 실수는 붉은/노란계열)
const STRATEGY_COLORS = ['#2563eb', '#3b82f6', '#10b981', '#14b8a6', '#8b5cf6', '#6366f1'];
const MISTAKE_COLORS  = ['#dc2626', '#ef4444', '#ea580c', '#f59e0b', '#eab308', '#d97706'];

export const AnalysisPage: React.FC = () => {
  const [strategies, setStrategies] = useState<StrategyStat[]>([]);
  const [mistakes, setMistakes] = useState<MistakeStat[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [visibleNotesCount, setVisibleNotesCount] = useState(2);

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      const [stratRes, mistRes, notesRes] = await Promise.all([
        apiClient.get('/analysis/strategy'),
        apiClient.get('/analysis/mistakes'),
        apiClient.get('/analysis/notes')
      ]);
      setStrategies(stratRes.data.strategies);
      setMistakes(mistRes.data.mistakes);
      setNotes(notesRes.data.notes);
    } catch (err) {
      console.error('Failed to fetch analysis stats', err);
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

  // 상단 데시보드 계산
  const totalTrades = strategies.reduce((acc, s) => acc + s.total, 0);
  const totalWins = strategies.reduce((acc, s) => acc + Math.round(s.total * (s.winRate / 100)), 0);
  const overallWinRate = totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(1) : '0.0';
  
  const totalPnlSum = strategies.reduce((acc, s) => acc + (s.avgPnl * s.total), 0);
  const overallAvgPnl = totalTrades > 0 ? Math.round(totalPnlSum / totalTrades) : 0;

  // 최대값 계산 (바 길이 렌더링용)
  const maxMistakeCount = mistakes.length > 0 ? Math.max(...mistakes.map(m => m.count)) : 1;

  const visibleNotes = notes.slice(0, visibleNotesCount);

  return (
    <div className="analysis-page animate-fade-in">
      <header className="page-header analysis-header">
        <h1>매매 복기 / 분석</h1>
      </header>

      {/* 요약 데시보드 */}
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
        {/* 좌측: 통계 (전략별 승률 / 실수 유형 분석) */}
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
                    <span className="note-badge">{n.strategyTag || '태그 없음'}</span>
                    <span className="note-meta">
                      {n.stockName} · {new Date(n.tradeDate).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
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
