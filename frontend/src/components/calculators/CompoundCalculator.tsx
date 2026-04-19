import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Info } from 'lucide-react';
import { fmtKRW, fmtX, fmtInput, parseRaw } from '../../utils/calcFormat';

// TierGate 대신 주석 처리된 구조 유지
// const TierGate: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export const CompoundCalculator: React.FC = () => {
  const [principalStr, setPrincipalStr] = useState('10,000,000');
  const [monthlyStr, setMonthlyStr] = useState('500,000');
  const [rate, setRate] = useState(11);
  const [years, setYears] = useState(1);

  const principal = parseRaw(principalStr);
  const monthly = parseRaw(monthlyStr);

  const result = useMemo(() => {
    const rm = rate / 100 / 12;
    const N = years * 12;
    
    // 최종 자산 계산 (복리 매월 적립 공식)
    let finalVal = principal * Math.pow(1 + rm, N);
    for (let m = 0; m < N; m++) {
      finalVal += monthly * Math.pow(1 + rm, N - m);
    }
    
    const invested = principal + (monthly * N);
    const gain = finalVal - invested;
    const multiple = invested > 0 ? finalVal / invested : 1;
    const rule72 = rate > 0 ? (72 / rate).toFixed(1) : '-';

    // 차트 데이터 생성 (연단위)
    const chartData = Array.from({ length: years + 1 }, (_, y) => {
      const months = y * 12;
      let yFinal = principal * Math.pow(1 + rm, months);
      for (let m = 0; m < months; m++) {
        yFinal += monthly * Math.pow(1 + rm, months - m);
      }
      const yInvested = principal + (monthly * months);
      return {
        label: `${y}년`,
        '복리 자산': Math.round(yFinal),
        '단순 투자금': Math.round(yInvested)
      };
    });

    return {
      finalVal: Math.round(finalVal),
      invested: Math.round(invested),
      gain: Math.round(gain),
      multiple: multiple.toFixed(1),
      rule72,
      chartData
    };
  }, [principal, monthly, rate, years]);

  return (
    <div className="card-fintech p-6 space-y-8 animate-fade-in bg-white dark:bg-bg-card">
      <div className="space-y-1">
        <h2 className="text-xl font-bold flex items-center gap-2">
          복리 수익률 계산기
        </h2>
        <p className="text-xs text-gray-500 font-medium">연복리 기준 최종 자산과 기간별 성장 흐름을 확인합니다</p>
      </div>

      <div className="space-y-6">
        {/* 입력 섹션 */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5 grow">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">초기 투자금</label>
            <div className="relative">
              <input
                type="text"
                className="input-fintech h-12 pr-12 text-right font-bold text-lg"
                value={principalStr}
                onChange={(e) => setPrincipalStr(fmtInput(e.target.value))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
            </div>
          </div>

          <div className="space-y-1.5 grow">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">월 적립금</label>
            <div className="relative">
              <input
                type="text"
                className="input-fintech h-12 pr-12 text-right font-bold text-lg"
                value={monthlyStr}
                onChange={(e) => setMonthlyStr(fmtInput(e.target.value))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
            </div>
          </div>
        </div>

        {/* 슬라이더 섹션 */}
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">연 수익률</label>
              <span className="font-bold text-lg text-right min-w-[48px]">{rate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">투자 기간</label>
              <span className="font-bold text-lg text-right min-w-[48px]">{years}년</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="w-full h-[1px] bg-gray-100 dark:bg-white/5" />

        {/* 결과 카드 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-100 dark:border-amber-500/10 min-w-0 text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">최종 자산</p>
            <p className="text-base md:text-lg font-black text-amber-600 dark:text-amber-400">{fmtKRW(result.finalVal)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 min-w-0 text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">총 투자원금</p>
            <p className="text-base md:text-lg font-black">{fmtKRW(result.invested)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 min-w-0 text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">복리 수익금</p>
            <p className="text-base md:text-lg font-black text-green-500">+{fmtKRW(result.gain)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 min-w-0 text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">수익 배수</p>
            <p className="text-base md:text-lg font-black text-amber-600 dark:text-amber-400">{fmtX(parseFloat(result.multiple))}</p>
          </div>
        </div>

        {/* 차트 섹션 */}
        <div className="pt-6">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.chartData}>
                <defs>
                  <linearGradient id="colorAsset" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BA7517" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#BA7517" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="label" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => (v / 10000).toFixed(0) + '만'} />
                <Tooltip 
                  formatter={(v: any) => fmtKRW(v)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="복리 자산" stroke="#BA7517" strokeWidth={2} fill="url(#colorAsset)" />
                <Area type="monotone" dataKey="단순 투자금" stroke="#94a3b8" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[11px] text-gray-400 leading-relaxed font-medium">
          <Info size={14} className="shrink-0 mt-0.5" />
          <p>72의 법칙: 연 수익률 {rate}%로 자산이 2배가 되는 데 약 {result.rule72}년 소요됩니다.</p>
        </div>
      </div>
    </div>
  );
};
