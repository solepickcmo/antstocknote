import React from 'react';

interface AnalysisSummaryProps {
  overallWinRate: string;
  totalPnl: number;
  totalAssets: number;
  totalTradesCount: number;
}

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ 
  overallWinRate, 
  totalPnl, 
  totalAssets,
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
        <h3 className="label-fintech">누적 실현손익</h3>
        <p className={`text-fintech-3xl font-fintech-black ${totalPnl > 0 ? 'profit-text' : totalPnl < 0 ? 'loss-text' : ''}`}>
          {totalPnl > 0 ? '+' : ''}{Math.round(totalPnl).toLocaleString()}
        </p>
      </div>
      <div className="card-fintech flex flex-col items-center justify-center py-8">
        <h3 className="label-fintech">보유 총 자산 (원금 + 실현손익)</h3>
        <p className="text-fintech-3xl font-fintech-black">{Math.round(totalAssets).toLocaleString()}</p>
      </div>
    </div>
  );
};
