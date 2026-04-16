import React, { useState, useMemo } from 'react';
import { RotateCcw, TrendingDown, Droplets, AlertCircle } from 'lucide-react';
import { useTradeStore } from '../../store/tradeStore';

interface HoldingSummary {
  ticker: string;
  name: string;
  avgPrice: number;
  quantity: number;
}

export const WateringCalculator: React.FC = () => {
  const trades = useTradeStore(state => state.trades);
  const fetchTrades = useTradeStore(state => state.fetchTrades);

  // ─── 물타기 시뮬레이터 상태 ───
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [currentMarketPrice, setCurrentMarketPrice] = useState<string>('');
  
  // 최대 3회차까지 물타기 조건을 관리하기 위한 배열 상태
  const [wateringEntries, setWateringEntries] = useState([
    { price: '', qty: '' },
    { price: '', qty: '' },
    { price: '', qty: '' }
  ]);

  // 컴포넌트 마운트 시 보유 종목 로드
  React.useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // 보유 종목 계산
  const currentHoldings = useMemo((): HoldingSummary[] => {
    const map = new Map<string, { ticker: string; name: string; totalCost: number; quantity: number }>();
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime()
    );

    sortedTrades.forEach(trade => {
      if (!map.has(trade.ticker)) {
        map.set(trade.ticker, { ticker: trade.ticker, name: trade.name, totalCost: 0, quantity: 0 });
      }
      const holding = map.get(trade.ticker)!;
      const qty = Number(trade.quantity);
      const price = Number(trade.price);

      if (trade.type === 'buy') {
        holding.quantity += qty;
        holding.totalCost += price * qty;
      } else if (trade.type === 'sell' && holding.quantity > 0) {
        const avgCost = holding.totalCost / holding.quantity;
        holding.quantity -= qty;
        holding.totalCost -= avgCost * qty;
      }
    });

    const result: HoldingSummary[] = [];
    map.forEach(holding => {
      if (holding.quantity > 0.000001) {
        result.push({
          ticker: holding.ticker,
          name: holding.name,
          avgPrice: holding.totalCost / holding.quantity,
          quantity: holding.quantity,
        });
      }
    });
    return result.sort((a, b) => a.ticker.localeCompare(b.ticker));
  }, [trades]);

  const selectedHolding = currentHoldings.find(h => h.ticker === selectedTicker) ?? null;

  // 물타기 시뮬레이터 로직
  const waterfallResult = useMemo(() => {
    if (!selectedHolding) return null;

    const currentPrice = parseFloat(currentMarketPrice);
    const existingAvgPrice = selectedHolding.avgPrice;
    const existingQty = selectedHolding.quantity;
    const existingCost = existingAvgPrice * existingQty;

    const currentPnlRate = !isNaN(currentPrice) && currentPrice > 0
      ? ((currentPrice - existingAvgPrice) / existingAvgPrice) * 100
      : null;

    let totalAdditionalCost = 0;
    let totalAdditionalQty = 0;
    let hasValidEntry = false;

    wateringEntries.forEach(entry => {
      const p = parseFloat(entry.price);
      const q = parseFloat(entry.qty);
      if (!isNaN(p) && !isNaN(q) && p > 0 && q > 0) {
        totalAdditionalCost += p * q;
        totalAdditionalQty += q;
        hasValidEntry = true;
      }
    });

    if (!hasValidEntry) {
      return { currentPnlRate, newAvgPrice: null, newTotalQty: null, additionalInvestment: null, afterWaterfallPnlRate: null };
    }

    const newTotalCost = existingCost + totalAdditionalCost;
    const newTotalQty = existingQty + totalAdditionalQty;
    const newAvgPrice = newTotalCost / newTotalQty;

    const afterWaterfallPnlRate = !isNaN(currentPrice) && currentPrice > 0
      ? ((currentPrice - newAvgPrice) / newAvgPrice) * 100
      : null;

    return {
      currentPnlRate,
      newAvgPrice,
      newTotalQty,
      additionalInvestment: totalAdditionalCost,
      afterWaterfallPnlRate,
    };
  }, [selectedHolding, currentMarketPrice, wateringEntries]);

  const handleWateringChange = (index: number, field: 'price' | 'qty', value: string) => {
    setWateringEntries(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 animate-fade-in max-w-5xl mx-auto">
      {/* 입력 섹션 */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <Droplets className="text-blue-500" size={20} /> 물타기 조건 입력
            </h3>
            <button 
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 px-2.5 py-1.5 rounded-lg"
              onClick={() => { 
                setSelectedTicker(''); 
                setCurrentMarketPrice(''); 
                setWateringEntries([{ price: '', qty: '' }, { price: '', qty: '' }, { price: '', qty: '' }]);
              }}
            >
              <RotateCcw size={14} /> 초기화
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">📌 보유 종목 선택</label>
              <select
                aria-label="보유 종목 선택"
                id="holdingSelect"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold text-gray-700"
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value)}
              >
                <option value="">-- 종목을 선택하세요 --</option>
                {currentHoldings.map(h => (
                  <option key={h.ticker} value={h.ticker}>
                    {h.ticker} · {h.name} (평단: {Math.floor(h.avgPrice).toLocaleString()}원 / {h.quantity}주)
                  </option>
                ))}
              </select>
            </div>

            {selectedHolding && (
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">현재 평균단가</span>
                  <span className="text-gray-800 font-bold">{Math.floor(selectedHolding.avgPrice).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">보유 수량</span>
                  <span className="text-gray-800 font-bold">{selectedHolding.quantity}주</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">총 투자원금</span>
                  <span className="text-gray-800 font-bold">{Math.floor(selectedHolding.avgPrice * selectedHolding.quantity).toLocaleString()}원</span>
                </div>
              </div>
            )}

            <div className="relative py-2 flex items-center gap-4">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-white px-2 z-10">진입 시점 배경</span>
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">현재가 (시장가 또는 목표가)</label>
              <input
                aria-label="현재 주가(시장가) 입력"
                id="marketPrice"
                type="number"
                placeholder="현재 주가를 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-lg"
                value={currentMarketPrice}
                onChange={(e) => setCurrentMarketPrice(e.target.value)}
                disabled={!selectedHolding}
              />
            </div>

            <div className="relative py-2 flex items-center gap-4">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-white px-2 z-10">추가 매수 계획 (최대 3회)</span>
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            </div>
            
            <div className="space-y-4">
              {wateringEntries.map((entry, index) => (
                <div key={index} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">{index + 1}차 추가 매수</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 ml-1">매수 단가</label>
                      <input
                        aria-label={`${index + 1}차 추가 매수 단가 입력`}
                        type="number"
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold"
                        value={entry.price}
                        onChange={(e) => handleWateringChange(index, 'price', e.target.value)}
                        disabled={!selectedHolding}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 ml-1">매수 수량</label>
                      <input
                        aria-label={`${index + 1}차 추가 매수 수량 입력`}
                        type="number"
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold"
                        value={entry.qty}
                        onChange={(e) => handleWateringChange(index, 'qty', e.target.value)}
                        disabled={!selectedHolding}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100/50">
          <h4 className="text-sm font-bold text-amber-700 flex items-center gap-1.5 mb-2">
            <AlertCircle size={16} /> 파괴적인 물타기 방지 제언
          </h4>
          <ul className="text-xs space-y-1.5 text-amber-600/80 font-medium leading-relaxed">
            <li>• 물타기는 탈출을 위한 전략일 뿐, 수익을 보장하지 않습니다.</li>
            <li>• 평단가가 낮아지는 달콤함보다 늘어나는 비중의 공포를 기억하세요.</li>
            <li>• 계획되지 않은 물타기는 단순한 희망 회로에 불과합니다.</li>
          </ul>
        </div>
      </div>

      {/* 결과 섹션 */}
      <div className="space-y-6">
        {!selectedHolding ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <TrendingDown size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium leading-relaxed uppercase tracking-tighter text-xs">
              보유 종목을 선택하여<br/>시뮬레이션을 시작하세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {waterfallResult && waterfallResult.currentPnlRate !== null && (
              <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${waterfallResult.currentPnlRate >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">현재 손익률</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${waterfallResult.currentPnlRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {waterfallResult.currentPnlRate >= 0 ? '+' : ''}{waterfallResult.currentPnlRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            {waterfallResult && waterfallResult.newAvgPrice && (
              <>
                <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">📉 목표 평균단가</span>
                    <span className="bg-blue-500/50 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">SIMULATED</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-white">{Math.floor(waterfallResult.newAvgPrice).toLocaleString()}</span>
                    <span className="text-blue-100 font-bold">원</span>
                  </div>
                  <div className="text-xs text-blue-100 font-medium">
                    기존 {Math.floor(selectedHolding.avgPrice).toLocaleString()}원에서 <span className="text-white font-black underline underline-offset-4 decoration-blue-300">{Math.floor(selectedHolding.avgPrice - waterfallResult.newAvgPrice).toLocaleString()}원</span> 절감
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">최종 수량</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-gray-800">{waterfallResult.newTotalQty}</span>
                        <span className="text-xs text-gray-400 font-bold">주</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">추가 자본</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-red-500">{(waterfallResult.additionalInvestment ?? 0).toLocaleString()}</span>
                        <span className="text-xs text-gray-400 font-bold">원</span>
                    </div>
                  </div>
                </div>

                <div className={`bg-gray-50 p-6 rounded-2xl border-l-4 ${waterfallResult.afterWaterfallPnlRate! >= 0 ? 'border-green-500' : 'border-red-500'} space-y-3`}>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">변경 예상 손익률</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${waterfallResult.afterWaterfallPnlRate! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {waterfallResult.afterWaterfallPnlRate! >= 0 ? '+' : ''}{waterfallResult.afterWaterfallPnlRate!.toFixed(2)}%
                    </span>
                  </div>
                  {waterfallResult.afterWaterfallPnlRate !== null && (
                    <div className="text-xs font-bold text-gray-500 bg-white/60 self-start px-3 py-1.5 rounded-lg border border-gray-100">
                      기존 대비 <span className="text-blue-600">{(waterfallResult.afterWaterfallPnlRate - (waterfallResult.currentPnlRate ?? 0)).toFixed(2)}%</span> 대폭 개선
                    </div>
                  )}
                </div>
              </>
            )}

            {!waterfallResult?.newAvgPrice && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-100 p-8 text-center">
                <p className="text-xs text-gray-400 font-medium">추가 매수 조건을 입력하면<br/>결과를 확인할 수 있습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
