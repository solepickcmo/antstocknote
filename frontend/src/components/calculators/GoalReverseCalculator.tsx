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
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-16 animate-fade-in pb-20">
      {/* 입력 섹션 */}
      <div className="card-fintech space-y-8 md:space-y-12">
        <div className="flex justify-between items-center">
          <h3 className="text-fintech-xl font-fintech-bold flex items-center gap-3">
            <Target className="primary-text" size={24} /> 
            <span>매매 목표 시뮬레이터</span>
          </h3>
          <button 
            onClick={fetchMyStats}
            disabled={isLoading}
            className="btn-fintech-secondary"
          >
            {isLoading ? '데이터 분석 중...' : '내 통계 불러오기 (6개월)'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="label-fintech">월 목표 수익금 (KRW)</label>
            <input
              type="text"
              className="input-fintech text-fintech-2xl md:text-fintech-4xl py-4 md:py-8 h-auto text-center font-fintech-black primary-text"
              placeholder="예: 2,000,000"
              value={goalAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setGoalAmount(val ? parseInt(val).toLocaleString() : '');
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-3">
              <label className="label-fintech">평균 수익금 (원)</label>
              <input
                type="number"
                className="input-fintech text-fintech-base"
                placeholder="0"
                value={avgProfit}
                onChange={(e) => setAvgProfit(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="label-fintech">평균 손실금 (원)</label>
              <input
                type="number"
                className="input-fintech text-fintech-base"
                placeholder="0"
                value={avgLoss}
                onChange={(e) => setAvgLoss(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <div className="flex justify-between items-end">
              <label className="label-fintech mb-0">예상 승률 (Win Rate)</label>
              <span className="text-fintech-xl font-fintech-black primary-text drop-shadow-sm">{winRate}%</span>
            </div>
            <div className="relative group">
              <input
                type="range"
                min="1"
                max="99"
                className="w-full h-2 bg-border-subtle rounded-full appearance-none cursor-pointer accent-primary group-hover:bg-primary/20 transition-all"
                value={winRate}
                onChange={(e) => setWinRate(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="label-fintech mb-0">월 목표 매매 횟수</label>
              <span className="text-fintech-xl font-fintech-black primary-text drop-shadow-sm">{tradeCount}회</span>
            </div>
            <div className="relative group">
              <input
                type="range"
                min="1"
                max="100"
                className="w-full h-2 bg-border-subtle rounded-full appearance-none cursor-pointer accent-primary group-hover:bg-primary/20 transition-all"
                value={tradeCount}
                onChange={(e) => setTradeCount(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 결과 섹션 */}
      <div className="space-y-8 md:space-y-12">
        <div className="grid grid-cols-1 gap-8 md:gap-12">
          <div className="card-fintech p-6 flex justify-between items-center transition-all hover:bg-card-fintech/80">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <TrendingUp size={24} className="primary-text" />
              </div>
              <div className="flex flex-col">
                <span className="text-fintech-xs text-muted font-fintech-bold uppercase tracking-wider">매매 1회당 기대수익 (EV)</span>
                <span className="text-fintech-xs text-muted/60 mt-0.5">이론적으로 기대할 수 있는 회당 수익입니다.</span>
              </div>
            </div>
            <span className={`text-fintech-2xl font-fintech-black ${results.ev >= 0 ? 'profit-text' : 'loss-text'}`}>
              {results.ev >= 0 ? '+' : ''}{formatNumber(results.ev)}원
            </span>
          </div>

          <div className="card-fintech p-10 md:p-12 space-y-10 md:space-y-12 bg-ink text-white border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="text-fintech-sm text-slate uppercase tracking-widest font-fintech-bold">목표 달성 필요 매매 횟수</h4>
                <p className="text-fintech-xs text-slate opacity-60">월 목표를 채우기 위한 권장 매매 횟수입니다.</p>
              </div>
              {results.requiredTrades ? (
                <div className="flex flex-col items-end">
                  <span className="text-fintech-3xl font-fintech-black primary-text">월 {results.requiredTrades}회</span>
                  <span className="text-[10px] text-slate/50">현재 속도 대비 {results.requiredTrades > tradeCount ? '증가 필요' : '여유로움'}</span>
                </div>
              ) : (
                <span className="text-fintech-base font-fintech-bold loss-text">계산 불가</span>
              )}
            </div>
            
            {results.ev <= 0 && (
              <div className="flex items-start gap-4 text-fintech-xs text-danger bg-danger/10 p-5 rounded-2xl border border-danger/20 animate-pulse">
                <AlertTriangle size={20} className="shrink-0" />
                <div className="space-y-1">
                  <p className="font-fintech-bold">위험: 기대수익이 마이너스입니다.</p>
                  <p className="text-slate opacity-80 leading-relaxed">현재 승률과 손익 구조로는 매매를 할수록 손실이 발생합니다. 매매 기법이나 손익비를 점검해 보세요.</p>
                </div>
              </div>
            )}
            <div className="pt-8 border-t border-white/10 space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-fintech-sm font-fintech-bold text-slate uppercase tracking-widest">예상 월 수익금</span>
                  <div className="text-right">
                    <p className={`text-fintech-3xl font-fintech-black ${results.projectedIncome >= 0 ? 'profit-text' : 'loss-text'}`}>
                        {results.projectedIncome >= 0 ? '+' : ''}{formatNumber(results.projectedIncome)}원
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end text-fintech-xs font-fintech-bold uppercase tracking-tighter">
                    <span className="text-slate opacity-60">목표 달성 전망</span>
                    <span className={results.progress >= 100 ? 'profit-text' : 'primary-text'}>{results.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(240,185,11,0.5)] ${results.progress >= 100 ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${results.progress}%` }}
                    />
                  </div>
                </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 text-fintech-xs text-muted p-5 rounded-2xl bg-bg-white/30 border border-border-subtle">
          <HelpCircle size={24} className="shrink-0 opacity-40" />
          <div className="space-y-2">
            <p className="leading-relaxed">
              <span className="font-fintech-bold text-main">기대값(EV) 분석:</span> 모든 성공적인 트레이더는 이론적으로 유리한 게임(EV {'>'} 0)을 반복합니다. 
              단기적인 운보다는 통계적으로 승리하는 구조를 만드는 것이 중요합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
