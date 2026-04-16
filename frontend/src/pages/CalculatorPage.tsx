import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, RotateCcw, Calculator as CalcIcon } from 'lucide-react';
import './CalculatorPage.css';

interface BuyEntry {
  id: string;
  price: string;
  quantity: string;
}

export const CalculatorPage: React.FC = () => {
  const [entries, setEntries] = useState<BuyEntry[]>([
    { id: '1', price: '', quantity: '' }
  ]);
  const [sellFeeRate, setSellFeeRate] = useState<string>('0.23'); // 기본 수수료율 (보통 0.23% 정도)

  const addEntry = () => {
    if (entries.length < 10) {
      setEntries([...entries, { id: Math.random().toString(36).substr(2, 9), price: '', quantity: '' }]);
    }
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: string, field: 'price' | 'quantity', value: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const reset = () => {
    setEntries([{ id: '1', price: '', quantity: '' }]);
    setSellFeeRate('0.23');
  };

  const stats = useMemo(() => {
    let totalCost = 0;
    let totalQty = 0;

    entries.forEach(e => {
      const p = parseFloat(e.price);
      const q = parseFloat(e.quantity);
      if (!isNaN(p) && !isNaN(q)) {
        totalCost += p * q;
        totalQty += q;
      }
    });

    const avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
    const fee = parseFloat(sellFeeRate) / 100;
    const bepPrice = avgPrice * (1 + fee);
    const requiredReturnPct = avgPrice > 0 ? ((bepPrice / avgPrice) - 1) * 100 : 0;

    return {
      totalCost,
      totalQty,
      avgPrice,
      bepPrice,
      requiredReturnPct
    };
  }, [entries, sellFeeRate]);

  return (
    <div className="calculator-page animate-fade-in">
      <header className="page-header">
        <div className="header-title-row">
          <div className="icon-box">
            <CalcIcon size={24} />
          </div>
          <h1>손익분기점 계산기</h1>
        </div>
        <p className="text-muted">분할 매수 시의 평균 단가와 수수료를 포함한 탈출 가격을 계산합니다.</p>
      </header>

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
                    onChange={(e) => updateEntry(entry.id, 'price', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>수량</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={entry.quantity} 
                    onChange={(e) => updateEntry(entry.id, 'quantity', e.target.value)}
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
                onChange={(e) => setSellFeeRate(e.target.value)}
              />
            </div>
            <p className="fee-helper">유관기관수수료 + 세금 등을 포함한 요율을 입력하세요.</p>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="calc-result-section">
          <div className="result-card glass-panel primary-glow">
            <span className="label">평균 매수 단가</span>
            <div className="value-group">
              <span className="val">{Math.floor(stats.avgPrice).toLocaleString()}</span>
              <span className="unit">원</span>
            </div>
          </div>

          <div className="result-sub-grid">
            <div className="result-card glass-panel">
              <span className="label">총 투자 금액</span>
              <div className="value-group small">
                <span className="val">{Math.floor(stats.totalCost).toLocaleString()}</span>
                <span className="unit">원</span>
              </div>
            </div>
            <div className="result-card glass-panel">
              <span className="label">총 보유 수량</span>
              <div className="value-group small">
                <span className="val">{stats.totalQty.toLocaleString()}</span>
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
              <span className="val profit-text">{Math.ceil(stats.bepPrice).toLocaleString()}</span>
              <span className="unit">원</span>
            </div>
            <div className="return-required">
              탈출을 위한 필요 수익률: <span className="profit-text">+{stats.requiredReturnPct.toFixed(2)}%</span>
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
    </div>
  );
};
