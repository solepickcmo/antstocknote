import React from 'react';

const STRATEGY_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#2563EB', '#4F46E5', '#7C3AED'];
const MISTAKE_COLORS  = ['#F6465D', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'];

interface AnalysisStatsProps {
  strategies: any[];
  mistakes: any[];
}

export const AnalysisStats: React.FC<AnalysisStatsProps> = ({ strategies, mistakes }) => {
  const maxMistakeCount = mistakes.length > 0 ? Math.max(...mistakes.map(m => m.count)) : 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 전략별 승률 */}
      <div className="card-fintech">
        <h2 className="text-fintech-lg font-fintech-bold mb-6">전략별 승률</h2>
        <div className="space-y-4">
          {strategies.map((s, idx) => (
            <div key={s.tag} className="space-y-2">
              <div className="flex justify-between text-fintech-xs font-medium px-0.5">
                <div>
                  <span className="text-secondary">{s.tag}</span>
                  <span className="ml-2 text-muted text-[10px]">{s.total}회 거래</span>
                  {s.total < 10 && <span className="ml-1 text-[10px] text-red-400">(표본 부족)</span>}
                </div>
                <span className="primary-text font-bold">
                  {s.winRate}% <span className="text-muted text-[10px] font-normal">({s.wins}승 {s.losses}패)</span>
                </span>
              </div>
              <div className="h-1.5 bg-slate/10 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${s.winRate}%`,
                    backgroundColor: STRATEGY_COLORS[idx % STRATEGY_COLORS.length]
                  }}
                ></div>
              </div>
            </div>
          ))}
          {strategies.length === 0 && <p className="text-muted text-center py-4">데이터가 없습니다.</p>}
        </div>
      </div>

      {/* 실수 유형 분석 */}
      <div className="card-fintech">
        <h2 className="text-fintech-lg font-fintech-bold mb-6">실수 유형 분석</h2>
        <div className="space-y-4">
          {mistakes.map((m, idx) => (
            <div key={m.type} className="space-y-2">
              <div className="flex justify-between text-fintech-xs font-medium px-0.5">
                <span className="text-secondary">{m.type}</span>
                <span className="loss-text font-bold">{m.count}건</span>
              </div>
              <div className="h-1.5 bg-slate/10 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${(m.count / maxMistakeCount) * 100}%`,
                    backgroundColor: MISTAKE_COLORS[idx % MISTAKE_COLORS.length]
                  }}
                ></div>
              </div>
            </div>
          ))}
          {mistakes.length === 0 && <p className="text-muted text-center py-4">데이터가 없습니다.</p>}
        </div>
      </div>
    </div>
  );
};
