import React, { useEffect } from 'react';
import { TagChip } from '../components/TagChip';
import { useTradeStore } from '../store/tradeStore';
import './HistoryPage.css';

export const HistoryPage: React.FC = () => {
  const { trades, fetchTrades, isLoading, error } = useTradeStore();

  useEffect(() => {
    fetchTrades('1'); // MVP 하드코딩된 accountId
  }, [fetchTrades]);

  return (
    <div className="history-page animate-fade-in">
      <header className="page-header">
        <h1>매매 히스토리</h1>
      </header>

      <div className="filters-bar glass-panel">
        <input type="text" placeholder="종목명 또는 메모 검색..." className="search-input" />
        <div className="filter-chips">
          <TagChip label="보유중" type="default" selected />
          <TagChip label="추세추종" type="strategy" />
          <TagChip label="단타" type="strategy" />
        </div>
      </div>

      <div className="history-list">
        {isLoading && <div className="p-4 text-center">불러오는 중...</div>}
        {error && <div className="p-4 text-center text-red-500">{error}</div>}
        {!isLoading && trades.length === 0 && <div className="p-4 text-center">기록된 매매 내역이 없습니다.</div>}
        
        {trades.map(trade => (
          <div key={trade.id} className="history-item glass-panel">
            <div className="trade-main">
              <span className={`trade-type ${trade.type}`}>{trade.type === 'buy' ? '매수' : '매도'}</span>
              <div className="trade-info">
                <h3>{trade.name} <span className="ticker">{trade.ticker}</span></h3>
                <span className="trade-date">{new Date(trade.traded_at).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="trade-details">
              <div className="detail-col">
                <span className="label">체결가</span>
                <span>{Number(trade.price).toLocaleString()}</span>
              </div>
              <div className="detail-col">
                <span className="label">수량</span>
                <span>{Number(trade.quantity).toLocaleString()}</span>
              </div>
              <div className="detail-col">
                <span className="label">손익</span>
                {trade.pnl ? (
                  <span className={Number(trade.pnl) > 0 ? 'profit-text' : 'loss-text'}>
                    {Number(trade.pnl) > 0 ? '+' : ''}{Number(trade.pnl).toLocaleString()}
                  </span>
                ) : <span className="text-muted">-</span>}
              </div>
            </div>

            <div className="trade-actions">
               {trade.strategy_tag && <TagChip label={trade.strategy_tag} type="strategy" />}
               {trade.emotion_tag && <TagChip label={trade.emotion_tag} type="emotion" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
