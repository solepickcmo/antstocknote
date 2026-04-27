import React, { useState, useEffect, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useTradeStore } from '../store/tradeStore';
import { exportTradesToCSV } from '../utils/exportUtils';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import './HistoryPage.css';

// onRecordClick: 기록하기 버튼 클릭 시 TradeModal을 여는 함수 (HistoryPage에서 주입)
interface MobileHistoryViewProps {
  onRecordClick: () => void;
}

export const MobileHistoryView: React.FC<MobileHistoryViewProps> = ({ onRecordClick }) => {
  const trades = useTradeStore(state => state.trades);
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const isLoading = useTradeStore(state => state.isLoading);
  const error = useTradeStore(state => state.error);
  const [activeTab, setActiveTab] = useState<'all' | 'holdings'>('all');

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Holdings Calculation
  const holdings = useMemo(() => {
    const holdingsMap = new Map();
    trades.forEach(trade => {
      if (!holdingsMap.has(trade.ticker)) {
        holdingsMap.set(trade.ticker, {
          ticker: trade.ticker,
          name: trade.name,
          totalCost: 0,
          quantity: 0,
        });
      }
      const holding = holdingsMap.get(trade.ticker);
      const quantityValue = Number(trade.quantity);
      const priceValue = Number(trade.price);
      
      if (trade.type === 'buy') {
        holding.quantity += quantityValue;
        holding.totalCost += priceValue * quantityValue;
      } else if (trade.type === 'sell' && holding.quantity > 0) {
        // 이동평균법: 매도 시 기존 평균 단가를 적용하여 투자 원금 차감
        const avgCost = holding.totalCost / holding.quantity;
        holding.quantity -= quantityValue;
        holding.totalCost -= avgCost * quantityValue;
      }
    });

    const activeHoldings: any[] = [];
    let portfolioTotalValue = 0;
    let portfolioTotalCost = 0;

    holdingsMap.forEach(holding => {
      if (holding.quantity > 0.000001) {
        const avgPrice = holding.totalCost / holding.quantity;
        // 임시 시뮬레이션: 티커 해시값을 활용한 변동률 적용 (실제 가격 API 연동 전까지 유지)
        const mockRandom = (parseInt(holding.ticker, 10) % 100) / 100; 
        const priceModifier = 0.95 + (mockRandom * 0.15); 
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
    
    // 포트폴리오 비중 계산
    activeHoldings.forEach(holding => {
      holding.weight = portfolioTotalValue > 0 ? (holding.currentValue / portfolioTotalValue) * 100 : 0;
    });

    return {
      list: activeHoldings.sort((a, b) => b.weight - a.weight), // 비중 높은 순 정렬
      totalCost: portfolioTotalCost
    };
  }, [trades]);

  return (
    <div className="history-page animate-fade-in">
      <header className="page-header history-header">
        <h1 className="flex items-center">
          매매 내역
          <HelpTooltip content="기록된 모든 매수/매도 내역을 최신순으로 확인하고 보관합니다." iconSize={20} className="ml-1" />
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-header-action secondary" 
            onClick={() => exportTradesToCSV(trades)}
            style={{ padding: '0 10px', display: 'flex', alignItems: 'center' }}
          >
            <Download size={18} />
          </button>
          <button 
            className="btn-header-action min-h-[44px] whitespace-nowrap" 
            onClick={onRecordClick}
          >
            + 기록
          </button>
        </div>
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
            <input 
              type="text" 
              placeholder="종목명·메모 검색..." 
              className="search-input" 
              aria-label="매매 내역 검색"
            />
            <div className="filter-chips">
              <span className="chip active">전체</span>
              <span className="chip">매수</span>
              <span className="chip">매도</span>
              <span className="chip">보유중</span>
              <span className="chip">추세추종</span>
            </div>
          </div>

          <div className="history-list">
            {isLoading && <div className="p-4 text-center">불러오는 중...</div>}
            {error && <div className="p-4 text-center text-red-500">{error}</div>}
            
            {trades.map((trade: any) => (
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
            {holdings.list.map((holding: any, index: number) => (
              <div key={holding.ticker} className="holding-card glass-panel">
                 <div className="holding-top">
                   <div>
                     <span className="ticker">{holding.ticker}</span>
                     <span className="name">{holding.name}</span>
                   </div>
                 </div>
                 
                 <div className="holding-mid text-muted text-sm my-1">
                   {holding.quantity}주 · 평균 {Math.floor(holding.avgPrice).toLocaleString()}원
                 </div>
                 
                 <div className="holding-grid">
                   <div className="grid-cell" style={{ borderRight: '1px solid var(--border)' }}>
                     <span className="label">매수금액</span>
                     <span className="val">{Math.floor(holding.totalCost).toLocaleString()}</span>
                   </div>
                   <div className="grid-cell right">
                     <span className="label">비중</span>
                     <span className="val">{holding.weight.toFixed(0)}%</span>
                   </div>
                 </div>
                 
                 <div className="weight-bar-container">
                   <span className="weight-label">포트폴리오 비중</span>
                   <span className="weight-val-small">{holding.weight.toFixed(0)}%</span>
                   <div className="weight-track">
                     <div className="weight-fill" style={{ width: `${holding.weight}%`, backgroundColor: `hsl(${(index * 50) % 360}, 70%, 50%)` }}></div>
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
