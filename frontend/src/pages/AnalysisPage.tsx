import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { apiClient } from '../api/client';
import './AnalysisPage.css';

interface StrategyStat {
  tag: string;
  total: number;
  winRate: number;
  avgPnl: number;
}

interface EmotionStat {
  tag: string;
  total: number;
  avgPnl: number;
}

interface MistakeStat {
  type: string;
  count: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export const AnalysisPage: React.FC = () => {
  const accountId = '1'; // MVP Hardcoded
  const [strategies, setStrategies] = useState<StrategyStat[]>([]);
  const [emotions, setEmotions] = useState<EmotionStat[]>([]);
  const [mistakes, setMistakes] = useState<MistakeStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const [stratRes, emoRes, mistRes] = await Promise.all([
          apiClient.get('/analysis/strategy', { params: { accountId } }),
          apiClient.get('/analysis/emotion', { params: { accountId } }),
          apiClient.get('/analysis/mistakes', { params: { accountId } })
        ]);
        setStrategies(stratRes.data.strategies);
        setEmotions(stratRes.data.emotions || emoRes.data.emotions);
        setMistakes(mistRes.data.mistakes);
      } catch (err) {
        console.error('Failed to fetch analysis stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">데이터를 집계 중입니다...</div>;
  }

  return (
    <div className="analysis-page animate-fade-in">
      <header className="page-header">
        <h1>통계 및 분석</h1>
        <p className="text-muted">내 매매 패턴과 감정 상태를 객관적으로 복기해보세요.</p>
      </header>

      <div className="analysis-grid">
        {/* 전략별 승률 */}
        <section className="analysis-card glass-panel">
          <h2>전략별 성과</h2>
          {strategies.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={strategies} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="tag" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip wrapperClassName="dark-tooltip" />
                  <Bar dataKey="winRate" name="승률 (%)" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="stat-table">
                <table>
                  <thead><tr><th>전략</th><th>매매 수</th><th>승률</th><th>평균 수익</th></tr></thead>
                  <tbody>
                    {strategies.map(s => (
                      <tr key={s.tag}>
                        <td>{s.tag}</td>
                        <td>{s.total}건</td>
                        <td className={s.winRate >= 50 ? 'profit-text' : 'loss-text'}>{s.winRate}%</td>
                        <td>{s.avgPnl > 0 ? '+' : ''}{s.avgPnl.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : <p className="empty-msg">기록된 전략 태그 데이터가 없습니다.</p>}
        </section>

        {/* 감정별 분포 */}
        <section className="analysis-card glass-panel">
          <h2>자주 느끼는 감정 (비중)</h2>
          {emotions.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={emotions} dataKey="total" nameKey="tag" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {emotions.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip wrapperClassName="dark-tooltip" />
                </PieChart>
              </ResponsiveContainer>
              <ul className="emotion-legend">
                {emotions.map((e, idx) => (
                  <li key={e.tag}>
                    <span className="color-dot" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="legend-label">{e.tag}</span>
                    <span className="legend-val">{e.total}건 (Avg: {e.avgPnl > 0 ? '+' : ''}{e.avgPnl.toLocaleString()})</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : <p className="empty-msg">기록된 감정 태그 데이터가 없습니다.</p>}
        </section>

        {/* 오답 분량 */}
        <section className="analysis-card glass-panel full-width">
          <h2>자주 하는 실수 (오답 노트)</h2>
          {mistakes.length > 0 ? (
            <div className="mistake-tags">
              {mistakes.map((m, idx) => (
                <div key={m.type} className="mistake-item">
                  <span className="mistake-rank">Top {idx + 1}</span>
                  <span className="mistake-name">{m.type}</span>
                  <span className="mistake-count">{m.count}회</span>
                </div>
              ))}
            </div>
          ) : <p className="empty-msg">기록된 오답 노트 데이터가 없습니다.</p>}
        </section>
      </div>
    </div>
  );
};
