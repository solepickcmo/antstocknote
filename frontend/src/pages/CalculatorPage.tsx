import React, { useState, useMemo } from 'react';
import { Plus, Trash2, RotateCcw, Calculator as CalcIcon, TrendingDown } from 'lucide-react';
import { useTradeStore } from '../store/tradeStore';
import './CalculatorPage.css';

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

interface BuyEntry {
  id: string;
  price: string;
  quantity: string;
}

// ─────────────────────────────────────────────
// 보유 종목 계산 헬퍼
// tradeStore의 매매 내역에서 현재 보유 종목과 평균단가를 계산합니다.
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

  // 탭 상태: 'bep' = 손익분기점 계산기, 'waterfall' = 물타기 시뮬레이터
  const [activeTab, setActiveTab] = useState<'bep' | 'waterfall'>('bep');

  // ─── BEP 계산기 상태 ───
  const [entries, setEntries] = useState<BuyEntry[]>([
    { id: '1', price: '', quantity: '' }
  ]);
  const [sellFeeRate, setSellFeeRate] = useState<string>('0.23');

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
  // 보유 종목 계산 (HoldingsPage.tsx와 동일한 로직)
  // ─────────────────────────────────────────────
  const currentHoldings = useMemo((): HoldingSummary[] => {
    const map = new Map<string, { ticker: string; name: string; totalCost: number; quantity: number }>();

    // 시간 오름차순으로 정렬하여 매수 → 매도 순서를 보장
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
      // 잔여 수량이 있는 종목만 표시 (전량 매도된 종목 제외)
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

  // 선택된 보유 종목 정보
  const selectedHolding = currentHoldings.find(h => h.ticker === selectedTicker) ?? null;

  // ─────────────────────────────────────────────
  // BEP 계산기 로직
  // ─────────────────────────────────────────────

  const addEntry = () => {
    if (entries.length < 10) {
      setEntries([...entries, { id: Math.random().toString(36).substr(2, 9), price: '', quantity: '' }]);
    }
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const updateEntry = (id: string, field: 'price' | 'quantity', value: string) => {
    setEntries(entries.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
  };

  const reset = () => {
    setEntries([{ id: '1', price: '', quantity: '' }]);
    setSellFeeRate('0.23');
  };

  const bepStatistics = useMemo(() => {
    let totalCost = 0;
    let totalQty = 0;

    entries.forEach(entry => {
      const priceValue = parseFloat(entry.price);
      const quantityValue = parseFloat(entry.quantity);
      if (!isNaN(priceValue) && !isNaN(quantityValue)) {
        totalCost += priceValue * quantityValue;
        totalQty += quantityValue;
      }
    });

    const averagePrice = totalQty > 0 ? totalCost / totalQty : 0;
    const feeDecimal = parseFloat(sellFeeRate) / 100;
    const breakEvenPrice = averagePrice * (1 + feeDecimal);
    const requiredReturnPct = averagePrice > 0 ? ((breakEvenPrice / averagePrice) - 1) * 100 : 0;

    return { totalCost, totalQty, averagePrice, breakEvenPrice, requiredReturnPct };
  }, [entries, sellFeeRate]);

  // ─────────────────────────────────────────────
  // 물타기 시뮬레이터 로직
  //
  // 계산 공식:
  //   새 평단 = (기존 투자원금 + 추가 매수금) / (기존 보유수량 + 추가 수량)
  //   현재 손익률 = (현재가 - 기존 평단) / 기존 평단 × 100
  //   물타기 후 손익률(현재가 기준) = (현재가 - 새 평단) / 새 평단 × 100
  //   필요 상승률 = (새 평단 - 현재가) / 현재가 × 100 (흑자 전환까지)
  // ─────────────────────────────────────────────
  const waterfallResult = useMemo(() => {
    if (!selectedHolding) return null;

    const currentPrice = parseFloat(currentMarketPrice);
    const addPrice = parseFloat(additionalPrice);
    const addQty = parseFloat(additionalQty);

    const existingAvgPrice = selectedHolding.avgPrice;
    const existingQty = selectedHolding.quantity;
    const existingCost = existingAvgPrice * existingQty;

    // 현재 손익률 (물타기 전, 현재 시장가 기준)
    const currentPnlRate = !isNaN(currentPrice) && currentPrice > 0
      ? ((currentPrice - existingAvgPrice) / existingAvgPrice) * 100
      : null;

    // 추가 매수 정보가 없으면 현재 상태만 반환
    if (isNaN(addPrice) || isNaN(addQty) || addPrice <= 0 || addQty <= 0) {
      return { currentPnlRate, newAvgPrice: null, newTotalQty: null, additionalInvestment: null, requiredRisePct: null };
    }

    const additionalCost = addPrice * addQty;
    const newTotalCost = existingCost + additionalCost;
    const newTotalQty = existingQty + addQty;

    // 물타기 후 새 평균단가
    const newAvgPrice = newTotalCost / newTotalQty;

    // 흑자 전환 최소 주가 = 새 평단 + 1원
    const breakEvenTargetPrice = Math.ceil(newAvgPrice) + 1;

    // 현재가 대비 흑자 전환까지 필요한 상승률
    const requiredRisePct = !isNaN(currentPrice) && currentPrice > 0
      ? ((breakEvenTargetPrice - currentPrice) / currentPrice) * 100
      : null;

    // 물타기 후 현재가 기준 손익 (현재가 입력 시)
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
        <p className="text-muted">손익분기점과 물타기 시뮬레이션을 계산합니다.</p>
      </header>

      {/* 탭 컨트롤 */}
      <div className="calc-tabs glass-panel">
        <button
          className={`calc-tab-btn ${activeTab === 'bep' ? 'active' : ''}`}
          onClick={() => setActiveTab('bep')}
        >
          <CalcIcon size={15} /> 손익분기점 계산기
        </button>
        <button
          className={`calc-tab-btn ${activeTab === 'waterfall' ? 'active' : ''}`}
          onClick={() => setActiveTab('waterfall')}
        >
          <TrendingDown size={15} /> 물타기 시뮬레이터
        </button>
      </div>

      {/* ─────────── BEP 계산기 탭 ─────────── */}
      {activeTab === 'bep' && (
        <div className="calculator-grid">
          {/* 입력 섹션 */}
          <div className="calc-input-section glass-panel">
            <div className="section-title">
              <h3>매수 내역 입력</h3>
              <button className="btn-reset" onClick={reset}>
                <RotateCcw size={14} /> 초기화
              </button>
            </div>

            <div className="entry-list">
              {entries.map((entry, index) => (
                <div key={entry.id} className="entry-row">
                  <div className="entry-num">{index + 1}</div>
                  <div className="input-group">
                    <label>단가</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={entry.price}
                      onChange={(event) => updateEntry(entry.id, 'price', event.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>수량</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={entry.quantity}
                      onChange={(event) => updateEntry(entry.id, 'quantity', event.target.value)}
                    />
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => removeEntry(entry.id)}
                    disabled={entries.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button className="btn-add-entry" onClick={addEntry} disabled={entries.length >= 10}>
              <Plus size={16} /> 매수 회차 추가 ({entries.length}/10)
            </button>

            <div className="fee-setting">
              <div className="input-group">
                <label>매도 수수료율 (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sellFeeRate}
                  onChange={(event) => setSellFeeRate(event.target.value)}
                />
              </div>
              <p className="fee-helper">유관기관수수료 + 세금 등을 포함한 요율을 입력하세요.</p>
            </div>
          </div>

          {/* BEP 결과 섹션 */}
          <div className="calc-result-section">
            <div className="result-card glass-panel primary-glow">
              <span className="label">평균 매수 단가</span>
              <div className="value-group">
                <span className="val">{Math.floor(bepStatistics.averagePrice).toLocaleString()}</span>
                <span className="unit">원</span>
              </div>
            </div>

            <div className="result-sub-grid">
              <div className="result-card glass-panel">
                <span className="label">총 투자 금액</span>
                <div className="value-group small">
                  <span className="val">{Math.floor(bepStatistics.totalCost).toLocaleString()}</span>
                  <span className="unit">원</span>
                </div>
              </div>
              <div className="result-card glass-panel">
                <span className="label">총 보유 수량</span>
                <div className="value-group small">
                  <span className="val">{bepStatistics.totalQty.toLocaleString()}</span>
                  <span className="unit">주</span>
                </div>
              </div>
            </div>

            <div className="result-card glass-panel success-border">
              <div className="bep-header">
                <span className="label">손익분기 매도가 (BEP)</span>
                <span className="bep-hint">수수료 포함</span>
              </div>
              <div className="value-group large">
                <span className="val profit-text">{Math.ceil(bepStatistics.breakEvenPrice).toLocaleString()}</span>
                <span className="unit">원</span>
              </div>
              <div className="return-required">
                탈출을 위한 필요 수익률: <span className="profit-text">+{bepStatistics.requiredReturnPct.toFixed(2)}%</span>
              </div>
            </div>

            <div className="calc-info glass-panel">
              <h4>💡 계산기 활용 팁</h4>
              <ul>
                <li>물타기를 결정하기 전, 목표 평단을 맞추기 위해 필요한 수량을 미리 시뮬레이션 해보세요.</li>
                <li>수수료율을 보수적으로 입력하면 보다 안전한 매도 시점을 잡을 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─────────── 물타기 시뮬레이터 탭 ─────────── */}
      {activeTab === 'waterfall' && (
        <div className="calculator-grid">
          {/* 물타기 입력 섹션 */}
          <div className="calc-input-section glass-panel">
            <div className="section-title">
              <h3>물타기 조건 입력</h3>
              <button className="btn-reset" onClick={() => { setSelectedTicker(''); setCurrentMarketPrice(''); setAdditionalPrice(''); setAdditionalQty(''); }}>
                <RotateCcw size={14} /> 초기화
              </button>
            </div>

            {/* 보유 종목 선택 드롭다운 */}
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
              {currentHoldings.length === 0 && (
                <p className="fee-helper">⚠️ 보유 중인 종목이 없습니다. 매수 기록을 먼저 추가해 주세요.</p>
              )}
            </div>

            {/* 선택된 종목의 현재 정보 표시 */}
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

            {/* 현재 시장가 입력 */}
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

            {/* 추가 매수 조건 */}
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
                {/* 현재 상태 */}
                {waterfallResult?.currentPnlRate !== null && waterfallResult?.currentPnlRate !== undefined && (
                  <div className={`result-card glass-panel ${(waterfallResult.currentPnlRate ?? 0) >= 0 ? 'success-border' : 'loss-border'}`}>
                    <span className="label">현재 손익률 (물타기 전)</span>
                    <div className="value-group">
                      <span className={`val ${(waterfallResult.currentPnlRate ?? 0) >= 0 ? 'profit-text' : 'loss-text'}`}>
                        {(waterfallResult.currentPnlRate ?? 0) >= 0 ? '+' : ''}{(waterfallResult.currentPnlRate ?? 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="return-required">
                      현재가 {parseFloat(currentMarketPrice).toLocaleString()}원 기준
                    </div>
                  </div>
                )}

                {/* 물타기 후 결과 */}
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
                        {' '}({(((waterfallResult.newAvgPrice - selectedHolding.avgPrice) / selectedHolding.avgPrice) * 100).toFixed(2)}% 변화)
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
                        <span className="bep-hint">수수료 제외</span>
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

                    {/* 물타기 후 현재가 기준 손익률 */}
                    {waterfallResult.afterWaterfallPnlRate !== null && (
                      <div className={`result-card glass-panel ${(waterfallResult.afterWaterfallPnlRate ?? 0) >= 0 ? 'success-border' : 'loss-border'}`}>
                        <span className="label">물타기 후 손익률 (현재가 기준)</span>
                        <div className="value-group">
                          <span className={`val ${(waterfallResult.afterWaterfallPnlRate ?? 0) >= 0 ? 'profit-text' : 'loss-text'}`}>
                            {(waterfallResult.afterWaterfallPnlRate ?? 0) >= 0 ? '+' : ''}{(waterfallResult.afterWaterfallPnlRate ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 추가 매수 미입력 안내 */}
                {!waterfallResult?.newAvgPrice && (
                  <div className="result-card glass-panel sim-placeholder">
                    <p className="text-muted">추가 매수 단가와 수량을 입력하면<br/>물타기 시뮬레이션 결과가 나타납니다.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
