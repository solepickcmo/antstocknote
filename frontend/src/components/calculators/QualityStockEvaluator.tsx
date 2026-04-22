import React, { useState, useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Info, RotateCcw, TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';
import { evaluateStock } from '../../lib/utils/stockEvaluator';
import type { StockMetrics, MetricScore } from '../../lib/utils/stockEvaluator';

// ─────────────────────────────────────────────
// 상수: 텐배거 지표 입력 필드 메타데이터
// ─────────────────────────────────────────────
const METRIC_FIELDS: {
  key: keyof StockMetrics;
  label: string;
  unit: string;
  placeholder: string;
  hint: string;
  reason: string; // 텐배거 추천 이유
  step: string;
  category: 'growth' | 'profitability' | 'stability';
}[] = [
  {
    key: 'epsGrowth',
    label: 'EPS 증가율',
    unit: '%',
    placeholder: '25',
    hint: '주당순이익의 폭발적 성장이 주가 상승의 엔진입니다.',
    reason: '"주가의 엔진" - 텐배거 주식의 가장 공통된 특징은 이익의 폭발적 성장입니다.',
    step: '0.1',
    category: 'growth',
  },
  {
    key: 'revenueGrowth',
    label: '매출액 증가율',
    unit: '%',
    placeholder: '20',
    hint: '시장 점유율 확대를 보여주는 외형 성장의 증거입니다.',
    reason: '"성장의 증거" - 외형 성장이 없는 이익 성장은 한계가 있으므로 반드시 체크해야 합니다.',
    step: '0.1',
    category: 'growth',
  },
  {
    key: 'roe',
    label: 'ROE',
    unit: '%',
    placeholder: '18',
    hint: '기업이 주주의 돈을 얼마나 효율적으로 불리고 있는지 보여줍니다.',
    reason: '"효율적인 복리 머신" - 15% 이상의 ROE를 꾸준히 유지하는 기업은 복리 효과가 극대화됩니다.',
    step: '0.1',
    category: 'profitability',
  },
  {
    key: 'operatingMargin',
    label: '영업이익률',
    unit: '%',
    placeholder: '15',
    hint: '높은 마진은 독점적 해자가 있음을 의미합니다.',
    reason: '"강력한 해자" - 가격 결정권이 활발한 기업은 장기 성장에 유리합니다.',
    step: '0.1',
    category: 'profitability',
  },
  {
    key: 'retentionRate',
    label: '유보율',
    unit: '%',
    placeholder: '1200',
    hint: '위기 시에도 무너지지 않는 성장을 위한 실탄입니다.',
    reason: '"성장을 위한 실탄" - 유보율이 높아야 위기 상황에서도 공격적인 투자를 이어갈 수 있습니다.',
    step: '1',
    category: 'stability',
  },
  {
    key: 'debtRatio',
    label: '부채비율',
    unit: '%',
    placeholder: '60',
    hint: '성장주는 재무 건전성이 뒷받침되어야 안전합니다.',
    reason: '"재무 안전망" - 부채비율 100% 미만의 기업이 장기 성장에 안정적입니다.',
    step: '1',
    category: 'stability',
  },
];

const SCORE_COLORS = {
  excellent: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  good: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  },
  caution: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    bar: 'bg-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  },
};

const INITIAL_METRICS: Record<keyof StockMetrics, string> = {
  epsGrowth: '',
  revenueGrowth: '',
  roe: '',
  operatingMargin: '',
  debtRatio: '',
  retentionRate: '',
};

// ─────────────────────────────────────────────
// 개별 지표 점수 카드 컴포넌트
// ─────────────────────────────────────────────
const MetricScoreCard: React.FC<{ metric: MetricScore }> = ({ metric }) => {
  const isGreat = metric.score === metric.maxScore;
  const colors = isGreat ? SCORE_COLORS.excellent : metric.score > 0 ? SCORE_COLORS.good : SCORE_COLORS.caution;
  const barWidth = (metric.score / metric.maxScore) * 100;

  return (
    <div className={`p-4 rounded-xl border ${colors.bg} transition-all duration-300`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {metric.label}
        </p>
        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${colors.badge}`}>
          {Math.round(metric.score)}/{metric.maxScore}
        </span>
      </div>
      <p className={`text-xl font-black mb-2 ${colors.text}`}>
        {metric.value === 0 && metric.score === 0 ? '-' : metric.value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}{metric.unit}
      </p>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed font-medium">
        {metric.remark}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export const QualityStockEvaluator: React.FC = () => {
  const [inputs, setInputs] = useState<Record<keyof StockMetrics, string>>(INITIAL_METRICS);
  const [activeHint, setActiveHint] = useState<keyof StockMetrics | null>(null);

  const handleChange = (key: keyof StockMetrics, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => setInputs(INITIAL_METRICS);

  const hasAnyInput = Object.values(inputs).some((v) => v !== '');

  const metrics: StockMetrics = useMemo(() => ({
    epsGrowth: parseFloat(inputs.epsGrowth) || 0,
    revenueGrowth: parseFloat(inputs.revenueGrowth) || 0,
    roe: parseFloat(inputs.roe) || 0,
    operatingMargin: parseFloat(inputs.operatingMargin) || 0,
    debtRatio: parseFloat(inputs.debtRatio) || 100, // 기본값 100%
    retentionRate: parseFloat(inputs.retentionRate) || 0,
  }), [inputs]);

  const result = useMemo(() => {
    if (!hasAnyInput) return null;
    return evaluateStock(metrics);
  }, [metrics, hasAnyInput]);

  const radarData = result?.metricScores.map((m) => ({
    subject: m.label,
    score: (m.score / m.maxScore) * 100,
    fullMark: 100,
  })) ?? [];

  const renderCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'growth': return <TrendingUp size={14} className="text-blue-500" />;
      case 'profitability': return <BarChart3 size={14} className="text-emerald-500" />;
      case 'stability': return <ShieldCheck size={14} className="text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="card-fintech p-6 space-y-8 animate-fade-in bg-white dark:bg-bg-card max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🚀 텐배거(Ten-bagger) 시뮬레이터
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-pre-wrap">
            10배 성장이 기대되는 기업의 성장성, 수익성, 안정성을 가중치 기반으로 평가합니다.
          </p>
        </div>
        {hasAnyInput && (
          <button onClick={handleReset} className="btn-fintech-secondary text-[11px] h-8 px-3 flex items-center gap-1.5">
            <RotateCcw size={12} /> 초기화
          </button>
        )}
      </div>

      {/* 입력 섹션: 카테고리별 그룹화 */}
      <div className="space-y-6">
        {['growth', 'profitability', 'stability'].map((cat) => (
           <div key={cat} className="space-y-3">
             <div className="flex items-center gap-2 px-1">
               {renderCategoryIcon(cat)}
               <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                 {cat === 'growth' ? '성장성 (50%)' : cat === 'profitability' ? '수익성 (30%)' : '안정성 (20%)'}
               </h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {METRIC_FIELDS.filter(f => f.category === cat).map((field) => (
                 <div key={field.key} className="space-y-1.5 p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-transparent hover:border-primary/20 transition-all">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-1.5">
                       <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                         {field.label}
                       </label>
                       <button
                         type="button"
                         onMouseEnter={() => setActiveHint(field.key)}
                         onMouseLeave={() => setActiveHint(null)}
                         className="text-gray-300 hover:text-primary transition-colors"
                       >
                         <Info size={12} />
                       </button>
                     </div>
                     <span className="text-[10px] text-gray-400 font-medium">{field.hint}</span>
                   </div>
                   
                   {/* 툴팁 */}
                   {activeHint === field.key && (
                     <p className="text-[10px] text-primary/80 bg-primary/5 p-2 rounded-lg leading-relaxed animate-in fade-in slide-in-from-top-1">
                       {field.reason}
                     </p>
                   )}

                   <div className="relative">
                     <input
                       type="number" step={field.step} min="0" placeholder={field.placeholder}
                       className="input-fintech h-10 pr-10 text-right font-bold bg-white dark:bg-bg-card"
                       value={inputs[field.key]}
                       onChange={(e) => handleChange(field.key, e.target.value)}
                     />
                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-black">
                       {field.unit}
                     </span>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        ))}
      </div>

      {/* 결과 섹션 */}
      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-full h-[1px] bg-gray-100 dark:bg-white/5" />

          {/* 종합 판정 */}
          <div className={`p-6 rounded-3xl border-2 flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${
            SCORE_COLORS[result.grade].bg
          } border-current/10`}>
            <div className="space-y-2">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">TEN-BAGGER GRADE</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl drop-shadow-sm">{result.gradeEmoji}</span>
                <p className={`text-3xl font-black ${SCORE_COLORS[result.grade].text}`}>{result.gradeLabel}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md font-medium">
                {result.gradeDescription}
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-[11px] font-black text-gray-400 uppercase">SCORE</p>
              <p className={`text-6xl font-black tabular-nums ${SCORE_COLORS[result.grade].text}`}>
                {Math.round(result.totalScore)}
              </p>
              <p className="text-xs font-black text-gray-400">/ 100 POINTS</p>
              <div className="w-40 h-2.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${SCORE_COLORS[result.grade].bar}`}
                  style={{ width: `${result.totalScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 차트 */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">지표 균형 분석</h4>
              <div className="h-[280px] w-full card-fintech bg-gray-50/30">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--text-muted)' }} />
                    <Radar
                      name="Score" dataKey="score" 
                      stroke={result.grade === 'excellent' ? '#10b981' : result.grade === 'good' ? '#f59e0b' : '#ef4444'}
                      fill={result.grade === 'excellent' ? '#10b981' : result.grade === 'good' ? '#f59e0b' : '#ef4444'}
                      fillOpacity={0.25} strokeWidth={3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 상세 목록 */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">세부 채점 리포트</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.metricScores.map((metric) => (
                  <MetricScoreCard key={metric.key} metric={metric} />
                ))}
              </div>
            </div>
          </div>
          
          {/* 가이드 안내 */}
          <div className="p-5 rounded-2xl bg-blue-50/30 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 flex items-start gap-4">
            <Info size={18} className="text-blue-500 shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">💡 텐배거 발굴 꿀팁</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                성장주는 보통 PER이 높게 형성됩니다. 단순히 PER이 낮은 것보다, <strong>'과거 평균 PER보다 현재가 낮은지'</strong> 또는 <strong>'성장률(EPS)이 PER보다 높은지'</strong>를 보는 것이 열 배 주식을 찾는 핵심입니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 대기 화면 */}
      {!hasAnyInput && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-70">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-primary/20 to-blue-500/20 flex items-center justify-center animate-pulse">
            <TrendingUp size={32} className="text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-black text-gray-500 dark:text-gray-400 tracking-tight">
              텐배거의 6대 핵심 지표를 입력하세요
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              네이버 금융, 에프앤가이드 등의 재무제표를 참고하면 정확한 시뮬레이션이 가능합니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
