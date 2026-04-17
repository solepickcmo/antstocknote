import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Download, Calculator, AlertCircle, TrendingDown } from 'lucide-react';
import { supabase } from '../../api/supabase';
import { useAuthStore } from '../../store/authStore';

interface TradeRow {
  id: string;
  price: string;
  quantity: string;
}

export const BEPCalculator: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [rows, setRows] = useState<TradeRow[]>([
    { id: '1', price: '', quantity: '' }
  ]);
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [holdings, setHoldings] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNoteVisible, setIsNoteVisible] = useState(false);

  // 보유 종목 불러오기
  const fetchHoldings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('ticker, name, price, quantity, type, is_open')
        .eq('is_open', true)
        .eq('type', 'buy');

      if (error) throw error;

      // ticker별로 그룹화
      const grouped = (data || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.ticker]) {
          acc[curr.ticker] = { ticker: curr.ticker, name: curr.name, trades: [] };
        }
        acc[curr.ticker].trades.push(curr);
        return acc;
      }, {});

      setHoldings(Object.values(grouped));
      setShowDropdown(true);
    } catch (err) {
      console.error('보유 종목 불러오기 실패:', err);
      alert('보유 종목을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleSelectHolding = (holding: any) => {
    const newRows = holding.trades.map((t: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      price: t.price.toString(),
      quantity: t.quantity.toString()
    }));
    setRows(newRows);
    setShowDropdown(false);
    setIsNoteVisible(true);
  };

  const addRow = () => {
    if (rows.length >= 10) return;
    setRows([...rows, { id: Math.random().toString(36).substr(2, 9), price: '', quantity: '' }]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof TradeRow, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const results = useMemo(() => {
    let totalCost = 0;
    let totalQty = 0;
    let validRowsCount = 0;

    rows.forEach(row => {
      const p = parseFloat(row.price);
      const q = parseFloat(row.quantity);
      if (!isNaN(p) && !isNaN(q) && q > 0) {
        totalCost += p * q;
        totalQty += q;
        validRowsCount++;
      }
    });

    const avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
    const currPriceNum = parseFloat(currentPrice);
    
    // 수수료 제외, BEP = 평균 매수가
    const bepPrice = avgPrice;
    
    const requiredReturn = bepPrice > 0 && currPriceNum > 0
      ? ((bepPrice / currPriceNum) - 1) * 100
      : null;

    const currentEval = currPriceNum > 0 ? currPriceNum * totalQty : 0;
    const currentPnl = currPriceNum > 0 ? currentEval - totalCost : 0;
    const currentPnlRate = totalCost > 0 ? (currentPnl / totalCost) * 100 : 0;

    // 게이지 바 위치 (%)
    // BEP 기준 현재가 위치. 손절선(BEP - 10%) ~ 수익선(BEP + 10%) 사이로 시각화
    let gaugePos = 50; 
    if (bepPrice > 0 && currPriceNum > 0) {
        const diff = ((currPriceNum / bepPrice) - 1) * 100; // 수익률
        gaugePos = 50 + (diff * 5); // 1%당 5% 이동
        gaugePos = Math.max(0, Math.min(100, gaugePos));
    }

    return { totalCost, totalQty, avgPrice, bepPrice, requiredReturn, currentEval, currentPnl, currentPnlRate, gaugePos, hasQty: totalQty > 0 };
  }, [rows, currentPrice]);

  const formatNumber = (val: number) => Math.round(val).toLocaleString('ko-KR');

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in pb-10">
      {/* 입력 섹션 */}
      <div className="card-fintech space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-fintech-xl font-fintech-bold flex items-center gap-3">
            <Calculator className="primary-text" size={24} /> 
            <span>분할 매수 시뮬레이터</span>
          </h3>
          <div className="relative">
            <button 
              onClick={fetchHoldings}
              className="btn-fintech-secondary"
            >
              <Download size={14} /> 보유 종목 불러오기
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#2B3139] rounded-xl shadow-2xl border border-border z-20 py-2 max-h-72 overflow-y-auto">
                  {holdings.length === 0 ? (
                    <div className="px-4 py-4 text-fintech-sm text-muted text-center">보유 종목이 없습니다.</div>
                  ) : (
                    holdings.map(h => (
                      <button 
                        key={h.ticker} 
                        onClick={() => handleSelectHolding(h)}
                        className="w-full text-left px-4 py-3 hover:bg-card-fintech transition-colors flex flex-col gap-0.5"
                      >
                        <span className="font-fintech-bold text-fintech-base">{h.name}</span>
                        <span className="text-fintech-xs text-muted">{h.ticker}</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {isNoteVisible && (
          <div className="flex items-start gap-3 text-fintech-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="leading-relaxed">부분 매도가 있는 종목은 실제 수량과 다를 수 있습니다. 정확한 현재 보유량을 직접 확인 후 입력해 주세요.</p>
          </div>
        )}

        {/* 매수 회차 리스트 */}
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-2">
            <span className="label-fintech">매수 단가 (원)</span>
            <span className="label-fintech">수량 (주)</span>
            <div className="w-10"></div>
          </div>
          
          <div className="space-y-3">
            {rows.map((row, index) => {
              const isPriceInvalid = parseFloat(row.price) === 0;
              return (
                <div key={row.id} className="group animate-fade-in">
          <div className="grid grid-cols-[1.1fr_1fr_auto] gap-2 items-center">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0"
                        className={`input-fintech text-fintech-sm ${isPriceInvalid ? 'border-danger bg-danger/5' : ''}`}
                        value={row.price}
                        onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0"
                        className="input-fintech text-fintech-sm"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="w-10 h-10 flex items-center justify-center text-muted hover:text-danger disabled:opacity-0 transition-colors bg-card-fintech rounded-lg hover:bg-danger/10"
                      title="삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center px-2 mt-2">
                    <span className="text-fintech-xs text-muted font-bold">{index + 1}회차 매수</span>
                    <span className="text-fintech-xs text-muted font-medium">
                      소계: <span className="text-main">{formatNumber((parseFloat(row.price) || 0) * (parseFloat(row.quantity) || 0))}</span>원
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={addRow}
            disabled={rows.length >= 10}
            className="w-full py-4 border-2 border-dashed border-border rounded-pill text-muted hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3 text-fintech-sm font-fintech-bold disabled:hidden bg-transparent hover:bg-primary/5 shadow-sm"
          >
            <Plus size={20} /> 회차 추가 (최대 10회)
          </button>
        </div>

        <div className="pt-6 border-t border-border space-y-3">
          <label className="label-fintech">현재가 (수익률 계산용)</label>
          <input
            type="number"
            className="input-fintech text-fintech-xl py-3 h-auto text-center font-fintech-bold primary-text"
            placeholder="현재 주가를 입력하세요"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
          />
        </div>
      </div>

      {/* 결과 섹션 */}
      {!results.hasQty ? (
        <div className="card-fintech py-16 flex flex-col items-center justify-center text-muted border-dashed bg-transparent">
           <Calculator size={48} className="mb-4 opacity-10" />
           <p className="text-fintech-base font-fintech-bold">데이터를 입력하면 시뮬레이션 결과가 표시됩니다.</p>
           <p className="text-fintech-xs mt-2">매수가와 수량을 최소 1회차 이상 입력해 주세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="card-fintech p-5 flex flex-col gap-2">
              <span className="label-fintech">총 투자금</span>
              <div className="flex items-baseline gap-1">
                <span className="text-fintech-xl font-fintech-black">{formatNumber(results.totalCost)}</span>
                <span className="text-fintech-xs text-muted">원</span>
              </div>
            </div>
            <div className="card-fintech p-5 flex flex-col gap-2 border-primary/20 bg-primary/5">
              <span className="label-fintech primary-text">평균 매수가 (BEP)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-fintech-2xl font-fintech-black primary-text">{formatNumber(results.avgPrice)}</span>
                <span className="text-fintech-xs primary-text opacity-70">원</span>
              </div>
            </div>
            <div className="card-fintech p-5 flex flex-col gap-2">
              <span className="label-fintech">총 보유 수량</span>
              <div className="flex items-baseline gap-1">
                <span className="text-fintech-xl font-fintech-black">{results.totalQty}</span>
                <span className="text-fintech-xs text-muted">주</span>
              </div>
            </div>
          </div>

          <div className="card-fintech p-6 space-y-5 bg-ink text-white border-none shadow-xl">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="text-fintech-sm text-slate uppercase tracking-widest font-fintech-bold">손익분기점 (BEP)</h4>
                <p className="text-fintech-xs text-slate opacity-60">본전 탈출을 위해 도달해야 하는 가격입니다.</p>
              </div>
              <span className="text-fintech-3xl font-fintech-black primary-text">{formatNumber(results.bepPrice)}원</span>
            </div>

            {parseFloat(currentPrice) > 0 && (
              <div className="pt-8 border-t border-white/10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <span className="text-fintech-xs text-slate uppercase font-fintech-bold">평가 손익</span>
                    <p className={`text-fintech-3xl font-fintech-black ${results.currentPnl >= 0 ? 'profit-text' : 'loss-text'}`}>
                      {results.currentPnl >= 0 ? '+' : ''}{formatNumber(results.currentPnl)}원
                    </p>
                  </div>
                  <div className="space-y-2 text-right">
                    <span className="text-fintech-xs text-slate uppercase font-fintech-bold">예상 수익률</span>
                    <div className="flex items-center justify-end gap-3 mt-1">
                       {results.currentPnl < 0 && results.requiredReturn !== null && (
                         <div className="bg-danger/20 text-danger px-3 py-1 rounded-full text-[10px] font-fintech-black border border-danger/30 flex items-center gap-1">
                           <TrendingDown size={10} /> BEP까지 +{results.requiredReturn.toFixed(2)}% 필요
                         </div>
                       )}
                       <span className={`text-fintech-3xl font-fintech-black ${results.currentPnl >= 0 ? 'profit-text' : 'loss-text'}`}>
                        {results.currentPnl >= 0 ? '+' : ''}{results.currentPnlRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 게이지 바 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-fintech-xs text-slate font-fintech-bold uppercase">포지션 상태 지표</span>
                      <div className="flex gap-4 text-[10px] items-center">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-danger"></div> <span className="text-slate">손실</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success"></div> <span className="text-slate">수익</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary"></div> <span className="text-slate">BEP</span></div>
                      </div>
                    </div>
                    <span className="text-fintech-xs font-fintech-black primary-text">탈출 확률: {results.currentPnl >= 0 ? '100%' : `${Math.floor(results.gaugePos)}%`}</span>
                  </div>
                  
                  <div className="relative pt-2">
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden flex border border-white/10 p-0.5">
                        <div className="h-full bg-danger/60 w-1/2 rounded-l-full"></div>
                        <div className="h-full bg-success/60 w-1/2 rounded-r-full"></div>
                        {/* 마커 */}
                        <div 
                            className="absolute top-0 w-1.5 h-6 bg-primary shadow-[0_0_15px_rgba(240,185,11,0.8)] transition-all duration-700 ease-out z-10 rounded-full"
                            style={{ left: `${results.gaugePos}%`, transform: 'translateX(-50%) translateY(-4px)' }}
                        />
                    </div>
                    <div className="absolute top-[34px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-0.5 h-2 bg-primary/40"></div>
                        <span className="text-[9px] text-primary font-fintech-black mt-1">BEP (0.00%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
