import React, { useEffect, useMemo, useState } from 'react';
import { useTradeStore } from '../store/tradeStore';
import './HistoryPage.css';

export const MobileHistoryView: React.FC = () => {
  const { trades, fetchTrades, isLoading, error } = useTradeStore();
  const [activeTab, setActiveTab] = useState<'all' | 'holdings'>('all');

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Holdings Calculation
  const holdings = useMemo(() => {
    const map = new Map();
    trades.forEach(t => {
      if (!map.has(t.ticker)) {
        map.set(t.ticker, {
          ticker: t.ticker,
          name: t.name,
          totalCost: 0,
          quantity: 0,
        });
      }
      const holding = map.get(t.ticker);
      const qty = Number(t.quantity);
      const price = Number(t.price);
      
      if (t.type === 'buy') {
        holding.quantity += qty;
        holding.totalCost += price * qty;
      } else if (t.type === 'sell' && holding.quantity > 0) {
        const avgCost = holding.totalCost / holding.quantity;
        holding.quantity -= qty;
        holding.totalCost -= avgCost * qty;
      }
    });

    const activeHoldings: any[] = [];
    let portfolioTotalValue = 0;
    let portfolioTotalCost = 0;

    map.forEach(holding => {
      if (holding.quantity > 0.000001) {
        const avgPrice = holding.totalCost / holding.quantity;
        // Mock current price for simulation (+5% to -3% range based on hash of ticker)
        const mockRandom = (parseInt(holding.ticker, 10) % 100) / 100; // 0 to 0.99
        const priceModifier = 0.95 + (mockRandom * 0.15); // 0.95 to 1.10
        const currentPrice = Math.floor(avgPrice * priceModifier);
        
        const currentValue = currentPrice * holding.quantity;
        const pnl = currentValue - holding.totalCost;
        const pnlPct = (pnl / holding.totalCost) * 100;

        portfolioTotalCost += holding.totalCost;
        portfolioTotalValue += currentValue;
        
        activeHoldings.push({
          ...holding,
          avgPrice,
          currentPrice,
          pnl,
          pnlPct,
          currentValue
        });
      }
    });
    
    // Calculate weights
    activeHoldings.forEach(h => {
      h.weight = portfolioTotalValue > 0 ? (h.currentValue / portfolioTotalValue) * 100 : 0;
    });

    return {
      list: activeHoldings.sort((a, b) => b.weight - a.weight), // Sort by weight
      totalCost: portfolioTotalCost
    };
  }, [trades]);

  return (
    <div className="history-page animate-fade-in">
      <header className="page-header history-header">
        <h1>매매 내역</h1>
        <button className="btn-header-action">+ 기록</button>
      </header>

      <div className="history-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          전체 거래
        </button>
        <button 
          className={`tab-btn ${activeTab === 'holdings' ? 'active' : ''}`}
          onClick={() => setActiveTab('holdings')}
        >
          보유 종목
        </button>
      </div>

      {activeTab === 'all' && (
        <div className="tab-pane all-trades-pane">
          <div className="filters-bar-mobile">
            <input type="text" placeholder="종목명·메모 검색..." className="search-input" />
            <div className="filter-chips">
              <span className="chip active">전체</span>
              <span className="chip">매수</span>
              <span className="chip">매도</span>
              <span className="chip">보유중</span>
              <span className="chip">추세추종</span>
            </div>
            <div className="trades-summary">
              총 {trades.length}건 · 실현손익 ...
            </div>
          </div>

          <div className="history-list">
            {isLoading && <div className="p-4 text-center">불러오는 중...</div>}
            {error && <div className="p-4 text-center text-red-500">{error}</div>}
            
            {trades.map(trade => (
              <div key={trade.id} className="trade-card glass-panel">
                <div className="trade-card-top">
                  <div>
                    <span className="ticker">{trade.ticker}</span>
                    <span className="name">{trade.name}</span>
                  </div>
                  <div className="trade-price-group">
                    {trade.pnl ? (
                      <span className={`trade-pnl ${Number(trade.pnl) > 0 ? 'profit' : 'loss'}`}>
                        {Number(trade.pnl) > 0 ? '+' : ''}{Number(trade.pnl).toLocaleString()}
                      </span>
                    ) : (
                      <span className="price-val">{Number(trade.price).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="trade-card-mid">
                  <span className={`badge-type ${trade.type}`}>{trade.type === 'buy' ? '매수' : '매도'}</span>
                  <span className="trade-date-tag">
                    {new Date(trade.traded_at).toLocaleDateString(undefined, {month: '2-digit', day: '2-digit'})} 
                    {trade.strategy_tag && ` · ${trade.strategy_tag.replace('#', '')}`}
                  </span>
                  <span className="trade-status ml-auto text-muted text-sm">{trade.is_open ? '보유중' : '매도완료'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'holdings' && (
        <div className="tab-pane holdings-pane">
          <div className="holdings-summary-banner glass-panel">
            <div className="summary-col">
              <span className="label">보유 종목</span>
              <span className="val">{holdings.list.length}종목</span>
            </div>
            <div className="summary-col">
              <span className="label">총 매수금액</span>
              <span className="val">{Math.floor(holdings.totalCost).toLocaleString()}원</span>
            </div>
          </div>
          
          <div className="holdings-subtext">
            is_open = TRUE 기준 · 비중 순 정렬
          </div>

          <div className="holdings-list">
            {holdings.list.map((h, idx) => (
              <div key={h.ticker} className="holding-card glass-panel">
                 <div className="holding-top">
                   <div>
                     <span className="ticker">{h.ticker}</span>
                     <span className="name">{h.name}</span>
                   </div>
                 </div>
                 
                 <div className="holding-mid text-muted text-sm my-1">
                   {h.quantity}주 · 평균 {Math.floor(h.avgPrice).toLocaleString()}원
                 </div>
                 
                 <div className="holding-grid">
                   <div className="grid-cell" style={{ borderRight: '1px solid var(--border)' }}>
                     <span className="label">매수금액</span>
                     <span className="val">{Math.floor(h.totalCost).toLocaleString()}</span>
                   </div>
                   <div className="grid-cell right">
                     <span className="label">비중</span>
                     <span className="val">{h.weight.toFixed(0)}%</span>
                   </div>
                 </div>
                 
                 <div className="weight-bar-container">
                   <span className="weight-label">포트폴리오 비중</span>
                   <span className="weight-val-small">{h.weight.toFixed(0)}%</span>
                   <div className="weight-track">
                     <div className="weight-fill" style={{ width: `${h.weight}%`, backgroundColor: `hsl(${(idx * 50) % 360}, 70%, 50%)` }}></div>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
