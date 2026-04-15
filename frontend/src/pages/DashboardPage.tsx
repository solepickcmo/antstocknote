import React, { useEffect } from 'react';
import { MetricCard } from '../components/MetricCard';
import { AnalysisPage } from './AnalysisPage';
import { useTradeStore } from '../store/tradeStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './DashboardPage.css';

import { format, subDays, addDays } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const trades = useTradeStore(state => state.trades);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // SRS FR-030: 초기자금은 별도로 관리하지 않으므로 누적 실현손익만 표시
  // 매매 내역이 없으면 0원, 있으면 누적 PnL 합계를 총 자산으로 표시한다.
  const totalPnl = Math.floor(trades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0));
  const currentAsset = totalPnl;


  // 차트 데이터 렌더링 (오늘 기준 전후 3일, 총 7일)
  const chartData = React.useMemo(() => {
    const today = new Date();
    const result = [];
    
    // 날짜별 pnl 맵 생성
    const pnlMap: Record<string, number> = {};
    trades.forEach(trade => {
      const dateStr = format(new Date(trade.traded_at), 'MM-dd');
      pnlMap[dateStr] = (pnlMap[dateStr] || 0) + (Number(trade.pnl) || 0);
    });

    for (let i = -3; i <= 3; i++) {
      const currentDate = (i < 0) ? subDays(today, Math.abs(i)) : addDays(today, i);
      const dateStr = format(currentDate, 'MM-dd');
      result.push({
        date: dateStr,
        pnl: pnlMap[dateStr] || 0 // 데이터 없으면 0원
      });
    }
    return result;
  }, [trades]);

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <h1>대시보드</h1>
        <p className="text-muted">내 매매 내역의 요약 정보를 확인하세요.</p>
      </header>

      <section className="metrics-grid">
        <MetricCard title="누적 실현손익" value={`₩ ${currentAsset > 0 ? '+' : ''}${currentAsset.toLocaleString()}`} subtitle="매도 완료된 거래 기준" trend={currentAsset >= 0 ? 'up' : 'down'} />
        <MetricCard title="누적 수익금" value={`₩ ${totalPnl > 0 ? '+' : ''}${totalPnl.toLocaleString()}`} trend={totalPnl >= 0 ? 'up' : 'down'} />
        <MetricCard title="전체 매매 건수" value={`${trades.length}건`} />
      </section>

      <section className="chart-section glass-panel">
        <div className="section-header">
          <h3>수익금 추이 (최근 7일)</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
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
                formatter={(value: any) => [`₩ ${Number(value).toLocaleString()}`, '손익']}
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
