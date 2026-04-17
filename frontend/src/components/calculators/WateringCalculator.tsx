import React, { useState, useMemo } from 'react';
import { RotateCcw, TrendingDown, Droplets, AlertCircle, Calculator } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        {/* 입력 섹션 */}
        <div className="space-y-6">
          <div className="card-fintech space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-fintech-xl font-fintech-bold flex items-center gap-3">
                <Droplets className="primary-text" size={24} /> 
                <span>물타기 시뮬레이터</span>
              </h3>
              <button 
                className="btn-fintech-secondary"
                onClick={() => { 
                  setSelectedTicker(''); 
                  setCurrentMarketPrice(''); 
                  setWateringEntries([{ price: '', qty: '' }, { price: '', qty: '' }, { price: '', qty: '' }]);
                }}
              >
                <RotateCcw size={14} /> 초기화
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="label-fintech">📌 보유 종목 선택</label>
                <select
                  aria-label="보유 종목 선택"
                  className="input-fintech h-12"
                  value={selectedTicker}
                  onChange={(e) => setSelectedTicker(e.target.value)}
                >
                  <option value="">-- 종목을 선택하세요 --</option>
                  {currentHoldings.map(h => (
                    <option key={h.ticker} value={h.ticker}>
                      {h.ticker} · {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedHolding && (
                <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-fintech-xs text-muted font-fintech-bold uppercase">현재 평균단가</span>
                    <span className="text-fintech-base font-fintech-black">{Math.floor(selectedHolding.avgPrice).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fintech-xs text-muted font-fintech-bold uppercase">보유 수량</span>
                    <span className="text-fintech-base font-fintech-black">{selectedHolding.quantity}주</span>
                  </div>
                  <div className="pt-3 border-t border-primary/10 flex justify-between items-center">
                    <span className="text-fintech-xs text-muted font-fintech-bold uppercase">총 투자원금</span>
                    <span className="text-fintech-base font-fintech-black primary-text">{Math.floor(selectedHolding.avgPrice * selectedHolding.quantity).toLocaleString()}원</span>
                  </div>
                </div>
              )}

              <div className="relative py-4 flex items-center gap-4">
                  <span className="text-[10px] font-fintech-black primary-text uppercase tracking-widest bg-card-fintech px-3 z-10 rounded-full border border-border">시장 현황</span>
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              </div>

              <div className="space-y-3">
                <label className="label-fintech">목표 진입가 (현재가/희망가)</label>
                <input
                  type="number"
                  placeholder="추가 매수할 가격을 입력하세요"
                  className="input-fintech text-fintech-xl py-4 h-auto font-fintech-black text-center"
                  value={currentMarketPrice}
                  onChange={(e) => setCurrentMarketPrice(e.target.value)}
                  disabled={!selectedHolding}
                />
              </div>

              <div className="relative py-4 flex items-center gap-4">
                  <span className="text-[10px] font-fintech-black primary-text uppercase tracking-widest bg-card-fintech px-3 z-10 rounded-full border border-border">추가 매수 계획</span>
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              </div>
              
              <div className="space-y-4">
                {wateringEntries.map((entry, index) => (
                  <div key={index} className="p-5 rounded-2xl border border-border bg-card-fintech/50 space-y-4 transition-all hover:border-primary/30">
                    <div className="text-[11px] font-fintech-black text-muted uppercase tracking-wider flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px]">{index + 1}</div>
                        {index + 1}차 추가 매수
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-fintech-bold text-slate uppercase ml-1">매수 단가</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="input-fintech"
                          value={entry.price}
                          onChange={(e) => handleWateringChange(index, 'price', e.target.value)}
                          disabled={!selectedHolding}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-fintech-bold text-slate uppercase ml-1">매수 수량</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="input-fintech"
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

          <div className="bg-danger/5 rounded-2xl p-6 border border-danger/10 space-y-3">
            <h4 className="text-fintech-sm font-fintech-bold loss-text flex items-center gap-2">
              <AlertCircle size={18} /> 무분별한 물타기 경고
            </h4>
            <ul className="text-fintech-xs space-y-2 text-danger/80 font-medium leading-relaxed">
              <li className="flex gap-2"><span>•</span> 물타기는 탈출 전략입니다. 비중이 커질수록 리스크도 기하급수적으로 늘어납니다.</li>
              <li className="flex gap-2"><span>•</span> 명확한 손절가 없는 물타기는 '희망 회로'일 뿐입니다.</li>
            </ul>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-6">
          {!selectedHolding ? (
            <div className="card-fintech h-[600px] flex flex-col items-center justify-center text-center space-y-6 border-dashed bg-transparent">
              <div className="w-24 h-24 bg-card-fintech rounded-full flex items-center justify-center border border-border shadow-inner">
                <TrendingDown size={40} className="text-muted opacity-30" />
              </div>
              <div className="space-y-2">
                <p className="text-fintech-base font-fintech-bold text-main uppercase tracking-tight">
                  보유 종목을 선택해 주세요
                </p>
                <p className="text-fintech-xs text-muted leading-relaxed">
                  시뮬레이션을 시작하기 위해<br/>목록에서 종목을 골라주세요.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {waterfallResult && waterfallResult.currentPnlRate !== null && (
                <div className={`card-fintech border-l-4 ${waterfallResult.currentPnlRate >= 0 ? 'border-success' : 'border-danger'} transition-all`}>
                  <div className="flex justify-between items-center">
                    <span className="text-fintech-xs font-fintech-bold text-muted uppercase tracking-widest">현재 상태 손익률</span>
                    <TrendingDown size={14} className="text-muted opacity-40" />
                  </div>
                  <div className="mt-2 text-fintech-3xl font-fintech-black">
                    <span className={waterfallResult.currentPnlRate >= 0 ? 'profit-text' : 'loss-text'}>
                      {waterfallResult.currentPnlRate >= 0 ? '+' : ''}{waterfallResult.currentPnlRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}

              {waterfallResult && waterfallResult.newAvgPrice && (
                <>
                  <div className="card-fintech p-10 bg-ink text-white border-none shadow-2xl space-y-8 relative overflow-hidden">
                    {/* 장식 요소 */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-fintech-xs font-fintech-bold text-slate uppercase tracking-[0.2em]">목표 평균단가</h4>
                          <p className="text-[10px] text-slate/50">물타기 완료 후 예상되는 평단입니다.</p>
                        </div>
                        <span className="bg-primary/20 text-primary text-[10px] px-3 py-1 rounded-full font-fintech-black border border-primary/30">PREDICTION</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-fintech-4xl font-fintech-black text-white">{Math.floor(waterfallResult.newAvgPrice).toLocaleString()}</span>
                        <span className="text-slate font-fintech-bold">원</span>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                        <TrendingDown size={16} className="text-primary" />
                        <span className="text-fintech-xs text-slate font-medium">
                          기존 대비 <span className="text-white font-fintech-black">{Math.floor(selectedHolding.avgPrice - waterfallResult.newAvgPrice).toLocaleString()}원</span> 절감 효과
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-fintech-bold text-slate uppercase tracking-widest">최종 보유 수량</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-fintech-xl font-fintech-black text-white">{waterfallResult.newTotalQty}</span>
                            <span className="text-fintech-xs text-slate">주</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-[10px] font-fintech-bold text-slate uppercase tracking-widest">추가 소요 자본</span>
                        <div className="flex items-baseline justify-end gap-1">
                            <span className="text-fintech-xl font-fintech-black loss-text">{(waterfallResult.additionalInvestment ?? 0).toLocaleString()}</span>
                            <span className="text-fintech-xs text-slate">원</span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-8 rounded-2xl border-l-4 ${waterfallResult.afterWaterfallPnlRate! >= 0 ? 'border-success bg-success/5' : 'border-danger bg-danger/5'} space-y-4`}>
                      <span className="text-fintech-xs font-fintech-bold text-slate uppercase tracking-widest">변경 예상 손익률</span>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-fintech-4xl font-fintech-black ${waterfallResult.afterWaterfallPnlRate! >= 0 ? 'profit-text' : 'loss-text'}`}>
                          {waterfallResult.afterWaterfallPnlRate! >= 0 ? '+' : ''}{waterfallResult.afterWaterfallPnlRate!.toFixed(2)}%
                        </span>
                      </div>
                      {waterfallResult.afterWaterfallPnlRate !== null && (
                        <div className="inline-flex items-center gap-2 text-fintech-xs font-fintech-black text-white bg-white/10 px-4 py-2 rounded-full border border-white/10">
                          수익률 <span className="primary-text">{(waterfallResult.afterWaterfallPnlRate - (waterfallResult.currentPnlRate ?? 0)).toFixed(2)}%</span> 개선 효과
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {!waterfallResult?.newAvgPrice && (
                <div className="card-fintech border-dashed py-12 flex flex-col items-center justify-center bg-transparent">
                  <Calculator size={32} className="text-muted opacity-20 mb-3" />
                  <p className="text-fintech-xs text-muted font-fintech-bold text-center leading-relaxed italic">
                    추가 매수 조건을 입력하면<br/>시뮬레이션 분석 결과가 이곳에 표시됩니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
