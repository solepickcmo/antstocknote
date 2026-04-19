import React, { useState, useMemo } from 'react';
import { Target, Info, Search } from 'lucide-react';
import { fmtKRW, fmtPct, fmtInput, parseRaw } from '../../utils/calcFormat';
import { useHoldingsSelector } from '../../hooks/useHoldingsSelector';

export const DividendCalculator: React.FC = () => {
  const { currentHoldings } = useHoldingsSelector();
  
  const [stockName, setStockName] = useState('삼성전자');
  const [priceStr, setPriceStr] = useState('170,000');
  const [dpsStr, setDpsStr] = useState('14,400');
  const [quantityStr, setQuantityStr] = useState('100');
  const [taxRate, setTaxRate] = useState(15.4);
  const [reinvestYears, setReinvestYears] = useState(30);
  const [showHoldings, setShowHoldings] = useState(false);

  const price = parseRaw(priceStr);
  const dps = parseRaw(dpsStr);
  const quantity = parseRaw(quantityStr);

  const result = useMemo(() => {
    if (!price || !dps || !quantity) return null;
    
    const yieldPct = (dps / price) * 100;
    const grossAnnual = dps * quantity;
    const netAnnual = grossAnnual * (1 - taxRate / 100);
    const netRate = (dps * (1 - taxRate / 100)) / price;
    
    // 배당 재투자 복리 최종 자산
    const reinvestVal = (price * quantity) * Math.pow(1 + netRate, reinvestYears);

    return {
      yieldPct,
      grossAnnual,
      netAnnual,
      reinvestVal
    };
  }, [price, dps, quantity, taxRate, reinvestYears]);

  const handleSelectHolding = (h: any) => {
    setStockName(h.name);
    setPriceStr(fmtInput(Math.round(h.avgPrice).toString())); // 평균단가로 초기화
    setQuantityStr(fmtInput(h.quantity.toString()));
    setShowHoldings(false);
  };

  return (
    <div className="card-fintech p-6 space-y-8 animate-fade-in bg-white dark:bg-bg-card">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">배당 수익률 계산기</h2>
          <p className="text-xs text-gray-500 font-medium">세후 실수령 배당금과 재투자 시 복리 효과를 계산합니다</p>
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
                    <p className="text-[10px] font-bold">{Math.round(h.quantity)}주</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">종목명</label>
            <input
              type="text"
              className="input-fintech h-12 font-bold"
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
              placeholder="예: 삼성전자"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">현재 주가 (원)</label>
            <input
              type="text"
              className="input-fintech h-12 text-right font-bold"
              value={priceStr}
              onChange={(e) => setPriceStr(fmtInput(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">주당 배당금 (원/년)</label>
            <input
              type="text"
              className="input-fintech h-12 text-right font-bold"
              value={dpsStr}
              onChange={(e) => setDpsStr(fmtInput(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">보유 주수</label>
            <input
              type="text"
              className="input-fintech h-12 text-right font-bold"
              value={quantityStr}
              onChange={(e) => setQuantityStr(fmtInput(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">배당소득세율 (%)</label>
          <div className="relative">
            <input
              type="number"
              className="input-fintech h-12 pr-16 text-right font-bold"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value))}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">%(기본 15.4%)</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">재투자 기간</label>
            <span className="font-bold text-lg text-right min-w-[48px]">{reinvestYears}년</span>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-slate-800 dark:accent-primary-contrast"
            value={reinvestYears}
            onChange={(e) => setReinvestYears(parseInt(e.target.value))}
          />
        </div>

        <div className="w-full h-[1px] bg-gray-100 dark:bg-white/5" />

        {/* 결과 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">시가 배당률</p>
            <p className="text-base md:text-lg font-black text-amber-600 dark:text-amber-400">{result ? fmtPct(result.yieldPct) : '-'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 min-w-0 text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">연 배당금 (세전)</p>
            <p className="text-base md:text-lg font-black">{result ? fmtKRW(result.grossAnnual) : '-'}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-500/5 p-4 rounded-xl border border-green-100 dark:border-green-500/10 min-w-0 text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">연 배당금 (세후)</p>
            <p className="text-base md:text-lg font-black text-green-600 dark:text-green-500">{result ? fmtKRW(result.netAnnual) : '-'}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-100 dark:border-amber-500/10 min-w-0 text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">재투자 후 자산</p>
            <p className="text-base md:text-lg font-black text-amber-600 dark:text-amber-400">{result ? fmtKRW(result.reinvestVal) : '-'}</p>
          </div>
        </div>

        {result && (
          <div className={`p-4 rounded-xl border text-sm leading-relaxed flex items-center gap-3 ${result.yieldPct >= 4 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
            <Target size={16} />
            <p>
              시가 배당률 {result.yieldPct.toFixed(2)}% — {result.yieldPct >= 4 ? '고배당주 기준(4% 이상) 충족. 장기 보유 시 배당 재투자로 복리 효과를 극대화할 수 있습니다.' : '성장성과 배당을 함께 고려해 보세요.'}
            </p>
          </div>
        )}

        <div className="flex items-start gap-2 text-[10px] text-gray-400 leading-relaxed font-medium pt-2">
          <Info size={12} className="shrink-0 mt-0.5" />
          <p>배당소득세 15.4% = 배당세 14% + 지방소득세 1.4%. 금융소득 2,000만원 초과 시 종합과세 적용.</p>
        </div>
      </div>
    </div>
  );
};
