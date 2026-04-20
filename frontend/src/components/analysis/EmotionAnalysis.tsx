import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface EmotionStats {
  tag: string;
  totalPnl: number;
  avgPnl: number;
  count: number;
  winRate: number;
}

interface EmotionAnalysisProps {
  stats: EmotionStats[];
}

export const EmotionAnalysis: React.FC<EmotionAnalysisProps> = ({ stats }) => {
  const chartData = stats.map(s => ({
    name: s.tag,
    pnl: s.totalPnl,
    avg: s.avgPnl,
    count: s.count,
    winRate: s.winRate
  }));

  return (
    <div className="card-fintech mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-fintech-lg font-fintech-bold">감정 x 수익 상관 분석</h2>
        <span className="text-[10px] text-muted font-medium uppercase tracking-wider">Premium Analysis</span>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-ink/90 border border-white/10 p-3 rounded-lg shadow-2xl backdrop-blur-md">
                      <p className="text-xs font-bold text-white mb-2">{data.name}</p>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between gap-4">
                          <span className="text-white/60">총 손익</span>
                          <span className={data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {data.pnl.toLocaleString()}원
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-white/60">평균 손익</span>
                          <span>{Math.round(data.avg).toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-white/60">승률</span>
                          <span className="text-amber-400">{data.winRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-white/5 pt-1 mt-1">
                          <span className="text-white/60">거래 횟수</span>
                          <span className="text-white">{data.count}회</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.pnl >= 0 ? '#1D9E75' : '#F6465D'} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
          <p className="text-[9px] text-green-500/60 font-bold uppercase mb-1">최고 수익 감정</p>
          <p className="text-sm font-black text-green-400 truncate">{stats[0]?.tag || '-'}</p>
        </div>
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <p className="text-[9px] text-red-500/60 font-bold uppercase mb-1">최저 수익 감정</p>
          <p className="text-sm font-black text-red-400 truncate">{stats[stats.length - 1]?.tag || '-'}</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 col-span-2">
          <p className="text-[9px] text-amber-500/60 font-bold uppercase mb-1">인사이트</p>
          <p className="text-[11px] font-medium text-amber-200/80 leading-tight">
            {stats[0]?.tag} 상태에서 매매했을 때 가장 높은 성과를 거두었습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
