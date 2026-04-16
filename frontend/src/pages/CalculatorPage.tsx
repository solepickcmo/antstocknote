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
  const [additionalPrice, setAdditionalPrice] = useState<string>('');
  const [additionalQty, setAdditionalQty] = useState<string>('');

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
    const addPrice = parseFloat(additionalPrice);
    const addQty = parseFloat(additionalQty);

    const existingAvgPrice = selectedHolding.avgPrice;
    const existingQty = selectedHolding.quantity;
    const existingCost = existingAvgPrice * existingQty;

    const currentPnlRate = !isNaN(currentPrice) && currentPrice > 0
      ? ((currentPrice - existingAvgPrice) / existingAvgPrice) * 100
      : null;

    if (isNaN(addPrice) || isNaN(addQty) || addPrice <= 0 || addQty <= 0) {
      return { currentPnlRate, newAvgPrice: null, newTotalQty: null, additionalInvestment: null, requiredRisePct: null };
    }

    const additionalCost = addPrice * addQty;
    const newTotalCost = existingCost + additionalCost;
    const newTotalQty = existingQty + addQty;
    const newAvgPrice = newTotalCost / newTotalQty;
    const breakEvenTargetPrice = Math.ceil(newAvgPrice) + 1;

    const requiredRisePct = !isNaN(currentPrice) && currentPrice > 0
      ? ((breakEvenTargetPrice - currentPrice) / currentPrice) * 100
      : null;

    const afterWaterfallPnlRate = !isNaN(currentPrice) && currentPrice > 0
      ? ((currentPrice - newAvgPrice) / newAvgPrice) * 100
      : null;

    return {
      currentPnlRate,
      newAvgPrice,
      newTotalQty,
      additionalInvestment: additionalCost,
      breakEvenTargetPrice,
      requiredRisePct,
      afterWaterfallPnlRate,
    };
  }, [selectedHolding, currentMarketPrice, additionalPrice, additionalQty]);

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
            <button className="btn-reset" onClick={() => { setSelectedTicker(''); setCurrentMarketPrice(''); setAdditionalPrice(''); setAdditionalQty(''); }}>
              <RotateCcw size={14} /> 초기화
            </button>
          </div>

          <div className="input-group sim-group">
            <label>📌 보유 종목 선택</label>
            <select
              className="sim-select"
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
            <label>현재가 (직접 입력)</label>
            <input
              type="number"
              placeholder="현재 주가를 입력하세요"
              value={currentMarketPrice}
              onChange={(e) => setCurrentMarketPrice(e.target.value)}
              disabled={!selectedHolding}
            />
          </div>

          <div className="sim-section-divider">추가 매수 조건 (물타기)</div>
          <div className="entry-row">
            <div className="input-group sim-group">
              <label>추가 매수 단가</label>
              <input
                type="number"
                placeholder="0"
                value={additionalPrice}
                onChange={(e) => setAdditionalPrice(e.target.value)}
                disabled={!selectedHolding}
              />
            </div>
            <div className="input-group sim-group">
              <label>추가 수량</label>
              <input
                type="number"
                placeholder="0"
                value={additionalQty}
                onChange={(e) => setAdditionalQty(e.target.value)}
                disabled={!selectedHolding}
              />
            </div>
          </div>

          <div className="calc-info glass-panel" style={{ marginTop: '1.5rem' }}>
            <h4>💡 물타기 전략 주의사항</h4>
            <ul>
              <li>물타기는 추가 자본이 필요합니다. 여유 자금 범위 내에서만 시뮬레이션하세요.</li>
              <li>평단이 낮아져도 주가가 계속 하락하면 손실은 커집니다.</li>
              <li>흑자 전환에 필요한 상승률이 현실적인지 반드시 확인하세요.</li>
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
              {waterfallResult?.currentPnlRate !== null && (
                <div className={`result-card glass-panel ${(waterfallResult.currentPnlRate ?? 0) >= 0 ? 'success-border' : 'loss-border'}`}>
                  <span className="label">현재 손익률 (물타기 전)</span>
                  <div className="value-group">
                    <span className={`val ${(waterfallResult.currentPnlRate ?? 0) >= 0 ? 'profit-text' : 'loss-text'}`}>
                      {(waterfallResult.currentPnlRate ?? 0) >= 0 ? '+' : ''}{(waterfallResult.currentPnlRate ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}

              {waterfallResult?.newAvgPrice && (
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
                      <span className="label">추가 투자 필요금액</span>
                      <div className="value-group small">
                        <span className="val loss-text">{(waterfallResult.additionalInvestment ?? 0).toLocaleString()}</span>
                        <span className="unit">원</span>
                      </div>
                    </div>
                  </div>

                  <div className="result-card glass-panel success-border">
                    <div className="bep-header">
                      <span className="label">흑자 전환 최소 목표가</span>
                    </div>
                    <div className="value-group large">
                      <span className="val profit-text">{(waterfallResult.breakEvenTargetPrice ?? 0).toLocaleString()}</span>
                      <span className="unit">원</span>
                    </div>
                    {waterfallResult.requiredRisePct !== null && (
                      <div className="return-required">
                        현재가 대비{' '}
                        <span className={waterfallResult.requiredRisePct <= 0 ? 'profit-text' : 'loss-text'}>
                          {waterfallResult.requiredRisePct > 0 ? '+' : ''}{waterfallResult.requiredRisePct.toFixed(2)}% 상승
                        </span>{' '}
                        필요
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
