import React, { useState, useMemo } from 'react';
import { Search, Info, ShieldAlert } from 'lucide-react';
import { fmtKRW, fmtPct, fmtInput, parseRaw } from '../../utils/calcFormat';
import { useHoldingsSelector } from '../../hooks/useHoldingsSelector';

export const RiskRewardCalculator: React.FC = () => {
  const { currentHoldings } = useHoldingsSelector();
  
  const [entryStr, setEntryStr] = useState('70,000');
  const [stopStr, setStopStr] = useState('63,000');
  const [tp1Str, setTp1Str] = useState('84,000');
  const [tp2Str, setTp2Str] = useState('98,000');
  const [amountStr, setAmountStr] = useState('5,000,000');
  const [showHoldings, setShowHoldings] = useState(false);

  const entry = parseRaw(entryStr);
  const stop = parseRaw(stopStr);
  const tp1 = parseRaw(tp1Str);
  const tp2 = parseRaw(tp2Str);
  const amount = parseRaw(amountStr);

  const result = useMemo(() => {
    if (!entry || !stop || !tp1) return null;
    
    const riskPct = ((entry - stop) / entry) * 100;
    const tp1Pct = ((tp1 - entry) / entry) * 100;
    const tp2Pct = tp2 > 0 ? ((tp2 - entry) / entry) * 100 : 0;
    
    const rr1 = tp1Pct / Math.max(riskPct, 0.001);
    const rr2 = tp2 > 0 ? tp2Pct / Math.max(riskPct, 0.001) : 0;
    
    const riskAmt = amount * (riskPct / 100);
    const tp1Amt = amount * (tp1Pct / 100);
    const tp2Amt = amount * (tp2Pct / 100);

    const minWr1 = (1 / (1 + rr1)) * 100;
    const minWr2 = rr2 > 0 ? (1 / (1 + rr2)) * 100 : 0;

    // 시각화 바 구성
    const total = Math.abs(riskPct) + Math.abs(tp1Pct);
    const lossWidth = (Math.abs(riskPct) / total) * 100;
    const gainWidth = 100 - lossWidth;

    return {
      riskPct,
      tp1Pct,
      tp2Pct,
      rr1,
      rr2,
      riskAmt,
      tp1Amt,
      tp2Amt,
      minWr1,
      minWr2,
      lossWidth,
      gainWidth
    };
  }, [entry, stop, tp1, tp2, amount]);

  const handleSelectHolding = (h: any) => {
    setEntryStr(fmtInput(Math.round(h.avgPrice).toString()));
    setShowHoldings(false);
  };

  return (
    <div className="card-fintech p-6 space-y-8 animate-fade-in bg-white dark:bg-bg-card">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">손절·목표가 리스크 비율 계산기 (R:R)</h2>
          <p className="text-xs text-gray-500 font-medium">진입가 대비 손절가·목표가 비율로 매매 진입 타당성을 판단합니다</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowHoldings(!showHoldings)}
            className="btn-fintech-secondary text-[11px] h-8 px-3 flex items-center gap-1.5"
          >
            <Search size={12} /> 보유 종목에서 불러오기
          </button>
          
          {showHoldings && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-bg-card border border-gray-100 dark:border-white/5 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {currentHoldings.length > 0 ? currentHoldings.map(h => (
                  <div 
                    key={h.ticker}
                    onClick={() => handleSelectHolding(h)}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center border-b border-gray-50 dark:border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-xs font-bold">{h.name}</p>
                      <p className="text-[10px] text-gray-400">{h.ticker}</p>
                    </div>
                    <p className="text-[10px] font-bold">{Math.round(h.avgPrice).toLocaleString()}원</p>
                  </div>
                )) : (
                  <p className="p-4 text-center text-xs text-gray-400">보유 종목이 없습니다</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">진입가 (매수가)</label>
            <div className="relative">
              <input
                type="text"
                className="input-fintech h-12 pr-12 text-right font-bold"
                value={entryStr}
                onChange={(e) => setEntryStr(fmtInput(e.target.value))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">손절가</label>
            <div className="relative">
              <input
                type="text"
                className="input-fintech h-12 pr-12 text-right font-bold border-red-100 dark:border-red-900/30"
                value={stopStr}
                onChange={(e) => setStopStr(fmtInput(e.target.value))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">1차 목표가</label>
              <div className="relative">
                <input
                  type="text"
                  className="input-fintech h-12 pr-12 text-right font-bold border-green-100 dark:border-green-900/30"
                  value={tp1Str}
                  onChange={(e) => setTp1Str(fmtInput(e.target.value))}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">2차 목표가</label>
              <div className="relative">
                <input
                  type="text"
                  className="input-fintech h-12 pr-12 text-right font-bold"
                  value={tp2Str}
                  onChange={(e) => setTp2Str(fmtInput(e.target.value))}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">투자금액</label>
            <div className="relative">
              <input
                type="text"
                className="input-fintech h-12 pr-12 text-right font-bold"
                value={amountStr}
                onChange={(e) => setAmountStr(fmtInput(e.target.value))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-gray-100 dark:bg-white/5" />

        {/* 결과 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-red-50 dark:bg-red-500/5 p-4 rounded-xl border border-red-100 dark:border-red-500/10 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">손실 위험</p>
            <p className="text-base md:text-lg font-black text-red-600 dark:text-red-500">{result ? fmtPct(result.riskPct) : '-'}</p>
            <p className="text-[9px] text-gray-400 font-medium">{result ? '-' + fmtKRW(result.riskAmt) : '-'}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-500/5 p-4 rounded-xl border border-green-100 dark:border-green-500/10 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">1차 목표 수익</p>
            <p className="text-base md:text-lg font-black text-green-600 dark:text-green-500">{result ? '+' + fmtPct(result.tp1Pct) : '-'}</p>
            <p className="text-[9px] text-gray-400 font-medium">{result ? '+' + fmtKRW(result.tp1Amt) : '-'}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-100 dark:border-amber-500/10 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">R:R 비율 (1차)</p>
            <p className="text-base md:text-lg font-black text-amber-600 dark:text-amber-400">{result ? '1 : ' + result.rr1.toFixed(1) : '-'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">R:R 비율 (2차)</p>
            <p className="text-base md:text-lg font-black">{result && result.rr2 > 0 ? '1 : ' + result.rr2.toFixed(1) : '-'}</p>
          </div>
        </div>

        {/* 시각화 바 */}
        <div className="space-y-4 pt-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">손실 vs 수익 시각화 (1차 목표 기준)</p>
          <div className="flex h-10 rounded-xl overflow-hidden shadow-inner border border-gray-100 dark:border-white/5">
            <div 
              className="bg-red-500 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter transition-all duration-700"
              style={{ width: `${result ? result.lossWidth : 50}%` }}
            >
              손실
            </div>
            <div 
              className="bg-green-600 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter transition-all duration-700"
              style={{ width: `${result ? result.gainWidth : 50}%` }}
            >
              수익
            </div>
          </div>
          {result && (
            <div className={`p-4 rounded-xl border text-sm leading-relaxed flex items-center gap-3 ${result.rr1 >= 2 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <ShieldAlert size={16} />
              <p>
                R:R 1:{result.rr1.toFixed(1)} — {result.rr1 >= 2 ? '권장 수준(1:2 이상) 충족. 진입 타당성 있습니다.' : '권장치(1:2) 미달. 목표가 상향 또는 손절가 조정을 검토하세요.'}
              </p>
            </div>
          )}
        </div>

        {/* 승률 분석 */}
        <div className="space-y-4 pt-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">승률 손익분기 분석</p>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">최소 필요 승률 (1차)</p>
                <p className="text-3xl font-black">{result ? result.minWr1.toFixed(1) : '-'}%</p>
                <p className="text-[9px] text-gray-400 mt-2">이 승률 이상이면 기대값 양수</p>
             </div>
             <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">최소 필요 승률 (2차)</p>
                <p className="text-3xl font-black">{result && result.rr2 > 0 ? result.minWr2.toFixed(1) : '-'}%</p>
                <p className="text-[9px] text-gray-400 mt-2">이 승률 이상이면 기대값 양수</p>
             </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[10px] text-gray-400 leading-relaxed font-medium pt-2">
          <Info size={12} className="shrink-0 mt-0.5" />
          <p>R:R 1:2 이상 권장 (1원을 잃을 때 2원 이상 버는 구조). 최소 필요 승률 = 1 / (1 + R:R 비율) × 100.</p>
        </div>
      </div>
    </div>
  );
};
