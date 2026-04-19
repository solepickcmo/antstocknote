import React, { useState, useMemo } from 'react';
import { Search, Info } from 'lucide-react';
import { fmtKRW, fmtNum, fmtInput, parseRaw } from '../../utils/calcFormat';
import { useHoldingsSelector } from '../../hooks/useHoldingsSelector';

export const ValuationCalculator: React.FC = () => {
  const { currentHoldings } = useHoldingsSelector();
  
  const [priceStr, setPriceStr] = useState('70,000');
  const [epsStr, setEpsStr] = useState('5,000');
  const [bpsStr, setBpsStr] = useState('55,000');
  const [sectorPerStr, setSectorPerStr] = useState('12');
  const [sectorPbrStr, setSectorPbrStr] = useState('1.2');
  const [growthStr, setGrowthStr] = useState('8');
  const [showHoldings, setShowHoldings] = useState(false);

  const price = parseRaw(priceStr);
  const eps = parseRaw(epsStr);
  const bps = parseRaw(bpsStr);
  const sectorPer = parseFloat(sectorPerStr) || 0;
  const sectorPbr = parseFloat(sectorPbrStr) || 0;
  const growth = parseFloat(growthStr) || 0;

  const result = useMemo(() => {
    if (!price || !eps || !bps) return null;
    
    const per = price / eps;
    const pbr = price / bps;
    const fairPer = eps * sectorPer;
    const fairPbr = bps * sectorPbr;
    const fairAvg = (fairPer + fairPbr) / 2;
    const peg = growth > 0 ? per / growth : 0;
    const gap = fairAvg > 0 ? ((price - fairAvg) / fairAvg) * 100 : 0;
    
    // 게이지 위치: -50% ~ +50% 범위를 0 ~ 100으로 매핑
    // (현재가 / 적정가) 비율을 사용하여 1.0(적정)이 가운데(50%)에 오게 함
    const gaugeValue = fairAvg > 0 ? (price / fairAvg) : 1;
    const gaugePos = Math.min(Math.max((gaugeValue - 0.5) * 100, 0), 100);

    return {
      per,
      pbr,
      fairPer,
      fairPbr,
      fairAvg,
      peg,
      gap,
      gaugePos
    };
  }, [price, eps, bps, sectorPer, sectorPbr, growth]);

  const handleSelectHolding = (h: any) => {
    setPriceStr(fmtInput(Math.round(h.avgPrice).toString()));
    setShowHoldings(false);
  };

  return (
    <div className="card-fintech p-6 space-y-8 animate-fade-in bg-white dark:bg-bg-card">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">적정 주가 계산기 (PER · PBR)</h2>
          <p className="text-xs text-gray-500 font-medium">현재 주가가 고평가인지 저평가인지 두 가지 기준으로 판단합니다</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
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
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">주당순이익 EPS (원)</label>
            <input
              type="text"
              className="input-fintech h-12 text-right font-bold"
              value={epsStr}
              onChange={(e) => setEpsStr(fmtInput(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">주당순자산 BPS (원)</label>
            <input
              type="text"
              className="input-fintech h-12 text-right font-bold"
              value={bpsStr}
              onChange={(e) => setBpsStr(fmtInput(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">업종 평균 PER</label>
            <input
              type="number"
              className="input-fintech h-12 text-right font-bold"
              value={sectorPerStr}
              onChange={(e) => setSectorPerStr(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">업종 평균 PBR</label>
            <input
              type="number"
              step="0.1"
              className="input-fintech h-12 text-right font-bold"
              value={sectorPbrStr}
              onChange={(e) => setSectorPbrStr(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">EPS 성장률 (향후 5년, %)</label>
            <input
              type="number"
              className="input-fintech h-12 text-right font-bold"
              value={growthStr}
              onChange={(e) => setGrowthStr(e.target.value)}
            />
            <p className="text-[9px] text-gray-400 font-medium">PEG 계산용</p>
          </div>
        </div>

        <div className="w-full h-[1px] bg-gray-100 dark:bg-white/5" />

        {/* 결과 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">현재 PER</p>
            <p className="text-base md:text-lg font-black">{result ? fmtNum(result.per, 1) + '배' : '-'}</p>
            <p className="text-[9px] text-gray-400 font-medium">업종평균 {sectorPer}배</p>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">현재 PBR</p>
            <p className="text-base md:text-lg font-black">{result ? fmtNum(result.pbr, 2) + '배' : '-'}</p>
            <p className="text-[9px] text-gray-400 font-medium">업종평균 {sectorPbr}배</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-100 dark:border-amber-500/10 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">PER 기준 적정가</p>
            <p className="text-base md:text-lg font-black text-amber-600 dark:text-amber-400">{result ? fmtKRW(result.fairPer) : '-'}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-100 dark:border-amber-500/10 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">PBR 기준 적정가</p>
            <p className="text-base md:text-lg font-black text-amber-600 dark:text-amber-400">{result ? fmtKRW(result.fairPbr) : '-'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">PEG 비율</p>
            <p className="text-base md:text-lg font-black">{result ? fmtNum(result.peg, 2) : '-'}</p>
            <p className="text-[9px] text-gray-400 font-medium">적정 (1~2)</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-100 dark:border-amber-500/10 md:col-span-2 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">종합 적정가 (평균)</p>
            <p className="text-base md:text-lg font-black text-amber-600 dark:text-amber-400">{result ? fmtKRW(result.fairAvg) : '-'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">현재가 대비</p>
            <p className={`text-base md:text-lg font-black ${result && result.gap > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {result ? (result.gap > 0 ? '+' : '') + result.gap.toFixed(1) + '%' : '-'}
            </p>
            <p className="text-[9px] text-gray-400 font-medium">{result && result.gap > 15 ? '고평가 구간' : (result && result.gap < -15 ? '저평가 구간' : '적정 구간')}</p>
          </div>
        </div>

        {result && (
          <div className={`p-4 rounded-xl border text-sm leading-relaxed flex items-center gap-3 ${Math.abs(result.gap) <= 15 ? 'bg-blue-50 text-blue-700 border-blue-100' : (result.gap < -15 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100')}`}>
            <Info size={16} />
            <p>
              {Math.abs(result.gap) <= 15 ? '현재가가 종합 적정가 대비 ±15% 이내 적정 구간에 있습니다.' : (result.gap < -15 ? `종합 적정가 대비 ${Math.abs(result.gap).toFixed(1)}% 저평가. 장기 매수 관점에서 긍정적 구간입니다.` : `종합 적정가 대비 ${result.gap.toFixed(1)}% 고평가. 추가 매수보다 관망이 적절합니다.`)}
            </p>
          </div>
        )}

        {/* 게이지 바 */}
        <div className="space-y-4 pt-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">현재가 위치 (저평가 ↔ 고평가)</p>
          <div className="relative h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-20" />
             <div 
               className="absolute top-0 w-2 h-full bg-slate-800 dark:bg-white border-x border-white/20 dark:border-black/20 shadow-lg transition-all duration-700"
               style={{ left: `${result ? result.gaugePos : 50}%`, transform: 'translateX(-50%)' }}
             />
          </div>
          <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-tighter px-1">
             <span>저평가</span>
             <span>적정</span>
             <span>고평가</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[10px] text-gray-400 leading-relaxed font-medium pt-2">
          <Info size={12} className="shrink-0 mt-0.5" />
          <p>EPS·BPS는 최근 연간 실적 기준. 업종 평균 PER·PBR은 한국거래소(KRX) 또는 네이버 금융 참조.</p>
        </div>
      </div>
    </div>
  );
};
