import React, { useEffect, useMemo, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { AnalysisSummary } from '../components/analysis/AnalysisSummary';
import { useTradeStore } from '../store/tradeStore';
import { supabase } from '../api/supabase';
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

  // AnalysisPage와 동일한 쿼리 조건으로 오답노트 카운트 실시간 조회
  // content IS NOT NULL AND content != '' 조건 적용해 빈 노트는 제외
  const [notesCount, setNotesCount] = useState(0);
  useEffect(() => {
    const fetchNotesCount = async () => {
      const { count } = await supabase
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .not('content', 'is', null)
        .neq('content', '');
      setNotesCount(count ?? 0);
    };
    fetchNotesCount();
  }, []);

  return (
    <div className="dashboard-page animate-fade-in pb-20">
      <header className="page-header">
        <div>
          <h1 className="text-fintech-2xl font-fintech-black">대시보드</h1>
          <p className="text-muted text-fintech-xs">내 매매 내역의 요약 정보를 확인하세요.</p>
        </div>
      </header>

      <section className="metrics-grid mb-16 px-1">
        <MetricCard 
          title="누적 실현손익" 
          value={`₩ ${stats.totalPnl > 0 ? '+' : ''}${Math.round(stats.totalPnl).toLocaleString()}`} 
          subtitle="매도 완료된 거래 기준" 
          trend={stats.totalPnl >= 0 ? 'up' : 'down'} 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
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
                  formatter={(value: any) => [`₩ ${Math.round(Number(value)).toLocaleString()}`, '손익']}
                />
                <Area type="monotone" dataKey="pnl" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorPnl)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 요약 카드만 별도로 표시 */}
        <section className="flex flex-col gap-10">
          <div className="px-2">
             <h3 className="text-fintech-base font-fintech-bold mb-1">성과 분석 요약</h3>
             <p className="text-muted text-fintech-xs">최근 매매 성과를 한눈에 파악하세요.</p>
          </div>
          <AnalysisSummary 
             overallWinRate={stats.overallWinRate}
             overallAvgPnl={stats.overallAvgPnl}
             notesCount={notesCount}
          />
          <div className="card-fintech bg-primary/5 border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 mt-4">
            <div>
              <p className="text-fintech-xs primary-text font-black mb-1">상세 분석 리포트 (PRO)</p>
              <h4 className="text-fintech-sm font-bold">내 매매 전략의 강점과 약점을 데이터로 증명하세요.</h4>
            </div>
            <a href="/analysis" className="btn-fintech-primary py-3.5 px-8 text-sm shadow-lg shadow-primary/25">리뷰하기</a>
          </div>
        </section>
      </div>
    </div>
  );
};
