import React, { useEffect } from 'react';
import { Download } from 'lucide-react';
import { TagChip } from '../components/TagChip';
import { useTradeStore } from '../store/tradeStore';
import { exportTradesToCSV } from '../utils/exportUtils';
import { format } from 'date-fns';
import './HistoryPage.css';

export const DesktopHistoryView: React.FC = () => {
  const { trades, fetchTrades, isLoading, error } = useTradeStore();

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return (
    <div className="history-page animate-fade-in desktop-history">
      <header className="page-header">
        <div className="title-group">
          <h1>매매 내역</h1>
          <p className="text-muted text-sm">기록된 모든 매수/매도 내역을 확인하세요.</p>
        </div>
        <button 
          className="btn-export" 
          onClick={() => exportTradesToCSV(trades)}
        >
          <Download size={16} />
          내보내기 (CSV)
        </button>
      </header>

      <div className="filters-bar glass-panel">
        <input 
          type="text" 
          placeholder="종목명 또는 메모 검색..." 
          className="search-input" 
          aria-label="매매 내역 검색"
        />
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
          <div key={trade.id} className="history-item glass-panel desktop-row-item">
            <span className={`trade-type ${trade.type}`}>{trade.type === 'buy' ? '매수' : '매도'}</span>
            <div className="trade-info-inline">
              <span className="ticker">{trade.ticker}</span>
              <span className="name">{trade.name}</span>
            </div>
            <div className="trade-date">{format(new Date(trade.traded_at), 'yyyy.MM.dd HH:mm')}</div>
            <div className="detail-inline">
              <span className="label">체결가</span>
              <span className="val">₩ {Number(trade.price).toLocaleString()}</span>
            </div>
            <div className="detail-inline">
              <span className="label">수량</span>
              <span className="val">{Number(trade.quantity).toLocaleString()}</span>
            </div>
            <div className="detail-inline">
              <span className="label">실현손익</span>
              {trade.pnl ? (
                <span className={`val ${Number(trade.pnl) > 0 ? 'profit-text' : 'loss-text'}`}>
                  {Number(trade.pnl) > 0 ? '+' : ''}{Number(trade.pnl).toLocaleString()}
                </span>
              ) : <span className="val text-muted">-</span>}
            </div>
            <div className="trade-actions-inline">
               {trade.strategy_tag && <TagChip label={trade.strategy_tag.split('-')[0].trim()} type="strategy" />}
               {trade.emotion_tag && <TagChip label={trade.emotion_tag} type="emotion" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
