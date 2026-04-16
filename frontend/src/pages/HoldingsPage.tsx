import React, { useEffect, useMemo, useState } from 'react';
import { useTradeStore } from '../store/tradeStore';
import './HoldingsPage.css';
import { MoreHorizontal, Plus } from 'lucide-react';

export const HoldingsPage: React.FC = () => {
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const trades = useTradeStore(state => state.trades);
  const setModalOpen = useTradeStore(state => state.setModalOpen);
  const [filter, setFilter] = useState('보유중');

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // calculating holdings
  const holdings = useMemo(() => {
    const map = new Map();

    // ⚠️ 중요: 매매 데이터는 최신순 정렬로 저장되어 있으므로,
    // 수량 계산 시 '매도가 먼저 처리'되어 보유 수량이 틀리는 문제가 발생할 수 있습니다.
    // 시간 오름차순으로 정렬하여 반드시 매수 → 매도 순서로 계산합니다.
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime()
    );

    sortedTrades.forEach(t => {
      if (!map.has(t.ticker)) {
        map.set(t.ticker, {
          ticker: t.ticker,
          name: t.name,
          trades: [],
          totalCost: 0,
          quantity: 0,
          tags: new Set(),
          lastBuyDate: null
        });
      }
      
      const holding = map.get(t.ticker);
      holding.trades.push(t);
      
      if (t.strategy_tag) holding.tags.add(t.strategy_tag);
      if (t.emotion_tag) holding.tags.add(t.emotion_tag);
      
      const qty = Number(t.quantity);
      const price = Number(t.price);
      
      if (t.type === 'buy') {
        holding.quantity += qty;
        holding.totalCost += price * qty;
        if (!holding.lastBuyDate || new Date(t.traded_at) > new Date(holding.lastBuyDate)) {
          holding.lastBuyDate = t.traded_at;
        }
      } else if (t.type === 'sell') {
        if (holding.quantity > 0) {
           const avgCost = holding.totalCost / holding.quantity;
           holding.quantity -= qty;
           holding.totalCost -= avgCost * qty;
        }
      }
    });

    const activeHoldings: any[] = [];
    map.forEach(holding => {
      if (holding.quantity > 0.000001) {
        activeHoldings.push({
          ...holding,
          avgPrice: holding.quantity > 0 ? holding.totalCost / holding.quantity : 0,
          tags: Array.from(holding.tags).filter(t => t).slice(0, 2)
        });
      }
    });
    
    return activeHoldings.sort((a, b) => {
      if (!a.lastBuyDate) return 1;
      if (!b.lastBuyDate) return -1;
      return new Date(b.lastBuyDate).getTime() - new Date(a.lastBuyDate).getTime();
    });
  }, [trades]);

  const displayList = filter === '보유중' ? holdings : []; // Simple mock filter, actually '보유중' implies active holdings

  return (
    <div className="holdings-page animate-fade-in">
      <header className="holdings-header">
        <h1>보유 종목</h1>
        <div className="header-actions">
          <button className="add-btn" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> 기록 추가
          </button>
          <button className="more-btn">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      <div className="holdings-filters glass-panel">
         <input type="text" placeholder="종목명·메모 검색..." className="search-input" />
         <div className="filter-chips">
            <button className={`chip ${filter === '전체' ? 'active' : ''}`}>전체</button>
            <button className={`chip ${filter === '매수' ? 'active' : ''}`}>매수</button>
            <button className={`chip ${filter === '매도' ? 'active' : ''}`}>매도</button>
            <button className={`chip ${filter === '보유중' ? 'active' : ''}`} onClick={() => setFilter('보유중')}>보유중</button>
            <button className={`chip ${filter === '추세추종' ? 'active' : ''}`}>추세추종</button>
            <button className={`chip ${filter === '이달' ? 'active' : ''}`}>이달</button>
         </div>
      </div>

      <div className="holdings-summary">
        <p>총 {displayList.length}건</p>
      </div>

      <div className="holdings-table-container glass-panel">
        <table className="holdings-table">
          <thead>
            <tr>
              <th className="col-ticker">종목</th>
              <th className="col-name">이름</th>
              <th className="col-tags">태그</th>
              <th className="col-price text-right">평균단가</th>
              <th className="col-qty text-right">보유수량</th>
            </tr>
          </thead>
          <tbody>
            {displayList.length === 0 ? (
               <tr>
                 <td colSpan={5} className="empty-state">내역이 없습니다.</td>
               </tr>
            ) : (
                displayList.map(h => (
                <tr key={h.ticker}>
                  <td className="col-ticker">
                    <span className="ticker-badge">{h.ticker}</span>
                  </td>
                  <td className="col-name">
                    <div className="name-wrapper">
                      <strong>{h.name}</strong>
                      <span className="name-date">
                        {h.lastBuyDate ? new Date(h.lastBuyDate).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''} · 매수
                      </span>
                    </div>
                  </td>
                  <td className="col-tags">
                     <div className="tags-wrapper">
                       {h.tags.map((tag: any, idx: number) => (
                         <span key={idx} className="tag-chip">
                           {tag.replace('#', '')}
                         </span>
                       ))}
                     </div>
                  </td>
                  <td className="col-price text-right">
                    {Math.floor(h.avgPrice).toLocaleString()}
                  </td>
                  <td className="col-qty text-right">
                    {h.quantity}주
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
