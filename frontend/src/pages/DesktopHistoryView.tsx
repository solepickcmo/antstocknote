import React, { useEffect, useState } from 'react';
import { Download, Lock } from 'lucide-react';
import { TagChip } from '../components/TagChip';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { useTradeStore } from '../store/tradeStore';
import { useTierStore } from '../store/tierStore';
import { exportTradesToCSV } from '../utils/exportUtils';
import { format, subMonths, startOfDay, endOfDay } from 'date-fns';
import './HistoryPage.css';

// onRecordClick: HistoryPage에서 주입되는 모달 열기 함수
interface DesktopHistoryViewProps {
  onRecordClick: () => void;
}

/**
 * 데스크톱 매매 내역 뷰.
 *
 * 기간 필터 Tier 구분 (orchestration.md §13):
 *   - free:    최근 3개월 고정 (날짜 선택 UI disabled + 자물쇠)
 *   - premium: DateRange 직접 선택 가능 (가입일 ~ 오늘)
 */
export const DesktopHistoryView: React.FC<DesktopHistoryViewProps> = ({ onRecordClick: _onRecordClick }) => {
  const trades        = useTradeStore(state => state.trades);
  const fetchTrades   = useTradeStore(state => state.fetchTrades);
  const isLoading     = useTradeStore(state => state.isLoading);
  const error         = useTradeStore(state => state.error);
  const canSetDateRange = useTierStore(state => state.canAccess('history_date_range'));

  // Free: 3개월 고정 / Premium: 사용자 조정 가능
  const defaultFrom = subMonths(new Date(), 3);
  const [dateFrom, setDateFrom] = useState<string>(format(defaultFrom, 'yyyy-MM-dd'));
  const [dateTo,   setDateTo]   = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // 기간 변경 핸들러 — Free Tier는 변경 불가
  const handleDateChange = (field: 'from' | 'to', value: string) => {
    if (!canSetDateRange) return; // 조용히 무시 (UI가 이미 disabled)
    if (field === 'from') setDateFrom(value);
    else setDateTo(value);
  };

  // 선택된 기간으로 필터링
  const filteredTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.traded_at);
    return (
      tradeDate >= startOfDay(new Date(dateFrom)) &&
      tradeDate <= endOfDay(new Date(dateTo))
    );
  });

  return (
    <div className="history-page animate-fade-in desktop-history">
      <header className="page-header">
        <div className="title-group">
          <h1 className="flex items-center">
            매매 내역
            <HelpTooltip content="지금까지 기록한 모든 매수/매도 내역을 최신순으로 확인하고, 태그 및 기간별로 검색할 수 있습니다." className="ml-2" iconSize={24} />
          </h1>
          <p className="text-muted text-sm mt-1">기록된 모든 매수/매도 내역을 확인하세요.</p>
        </div>
        <button
          className="btn-export"
          onClick={() => exportTradesToCSV(trades)}
        >
          <Download size={16} />
          내보내기 (CSV)
        </button>
      </header>

      {/* 기간 필터 — Free: disabled + 자물쇠 아이콘 */}
      <div className="filters-bar glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>기간</span>

          {/* 시작일 */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="date"
              value={dateFrom}
              disabled={!canSetDateRange}
              onChange={e => handleDateChange('from', e.target.value)}
              className="search-input"
              style={{
                minWidth: '140px',
                cursor: canSetDateRange ? 'pointer' : 'not-allowed',
                opacity: canSetDateRange ? 1 : 0.6,
                paddingRight: canSetDateRange ? '12px' : '36px',
              }}
              aria-label="조회 시작일"
            />
            {/* Free Tier: 자물쇠 아이콘 오버레이 */}
            {!canSetDateRange && (
              <Lock
                size={14}
                style={{
                  position: 'absolute',
                  right: '10px',
                  color: 'var(--text-meta)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>

          <span style={{ color: 'var(--text-meta)' }}>~</span>

          {/* 종료일 */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="date"
              value={dateTo}
              disabled={!canSetDateRange}
              onChange={e => handleDateChange('to', e.target.value)}
              className="search-input"
              style={{
                minWidth: '140px',
                cursor: canSetDateRange ? 'pointer' : 'not-allowed',
                opacity: canSetDateRange ? 1 : 0.6,
                paddingRight: canSetDateRange ? '12px' : '36px',
              }}
              aria-label="조회 종료일"
            />
            {!canSetDateRange && (
              <Lock
                size={14}
                style={{
                  position: 'absolute',
                  right: '10px',
                  color: 'var(--text-meta)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>

          {/* Free Tier 안내 문구 */}
          {!canSetDateRange && (
            <span
              className="text-sm"
              style={{ color: 'var(--text-meta)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Lock size={12} />
              최근 3개월 고정 · <strong style={{ color: 'var(--primary)' }}>Premium</strong>에서 직접 설정
            </span>
          )}
        </div>

        {/* 검색 + 태그 필터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="종목명 또는 메모 검색..."
            className="search-input"
            aria-label="매매 내역 검색"
            style={{ flex: 1, minWidth: '200px' }}
          />
          <div className="filter-chips">
            <TagChip label="보유중" type="default" selected />
            <TagChip label="추세추종" type="strategy" />
            <TagChip label="단타" type="strategy" />
          </div>
        </div>
      </div>

      {/* 매매 내역 목록 */}
      <div className="history-list">
        {isLoading && <div className="p-4 text-center">불러오는 중...</div>}
        {error && <div className="p-4 text-center" style={{ color: 'var(--ui-error)' }}>{error}</div>}
        {!isLoading && filteredTrades.length === 0 && (
          <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
            기록된 매매 내역이 없습니다.
          </div>
        )}

        {filteredTrades.map(trade => (
          <div key={trade.id} className="history-item glass-panel desktop-row-item">
            <span className={`trade-type ${trade.type}`}>
              {trade.type === 'buy' ? '매수' : '매도'}
            </span>
            <div className="trade-info-inline">
              <span className="ticker">{trade.ticker}</span>
              <span className="name">{trade.name}</span>
            </div>
            <div className="trade-date">
              {format(new Date(trade.traded_at), 'yyyy.MM.dd HH:mm')}
            </div>
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
              ) : (
                <span className="val" style={{ color: 'var(--text-muted)' }}>-</span>
              )}
            </div>
            <div className="trade-actions-inline">
              {trade.strategy_tag && <TagChip label={trade.strategy_tag.split('-')[0].trim()} type="strategy" />}
              {trade.emotion_tag  && <TagChip label={trade.emotion_tag} type="emotion" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
