import React, { useState, useMemo } from 'react';
import { RotateCcw, Calculator as CalcIcon, TrendingDown } from 'lucide-react';
import { useTradeStore } from '../store/tradeStore';
import './CalculatorPage.css';

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface HoldingSummary {
  ticker: string;
  name: string;
  avgPrice: number;
  quantity: number;
}

export const CalculatorPage: React.FC = () => {
  const trades = useTradeStore(state => state.trades);
  const fetchTrades = useTradeStore(state => state.fetchTrades);

  // ─── 물타기 시뮬레이터 상태 ───
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [currentMarketPrice, setCurrentMarketPrice] = useState<string>('');
  
  // 최대 3회차까지 물타기 조건을 관리하기 위한 배열 상태
  // { price: '매수단가', qty: '매수수량' } 객체의 리스트
  const [wateringEntries, setWateringEntries] = useState([
    { price: '', qty: '' },
    { price: '', qty: '' },
    { price: '', qty: '' }
  ]);

  // 컴포넌트 마운트 시 보유 종목 로드
  React.useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // ─────────────────────────────────────────────
  // 보유 종목 계산
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // 물타기 시뮬레이터 로직
  // ─────────────────────────────────────────────
  const waterfallResult = useMemo(() => {
    if (!selectedHolding) return null;

    const currentPrice = parseFloat(currentMarketPrice);
    const existingAvgPrice = selectedHolding.avgPrice;
    const existingQty = selectedHolding.quantity;
    const existingCost = existingAvgPrice * existingQty;

    // 물타기 전 현재 손익률 계산
    const currentPnlRate = !isNaN(currentPrice) && currentPrice > 0
      ? ((currentPrice - existingAvgPrice) / existingAvgPrice) * 100
      : null;

    // 모든 회차의 물타기 데이터를 합산 (유효한 입력값만 처리)
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

    // 물타기 후 현재가 기준 예상 손익률 계산
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

  // 물타기 입력 변경 핸들러
  const handleWateringChange = (index: number, field: 'price' | 'qty', value: string) => {
    setWateringEntries(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <div className="calculator-page animate-fade-in">
      <header className="page-header">
        <div className="header-title-row">
          <div className="icon-box">
            <CalcIcon size={24} />
          </div>
          <h1>매매 계산기</h1>
        </div>
        <p className="text-muted">보유 종목의 물타기 시뮬레이션을 계산합니다.</p>
      </header>

      <div className="calculator-grid">
        {/* 물타기 입력 섹션 */}
        <div className="calc-input-section glass-panel">
          <div className="section-title">
            <h3>물타기 조건 입력</h3>
            <button className="btn-reset" onClick={() => { 
              setSelectedTicker(''); 
              setCurrentMarketPrice(''); 
              setWateringEntries([{ price: '', qty: '' }, { price: '', qty: '' }, { price: '', qty: '' }]);
            }}>
              <RotateCcw size={14} /> 초기화
            </button>
          </div>

          <div className="input-group sim-group">
            <label htmlFor="holdingSelect">📌 보유 종목 선택</label>
            <select
              id="holdingSelect"
              className="sim-select"
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              aria-label="보유 종목 선택"
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
            <div className="sim-holding-info glass-panel">
              <div className="sim-info-row">
                <span className="sim-info-label">현재 평균단가</span>
                <span className="sim-info-val">{Math.floor(selectedHolding.avgPrice).toLocaleString()}원</span>
              </div>
              <div className="sim-info-row">
                <span className="sim-info-label">보유 수량</span>
                <span className="sim-info-val">{selectedHolding.quantity}주</span>
              </div>
              <div className="sim-info-row">
                <span className="sim-info-label">총 투자원금</span>
                <span className="sim-info-val">{Math.floor(selectedHolding.avgPrice * selectedHolding.quantity).toLocaleString()}원</span>
              </div>
            </div>
          )}

          <div className="sim-section-divider">현재 시장 상황</div>
          <div className="input-group sim-group">
            <label htmlFor="marketPrice">현재가 (직접 입력)</label>
            <input
              id="marketPrice"
              type="number"
              placeholder="현재 주가를 입력하세요"
              value={currentMarketPrice}
              onChange={(e) => setCurrentMarketPrice(e.target.value)}
              disabled={!selectedHolding}
              aria-label="현재 시장 가격 직접 입력"
            />
          </div>

          <div className="sim-section-divider">추가 매수 조건 (최대 3회)</div>
          
          {wateringEntries.map((entry, index) => (
            <div key={index} className="watering-row-container">
              <div className="watering-row-label">{index + 1}차 물타기</div>
              <div className="entry-row">
                <div className="input-group sim-group">
                  <label htmlFor={`waterPrice-${index}`}>매수 단가</label>
                  <input
                    id={`waterPrice-${index}`}
                    type="number"
                    placeholder="0"
                    value={entry.price}
                    onChange={(e) => handleWateringChange(index, 'price', e.target.value)}
                    disabled={!selectedHolding}
                    aria-label={`${index + 1}차 추가 매수 단가`}
                  />
                </div>
                <div className="input-group sim-group">
                  <label htmlFor={`waterQty-${index}`}>매수 수량</label>
                  <input
                    id={`waterQty-${index}`}
                    type="number"
                    placeholder="0"
                    value={entry.qty}
                    onChange={(e) => handleWateringChange(index, 'qty', e.target.value)}
                    disabled={!selectedHolding}
                    aria-label={`${index + 1}차 추가 매수 수량`}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="calc-info glass-panel" style={{ marginTop: '1.5rem' }}>
            <h4>💡 물타기 전략 주의사항</h4>
            <ul>
              <li>물타기는 추가 자본이 필요합니다. 여유 자금 범위 내에서만 시뮬레이션하세요.</li>
              <li>평단이 낮아져도 주가가 계속 하락하면 손실은 커집니다.</li>
              <li>현재 손익률 변화 추이를 보며 현실적인 계획을 세우세요.</li>
            </ul>
          </div>
        </div>

        {/* 물타기 결과 섹션 */}
        <div className="calc-result-section">
          {!selectedHolding ? (
            <div className="result-card glass-panel sim-placeholder">
              <TrendingDown size={32} color="var(--text-muted)" />
              <p>왼쪽에서 보유 종목을 선택하면<br/>시뮬레이션 결과가 나타납니다.</p>
            </div>
          ) : (
            <>
              {waterfallResult && waterfallResult.currentPnlRate !== null && (
                <div className={`result-card glass-panel ${(waterfallResult.currentPnlRate ?? 0) >= 0 ? 'success-border' : 'loss-border'}`}>
                  <span className="label">현재 손익률 (물타기 전)</span>
                  <div className="value-group">
                    <span className={`val ${(waterfallResult.currentPnlRate ?? 0) >= 0 ? 'profit-text' : 'loss-text'}`}>
                      {(waterfallResult.currentPnlRate ?? 0) >= 0 ? '+' : ''}{(waterfallResult.currentPnlRate ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}

              {waterfallResult && waterfallResult.newAvgPrice && (
                <>
                  <div className="result-card glass-panel primary-glow">
                    <span className="label">📉 물타기 후 새 평균단가</span>
                    <div className="value-group">
                      <span className="val">{Math.floor(waterfallResult.newAvgPrice).toLocaleString()}</span>
                      <span className="unit">원</span>
                    </div>
                    <div className="return-required">
                      기존 {Math.floor(selectedHolding.avgPrice).toLocaleString()}원 →{' '}
                      <span className="profit-text">
                        {Math.floor(waterfallResult.newAvgPrice).toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div className="result-sub-grid">
                    <div className="result-card glass-panel">
                      <span className="label">총 보유 수량</span>
                      <div className="value-group small">
                        <span className="val">{waterfallResult.newTotalQty}</span>
                        <span className="unit">주</span>
                      </div>
                    </div>
                    <div className="result-card glass-panel">
                      <span className="label">물타기 비용</span>
                      <div className="value-group small">
                        <span className="val loss-text">{(waterfallResult.additionalInvestment ?? 0).toLocaleString()}</span>
                        <span className="unit">원</span>
                      </div>
                    </div>
                  </div>

                  <div className={`result-card glass-panel ${(waterfallResult.afterWaterfallPnlRate ?? 0) >= 0 ? 'success-border' : 'loss-border'}`}>
                    <div className="bep-header">
                      <span className="label">현재 손익률 (물타기 후)</span>
                    </div>
                    <div className="value-group large">
                      <span className={`val ${(waterfallResult.afterWaterfallPnlRate ?? 0) >= 0 ? 'profit-text' : 'loss-text'}`}>
                        {(waterfallResult.afterWaterfallPnlRate ?? 0) >= 0 ? '+' : ''}{(waterfallResult.afterWaterfallPnlRate ?? 0).toFixed(2)}%
                      </span>
                    </div>
                    {waterfallResult.afterWaterfallPnlRate !== null && (
                      <div className="return-required">
                        물타기 전 대비{' '}
                        <span className="profit-text">
                          {((waterfallResult.afterWaterfallPnlRate ?? 0) - (waterfallResult.currentPnlRate ?? 0)).toFixed(2)}% 개선
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!waterfallResult?.newAvgPrice && (
                <div className="result-card glass-panel sim-placeholder">
                  <p className="text-muted">추가 매수 단가와 수량을 입력하면<br/>물타기 시뮬레이션 결과가 나타납니다.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
