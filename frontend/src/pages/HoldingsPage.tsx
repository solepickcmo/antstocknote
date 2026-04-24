import React, { useEffect, useMemo, useState } from 'react';
import { useTradeStore } from '../store/tradeStore';
import './HoldingsPage.css';
import { Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { StockAnalysisModal } from '../components/StockAnalysisModal';

const COLORS = [
  '#378ADD', '#1D9E75', '#BA7517', '#D85A30',
  '#7F77DD', '#D4537E', '#639922', '#888780',
];

export const HoldingsPage: React.FC = () => {
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const trades = useTradeStore(state => state.trades);
  const setModalOpen = useTradeStore(state => state.setModalOpen);
  const [filter, setFilter] = useState('보유중');

  // 종목 분석 모달 상태
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisTicker, setAnalysisTicker] = useState('');
  const [analysisStockName, setAnalysisStockName] = useState('');

  const openAnalysisModal = (ticker: string, name: string) => {
    setAnalysisTicker(ticker);
    setAnalysisStockName(name);
    setAnalysisModalOpen(true);
  };

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
    let portfolioTotalCost = 0;
    
    map.forEach(holding => {
      // 0.000001 마진
      if (holding.quantity > 0.000001) {
        portfolioTotalCost += holding.totalCost;
        activeHoldings.push({
          ...holding,
          avgPrice: holding.quantity > 0 ? holding.totalCost / holding.quantity : 0,
          currentValue: holding.totalCost, // 평균단가 기준 초기 투자 총액 (Mock)
          tags: Array.from(holding.tags).filter(t => t).slice(0, 2)
        });
      }
    });

    // 비중 계산
    activeHoldings.forEach(holding => {
       holding.weight = portfolioTotalCost > 0 ? (holding.currentValue / portfolioTotalCost) * 100 : 0;
    });
    
    return activeHoldings.sort((a, b) => {
      return b.weight - a.weight; // 비중순 정렬
    });
  }, [trades]);

  const displayList = filter === '보유중' ? holdings : []; // Simple mock filter, actually '보유중' implies active holdings

  const chartData = useMemo(() => {
    return holdings.map((h) => ({
      name: h.name,
      value: h.currentValue,
      weight: h.weight,
    }));
  }, [holdings]);

  return (
    <>
    <div className="holdings-page animate-fade-in">
      <header className="holdings-header">
        <div className="title-group">
          <h1>종목 분석</h1>
          <p className="text-muted text-sm">현재 보유 중인 포트폴리오 현황입니다.</p>
        </div>
        <div className="header-actions">
          <button className="add-btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> 기록 추가
          </button>
        </div>
      </header>

      <div className="holdings-filters glass-panel">
         <div className="search-box">
           <input 
             type="text" 
             placeholder="종목명·티커 검색..." 
             className="search-input" 
             aria-label="보유 종목 검색"
           />
         </div>
         <div className="filter-chips">
            <button className={`chip ${filter === '전체' ? 'active' : ''}`} onClick={() => setFilter('전체')}>전체</button>
            <button className={`chip ${filter === '보유중' ? 'active' : ''}`} onClick={() => setFilter('보유중')}>보유중</button>
         </div>
      </div>

      <div className="mb-6 glass-panel p-4 pb-2">
        {holdings.length === 0 ? (
          <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">
            보유 종목이 없습니다
          </div>
        ) : (
          <>
            <div className="h-[180px] md:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    label={(props: any) => `${props.name} ${props.payload.weight.toFixed(1)}%`}
                    labelLine={true}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [Math.round(value).toLocaleString('ko-KR') + '원', '평가금액']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-gray-400 text-center mt-2">
              평균매수가 기준 투자금액 비중
            </div>
          </>
        )}
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
              <th className="col-action text-center">분석</th>
            </tr>
          </thead>
          <tbody>
            {displayList.length === 0 ? (
               <tr>
                 <td colSpan={5} className="empty-state">내역이 없습니다.</td>
               </tr>
            ) : (
                displayList.map(h => (
                <tr key={h.ticker} className="table-row-hover">
                  <td className="col-ticker">
                    <span className="ticker-badge">{h.ticker}</span>
                  </td>
                  <td className="col-name">
                    <div className="name-wrapper">
                      <strong>{h.name}</strong>
                      <span className="name-date text-xs">
                        {h.lastBuyDate ? format(new Date(h.lastBuyDate), 'MM.dd HH:mm') : ''} · 매수
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
                  <td className="col-price text-right font-mono">
                    ₩ {Math.floor(h.avgPrice).toLocaleString()}
                  </td>
                  <td className="col-qty text-right font-mono">
                    {h.quantity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })}
                  </td>
                  <td className="col-action text-center">
                    <button
                      onClick={() => openAnalysisModal(h.ticker, h.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                      aria-label={`${h.name} 분석 기록`}
                    >
                      <FileText size={12} />
                      분석
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* 종목 분석 모달 */}
      <StockAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        presetTicker={analysisTicker}
        presetStockName={analysisStockName}
      />
    </>
  );
};
