import React, { useEffect } from 'react';
import { MetricCard } from '../components/MetricCard';
import { AnalysisPage } from './AnalysisPage';
import { useTradeStore } from '../store/tradeStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './DashboardPage.css';

const MOCK_CHART_DATA = [
  { date: '04-01', pnl: 120000 },
  { date: '04-02', pnl: -30000 },
  { date: '04-03', pnl: 450000 },
  { date: '04-04', pnl: 100000 },
  { date: '04-05', pnl: 600000 },
  { date: '04-06', pnl: 550000 },
  { date: '04-07', pnl: 800000 }
];

export const DashboardPage: React.FC = () => {
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const trades = useTradeStore(state => state.trades);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // 간이 자산 계산기
  const initialCapital = 10000000;
  const totalPnl = Math.floor(trades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0));
  const currentAsset = Math.floor(initialCapital + totalPnl);

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <h1>대시보드</h1>
        <p className="text-muted">내 매매 내역의 요약 정보를 확인하세요.</p>
      </header>

      <section className="metrics-grid">
        <MetricCard title="총 자산" value={`₩ ${currentAsset.toLocaleString()}`} subtitle="초기자금 1,000만원" />
        <MetricCard title="누적 수익금" value={`₩ ${totalPnl > 0 ? '+' : ''}${totalPnl.toLocaleString()}`} trend={totalPnl >= 0 ? 'up' : 'down'} />
        <MetricCard title="전체 매매 건수" value={`${trades.length}건`} />
      </section>

      <section className="chart-section glass-panel">
        <div className="section-header">
          <h3>수익금 추이 (최근 7일)</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={MOCK_CHART_DATA}>
              <defs>
                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₩${val/10000}만`} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              <Area type="monotone" dataKey="pnl" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorPnl)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="analysis-section" style={{ marginTop: '2rem' }}>
        <AnalysisPage />
      </section>
    </div>
  );
};
