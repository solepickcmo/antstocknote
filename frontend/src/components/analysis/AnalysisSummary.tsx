import React from 'react';

interface AnalysisSummaryProps {
  overallWinRate: string;
  overallAvgPnl: number;
  notesCount: number;
  totalTradesCount: number;
}

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ 
  overallWinRate, 
  overallAvgPnl, 
  notesCount,
  totalTradesCount
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      <div className="card-fintech flex flex-col items-center justify-center py-6 md:py-8">
        <h3 className="label-fintech">총 거래 건수</h3>
        <p className="text-fintech-3xl font-fintech-black">{totalTradesCount}건</p>
      </div>
      <div className="card-fintech flex flex-col items-center justify-center py-8">
        <h3 className="label-fintech">전체 승률</h3>
        <p className="text-fintech-3xl font-fintech-black primary-text">{overallWinRate}%</p>
      </div>
      <div className="card-fintech flex flex-col items-center justify-center py-8">
        <h3 className="label-fintech">평균 수익금</h3>
        <p className={`text-fintech-3xl font-fintech-black ${overallAvgPnl > 0 ? 'profit-text' : overallAvgPnl < 0 ? 'loss-text' : ''}`}>
          {overallAvgPnl > 0 ? '+' : ''}{Math.round(overallAvgPnl).toLocaleString()}
        </p>
      </div>
      <div className="card-fintech flex flex-col items-center justify-center py-8">
        <h3 className="label-fintech">오답 노트</h3>
        <p className="text-fintech-3xl font-fintech-black">{notesCount}건</p>
      </div>
    </div>
  );
};
