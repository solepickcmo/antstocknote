import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Download, Calculator, AlertCircle } from 'lucide-react';
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
    <div className="max-w-md mx-auto space-y-6 animate-fade-in pb-10">
      {/* 입력 섹션 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calculator className="text-primary" size={20} /> 분할 매수 입력
          </h3>
          <div className="relative">
            <button 
              onClick={fetchHoldings}
              className="text-xs bg-indigo-50 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1"
            >
              <Download size={14} /> 보유 종목 불러오기
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2 max-h-60 overflow-y-auto">
                  {holdings.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">보유 종목이 없습니다.</div>
                  ) : (
                    holdings.map(h => (
                      <button 
                        key={h.ticker} 
                        onClick={() => handleSelectHolding(h)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex flex-col"
                      >
                        <span className="font-bold">{h.name}</span>
                        <span className="text-xs text-gray-400">{h.ticker}</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {isNoteVisible && (
          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>부분 매도가 있는 종목은 수량이 다를 수 있으니 직접 확인 후 수정하세요.</p>
          </div>
        )}

        {/* 매수 회차 리스트 */}
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase">매수가</span>
            <span className="text-[11px] font-bold text-gray-400 uppercase">수량</span>
            <div className="w-8"></div>
          </div>
          
          <div className="space-y-2">
            {rows.map((row) => {
              const isPriceInvalid = parseFloat(row.price) === 0;
              return (
                <div key={row.id} className="group flex flex-col gap-1">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input
                      type="number"
                      aria-label="분할 매수 단가 입력"
                      placeholder="0"
                      className={`w-full px-3 py-2.5 rounded-xl border transition-all text-sm font-semibold outline-none focus:ring-2 focus:ring-primary ${isPriceInvalid ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50'}`}
                      value={row.price}
                      onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                    />
                    <input
                      type="number"
                      aria-label="분할 매수 수량 입력"
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary transition-all"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                    />
                    <button 
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 disabled:opacity-0 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex justify-end px-1">
                    <span className="text-[10px] text-gray-400 font-medium">
                      소계: {formatNumber((parseFloat(row.price) || 0) * (parseFloat(row.quantity) || 0))}원
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={addRow}
            disabled={rows.length >= 10}
            className="w-full py-2 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:hidden"
          >
            <Plus size={16} /> 회차 추가 (최대 10회)
          </button>
        </div>

        <div className="pt-4 border-t border-gray-50 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">현재가 (현재 상황 확인용)</label>
            <input
              type="number"
              aria-label="현재가 입력"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-lg"
              placeholder="현재 주가를 입력하세요"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 결과 섹션 */}
      {!results.hasQty ? (
        <div className="bg-gray-50 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200">
           <AlertCircle size={32} className="mb-2 opacity-20" />
           <p className="text-sm font-medium">수량을 입력하면 계산이 시작됩니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">총 투자금</span>
              <span className="text-sm font-bold truncate">{formatNumber(results.totalCost)}<span className="text-[10px] ml-0.5">원</span></span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">평균 매수가</span>
              <span className="text-sm font-bold truncate text-primary">{formatNumber(results.avgPrice)}<span className="text-[10px] ml-0.5">원</span></span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">총 수량</span>
              <span className="text-sm font-bold truncate">{results.totalQty}<span className="text-[10px] ml-0.5">주</span></span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">손익분기점 (BEP)</span>
              <span className="text-lg font-bold text-primary">{formatNumber(results.bepPrice)}원</span>
            </div>

            {parseFloat(currentPrice) > 0 && (
              <>
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">평가 손익</span>
                    <span className={`text-lg font-bold ${results.currentPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.currentPnl >= 0 ? '+' : ''}{formatNumber(results.currentPnl)}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">현재 수익률</span>
                    <div className="flex items-center gap-2">
                       {results.currentPnl < 0 && results.requiredReturn !== null && (
                         <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold">BEP까지 +{results.requiredReturn.toFixed(2)}% 필요</span>
                       )}
                       <span className={`text-lg font-bold ${results.currentPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {results.currentPnl >= 0 ? '+' : ''}{results.currentPnlRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* 게이지 바 */}
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                        <span>손실 구간</span>
                        <span>수익 구간</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden flex">
                        <div className="h-full bg-red-400 w-1/2"></div>
                        <div className="h-full bg-green-400 w-1/2"></div>
                        {/* 마커 */}
                        <div 
                            className="absolute top-0 w-1 h-full bg-white shadow-md transition-all duration-500"
                            style={{ left: `${results.gaugePos}%`, transform: 'translateX(-50%)' }}
                        />
                    </div>
                    <div className="flex justify-center">
                        <span className="text-[10px] text-primary font-bold">BEP (0.00%)</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
