import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';
import { supabase } from '../../api/supabase';

export const GoalReverseCalculator: React.FC = () => {
  const [goalAmount, setGoalAmount] = useState<string>('');
  const [winRate, setWinRate] = useState<number>(50);
  const [avgProfit, setAvgProfit] = useState<string>('');
  const [avgLoss, setAvgLoss] = useState<string>('');
  const [tradeCount, setTradeCount] = useState<number>(20);
  const [isLoading, setIsLoading] = useState(false);

  // 내 통계 불러오기 (최근 6개월)
  const fetchMyStats = async () => {
    setIsLoading(true);
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data, error } = await supabase
        .from('trades')
        .select('pnl, type')
        .eq('type', 'sell')
        .gte('traded_at', sixMonthsAgo.toISOString());

      if (error) throw error;

      if (!data || data.length === 0) {
        alert('최근 6개월간의 매도 기록이 없습니다. 먼저 매매를 기록해주세요.');
        return;
      }

      const wins = data.filter(t => (t.pnl || 0) > 0);
      const losses = data.filter(t => (t.pnl || 0) < 0);

      const winRateVal = Math.round((wins.length / data.length) * 100);
      const avgProfitVal = wins.length > 0 
        ? Math.round(wins.reduce((acc, curr) => acc + (curr.pnl || 0), 0) / wins.length) 
        : 0;
      const avgLossVal = losses.length > 0 
        ? Math.round(Math.abs(losses.reduce((acc, curr) => acc + (curr.pnl || 0), 0) / losses.length)) 
        : 0;

      // 1~99 범위 제한
      setWinRate(Math.max(1, Math.min(99, winRateVal)));
      setAvgProfit(avgProfitVal.toString());
      setAvgLoss(avgLossVal.toString());
    } catch (err: any) {
      console.error('통계 불러오기 실패:', err);
      alert('통계를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const results = useMemo(() => {
    const goal = parseInt(goalAmount.replace(/,/g, '')) || 0;
    const profit = parseInt(avgProfit) || 0;
    const loss = parseInt(avgLoss) || 0;
    const wr = winRate / 100;

    // 기대값 (EV) = (승률 * 평균수익) - (패배율 * 평균손실)
    const ev = Math.round((wr * profit) - ((1 - wr) * loss));
    
    // 필요 매매 횟수 = 목표 / EV
    const requiredTrades = ev > 0 ? Math.ceil(goal / ev) : null;
    
    // 예상 월 수익 = 설정된 회수 * EV
    const projectedIncome = tradeCount * ev;

    // 달성률 = 예상 수익 / 목표 수익
    const progress = goal > 0 ? Math.min(100, Math.max(0, (projectedIncome / goal) * 100)) : 0;

    return { ev, requiredTrades, projectedIncome, progress };
  }, [goalAmount, winRate, avgProfit, avgLoss, tradeCount]);

  const formatNumber = (val: number) => Math.round(val).toLocaleString('ko-KR');

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      {/* 입력 섹션 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Target className="text-primary" size={20} /> 목표 설정
          </h3>
          <button 
            onClick={fetchMyStats}
            disabled={isLoading}
            className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {isLoading ? '불러오는 중...' : '내 통계 불러오기 (6개월)'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">월 목표 수익금 (원)</label>
            <input
              type="text"
              aria-label="월 목표 수익금 입력"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-lg"
              placeholder="예: 2,000,000"
              value={goalAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setGoalAmount(val ? parseInt(val).toLocaleString() : '');
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">평균 수익금 (원)</label>
              <input
                type="number"
                aria-label="평균 수익금 입력"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all font-semibold"
                placeholder="0"
                value={avgProfit}
                onChange={(e) => setAvgProfit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">평균 손실금 (원)</label>
              <input
                type="number"
                aria-label="평균 손실금 입력"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all font-semibold"
                placeholder="0"
                value={avgLoss}
                onChange={(e) => setAvgLoss(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-gray-600">승률 (Win Rate)</label>
              <span className="text-primary font-bold text-lg">{winRate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="99"
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
              value={winRate}
              onChange={(e) => setWinRate(parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-gray-600">월 매매 횟수</label>
              <span className="text-primary font-bold text-lg">{tradeCount}회</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
              value={tradeCount}
              onChange={(e) => setTradeCount(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 결과 섹션 */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-500">매매 1회당 기대수익 (EV)</span>
            </div>
            <span className={`text-lg font-bold ${results.ev >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {results.ev >= 0 ? '+' : ''}{formatNumber(results.ev)}원
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">목표 달성 필요 매매 횟수</span>
              {results.requiredTrades ? (
                <span className="text-lg font-bold text-primary">월 {results.requiredTrades}회</span>
              ) : (
                <span className="text-sm font-bold text-red-500">계산 불가</span>
              )}
            </div>
            {results.ev <= 0 && (
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                <AlertTriangle size={14} />
                <span>현재 통계(기대값 {results.ev}원)로는 목표 달성이 불가능합니다.</span>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">예상 월 수익금</span>
              <span className={`text-lg font-bold ${results.projectedIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {results.projectedIncome >= 0 ? '+' : ''}{formatNumber(results.projectedIncome)}원
              </span>
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-medium">
                <span>목표 달성률</span>
                <span>{results.progress.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${results.progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                  style={{ width: `${results.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-400 px-1">
          <HelpCircle size={14} className="mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            기대값(EV)은 승률과 평균 수익/손실을 바탕으로 한 번의 매매에서 기대할 수 있는 이론적 수익입니다. 
            꾸준한 매매를 통해 EV에 수렴하는 결과를 얻는 것을 목표로 하세요.
          </p>
        </div>
      </div>
    </div>
  );
};
