import React, { useEffect, useMemo } from 'react';
import { MetricCard } from '../components/MetricCard';
import { AnalysisSummary } from '../components/analysis/AnalysisSummary';
import { useTradeStore } from '../store/tradeStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DashboardPage: React.FC = () => {
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const trades = useTradeStore(state => state.trades);
  const getAnalysisStats = useTradeStore(state => state.getAnalysisStats);
  const getChartData = useTradeStore(state => state.getChartData);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Store에서 분석 데이터 가져오기
  const stats = useMemo(() => getAnalysisStats(), [trades, getAnalysisStats]);
  const chartData = useMemo(() => getChartData(7), [trades, getChartData]);

  return (
    <div className="dashboard-page animate-fade-in pb-20">
      <header className="page-header">
        <div>
          <h1 className="text-fintech-2xl font-fintech-black">대시보드</h1>
          <p className="text-muted text-fintech-xs">내 매매 내역의 요약 정보를 확인하세요.</p>
        </div>
      </header>

      <section className="metrics-grid mb-8">
        <MetricCard 
          title="누적 실현손익" 
          value={`₩ ${stats.totalPnl > 0 ? '+' : ''}${stats.totalPnl.toLocaleString()}`} 
          subtitle="매도 완료된 거래 기준" 
          trend={stats.totalPnl >= 0 ? 'up' : 'down'} 
        />
        <MetricCard 
          title="전체 매매 건수" 
          value={`${stats.totalTrades}건`} 
          subtitle="전체 매수/매도 합계"
        />
        <MetricCard 
          title="평균 수익금" 
          value={`₩ ${stats.overallAvgPnl > 0 ? '+' : ''}${stats.overallAvgPnl.toLocaleString()}`} 
          trend={stats.overallAvgPnl >= 0 ? 'up' : 'down'}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 차트 섹션 */}
        <section className="card-fintech">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-fintech-base font-fintech-bold">수익금 추이 (최근 7일)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tick={{dy: 10}} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/10000}만`} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-soft)' }}
                  itemStyle={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '600' }}
                  labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '11px' }}
                  formatter={(value: any) => [`₩ ${Number(value).toLocaleString()}`, '손익']}
                />
                <Area type="monotone" dataKey="pnl" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorPnl)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 요약 카드만 별도로 표시 */}
        <section className="space-y-6">
          <h3 className="text-fintech-base font-fintech-bold px-2">성과 분석 요약</h3>
          <AnalysisSummary 
             overallWinRate={stats.overallWinRate}
             overallAvgPnl={stats.overallAvgPnl}
             notesCount={0} // 대시보드에서는 오답 노트를 fetching하지 않으므로 0 혹은 Store 연동 필요
          />
          <div className="card-fintech bg-primary/5 border-primary/20 flex items-center justify-between">
            <div>
              <p className="text-fintech-xs primary-text font-bold mb-1">상세 분석 리포트</p>
              <h4 className="text-fintech-sm font-bold">내 매매 전략의 강점과 약점을 확인하세요.</h4>
            </div>
            <a href="/analysis" className="btn-fintech-primary py-2 px-6 text-xs">리뷰하기</a>
          </div>
        </section>
      </div>
    </div>
  );
};
