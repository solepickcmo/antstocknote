import React, { useEffect, useMemo } from 'react';
import { MetricCard } from '../components/MetricCard';
import { useTradeStore } from '../store/tradeStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { HelpTooltip } from '../components/ui/HelpTooltip';

export const DashboardPage: React.FC = () => {
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const trades = useTradeStore(state => state.trades);
  const exchangeRate = useTradeStore(state => state.exchangeRate);
  const fetchExchangeRate = useTradeStore(state => state.fetchExchangeRate);
  const getAnalysisStats = useTradeStore(state => state.getAnalysisStats);
  const getChartData = useTradeStore(state => state.getChartData);

  useEffect(() => {
    fetchTrades();
    fetchExchangeRate();
  }, [fetchTrades, fetchExchangeRate]);

  const stats = useMemo(() => getAnalysisStats(), [trades, getAnalysisStats]);
  const chartData = useMemo(() => getChartData(7), [trades, getChartData]);

  return (
    <div className="dashboard-page animate-fade-in pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="page-header py-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-black text-main flex items-center">
            대시보드
            <HelpTooltip content="투자 성과와 자산 현황을 한눈에 확인할 수 있는 요약 화면입니다." iconSize={24} className="ml-2" />
          </h1>
          <p className="text-muted text-sm mt-1">내 매매 내역의 요약 정보를 확인하세요.</p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3">
          <span className="text-[10px] font-black text-primary px-1.5 py-0.5 bg-primary/10 rounded-md uppercase tracking-wider">Exchange</span>
          <span className="text-sm font-bold text-main">USD/KRW</span>
          <span className="text-lg font-black text-primary">₩ {exchangeRate.toLocaleString()}</span>
        </div>
      </header>

      {/* Tier 1: 성과분석 요약 */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center">
            성과 분석 요약
            <HelpTooltip content="지금까지 기록한 매매 데이터를 바탕으로 계산된 종합 성과입니다." className="ml-1" />
          </h3>
        </div>
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex md:grid md:grid-cols-4 gap-4 min-w-max md:min-w-full">
            <div className="w-[240px] md:w-auto">
              <MetricCard 
                title="보유 총 자산" 
                value={`₩ ${Math.round(stats.totalAssets).toLocaleString()}`} 
                trend="neutral"
                subtitle="투자원금 + 실현손익"
              />
            </div>
            <div className="w-[240px] md:w-auto">
              <MetricCard 
                title="누적 실현손익" 
                value={`₩ ${stats.totalPnl > 0 ? '+' : ''}${Math.round(stats.totalPnl).toLocaleString()}`} 
                trend={stats.totalPnl > 0 ? 'up' : stats.totalPnl < 0 ? 'down' : 'neutral'}
              />
            </div>
            <div className="w-[240px] md:w-auto">
              <MetricCard 
                title="전체 승률" 
                value={`${stats.overallWinRate}%`}
                trend="neutral"
              />
            </div>
            <div className="w-[240px] md:w-auto">
              <MetricCard 
                title="총 거래 건수" 
                value={`${stats.totalTrades}건`}
                trend="neutral"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tier 2: 수익금 추이 */}
      <section className="card-fintech mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center">
            수익금 추이 (최근 7일)
            <HelpTooltip content="최근 일주일간의 일별 누적 수익금 흐름을 시각적으로 보여줍니다." className="ml-1" />
          </h3>
        </div>
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tick={{dy: 10}} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/10000}만`} />
              <RechartsTooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}
                itemStyle={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '600' }}
                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '11px' }}
                formatter={(value: any) => [`₩ ${Math.round(Number(value)).toLocaleString()}`, '손익']}
              />
              <Area type="monotone" dataKey="pnl" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorPnl)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
};
