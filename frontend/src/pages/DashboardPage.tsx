import React, { useEffect, useMemo } from 'react';
import { MetricCard } from '../components/MetricCard';
import { AnalysisSummary } from '../components/analysis/AnalysisSummary';
import { useTradeStore } from '../store/tradeStore';
import { useNotesCount } from '../hooks/useNotesCount';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DashboardPage: React.FC = () => {
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const trades = useTradeStore(state => state.trades);
  const getAnalysisStats = useTradeStore(state => state.getAnalysisStats);
  const getChartData = useTradeStore(state => state.getChartData);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const stats = useMemo(() => getAnalysisStats(), [trades, getAnalysisStats]);
  const chartData = useMemo(() => getChartData(7), [trades, getChartData]);

  const notesCount = useNotesCount();

  return (
    <div className="dashboard-page animate-fade-in pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="page-header py-8">
        <div>
          <h1 className="text-3xl font-black text-main">대시보드</h1>
          <p className="text-muted text-sm mt-1">내 매매 내역의 요약 정보를 확인하세요.</p>
        </div>
      </header>

      {/* Tier 1: 성과분석 요약 */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">성과 분석 요약</h3>
        </div>
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex md:grid md:grid-cols-5 gap-4 min-w-max md:min-w-full">
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
                title="평균 수익금" 
                value={`₩ ${stats.overallAvgPnl > 0 ? '+' : ''}${Math.round(stats.overallAvgPnl).toLocaleString()}`}
                trend={stats.overallAvgPnl > 0 ? 'up' : stats.overallAvgPnl < 0 ? 'down' : 'neutral'}
              />
            </div>
            <div className="w-[240px] md:w-auto">
              <MetricCard 
                title="총 거래 건수" 
                value={`${stats.totalTrades}건`}
                trend="neutral"
              />
            </div>
            <div className="w-[240px] md:w-auto">
              <MetricCard 
                title="오답 노트" 
                value={`${notesCount}건`}
                trend="neutral"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tier 2: 수익금 추이 */}
      <section className="card-fintech mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">수익금 추이 (최근 7일)</h3>
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
              <Tooltip 
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

      {/* Tier 3: 상세 분석 리포트 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-fintech p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">상세 성과 분석</h3>
            <p className="text-muted text-sm mb-6 leading-relaxed">
              전략별 승률, 감정 상태에 따른 수익 변화 등 데이터를 기반으로 매매 습관을 교정하세요.
            </p>
          </div>
          <AnalysisSummary 
            overallWinRate={stats.overallWinRate}
            overallAvgPnl={stats.overallAvgPnl}
            notesCount={notesCount}
            totalTradesCount={stats.totalTrades}
          />
        </div>

        <div className="card-fintech bg-primary/5 border-primary/20 p-8 flex flex-col justify-center items-center text-center">
          <div className="mb-6">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">Pro Report</span>
            <h4 className="text-xl font-black mt-2">상세 분석 리포트를 확인하세요</h4>
            <p className="text-muted text-sm mt-3 max-w-xs mx-auto">내 매매 전략의 강점과 약점을 데이터로 증명하고 수익성을 개선하세요.</p>
          </div>
          <a href="/analysis" className="btn-fintech-primary py-4 px-10 text-sm font-bold shadow-lg shadow-primary/25">리포트 전체 보기</a>
        </div>
      </section>
    </div>
  );
};
