import React, { useState, useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Info, RotateCcw, TrendingUp, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';
import { evaluateStock } from '../../lib/utils/stockEvaluator';
import type { MetricScore } from '../../lib/utils/stockEvaluator';

// ─────────────────────────────────────────────
// 헬퍼: 콤마나 단위가 포함된 문자열을 숫자로 파싱
// ─────────────────────────────────────────────
const parseFormattedNumber = (val: string): number => {
  if (!val) return 0;
  // 콤마 제거 및 숫자/소수점/마이너스 기호 외 제거
  const clean = val.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  return parseFloat(clean) || 0;
};

// ─────────────────────────────────────────────
// 상수: 입력 필드 구성 (실제 수치 입력형)
// ─────────────────────────────────────────────
const INITIAL_STATE = {
  prevRevenue: '',
  currRevenue: '',
  prevEps: '',
  currEps: '',
  roe: '',
  operatingMargin: '',
  retentionRate: '',
  debtRatio: '',
};

// ─────────────────────────────────────────────
// 개별 지표 점수 카드 컴포넌트
// ─────────────────────────────────────────────
const MetricScoreCard: React.FC<{ metric: MetricScore }> = ({ metric }) => {
  const isExcellent = metric.score === metric.maxScore;
  const isCaution = metric.score === 0;
  
  const colors = isExcellent 
    ? { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' }
    : isCaution
    ? { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', bar: 'bg-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' }
    : { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' };

  return (
    <div className={`p-4 rounded-xl border ${colors.bg} border-transparent transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {metric.label}
        </p>
        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${colors.badge}`}>
          {Math.round(metric.score)}/{metric.maxScore}
        </span>
      </div>
      <p className={`text-xl font-black mb-2 ${colors.text}`}>
        {metric.value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}{metric.unit}
      </p>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed font-medium">
        {metric.remark}
      </p>
    </div>
  );
};

export const QualityStockEvaluator: React.FC = () => {
  const [state, setState] = useState(INITIAL_STATE);

  const handleInputChange = (key: keyof typeof INITIAL_STATE, val: string) => {
    setState(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => setState(INITIAL_STATE);

  // 실시간 계산된 지표들
  const calculatedMetrics = useMemo(() => {
    const prevRev = parseFormattedNumber(state.prevRevenue);
    const currRev = parseFormattedNumber(state.currRevenue);
    const prevEpsVal = parseFormattedNumber(state.prevEps);
    const currEpsVal = parseFormattedNumber(state.currEps);

    const revenueGrowth = prevRev !== 0 ? ((currRev - prevRev) / Math.abs(prevRev)) * 100 : 0;
    const epsGrowth = prevEpsVal !== 0 ? ((currEpsVal - prevEpsVal) / Math.abs(prevEpsVal)) * 100 : 0;

    return {
      revenueGrowth,
      epsGrowth,
      roe: parseFormattedNumber(state.roe),
      operatingMargin: parseFormattedNumber(state.operatingMargin),
      retentionRate: parseFormattedNumber(state.retentionRate),
      debtRatio: parseFormattedNumber(state.debtRatio),
    };
  }, [state]);

  const hasAnyInput = Object.values(state).some(v => v !== '');

  const result = useMemo(() => {
    if (!hasAnyInput) return null;
    return evaluateStock(calculatedMetrics);
  }, [calculatedMetrics, hasAnyInput]);

  const radarData = result?.metricScores.map(m => ({
    subject: m.label,
    score: (m.score / m.maxScore) * 100,
  })) ?? [];

  return (
    <div className="card-fintech p-6 space-y-8 animate-fade-in bg-white dark:bg-bg-card max-w-4xl mx-auto shadow-xl">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🚀 텐배거(Ten-bagger) 시큘레이터 <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter font-black">Pro</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            재무제표의 실제 수치를 입력하세요. 콤마(,)가 포함된 텍스트도 그대로 파싱됩니다.
          </p>
        </div>
        {hasAnyInput && (
          <button onClick={handleReset} className="btn-fintech-secondary text-[11px] h-8 px-3 flex items-center gap-1.5">
            <RotateCcw size={12} /> 초기화
          </button>
        )}
      </div>

      {/* 입력 섹션: 실제 수치 입력형 */}
      <div className="space-y-8">
        {/* 1. 성장성 (매출액, EPS 듀얼 입력) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 border-b border-gray-100 dark:border-white/5 pb-2">
            <TrendingUp size={16} className="text-blue-500" />
            <h3 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">성장성 분석 (50%)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 매출액 그룹 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-gray-500 uppercase">매출액(억원)</label>
                {calculatedMetrics.revenueGrowth !== 0 && (
                  <span className={`text-[10px] font-black ${calculatedMetrics.revenueGrowth > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    증가율: {calculatedMetrics.revenueGrowth.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <input
                    type="text" placeholder="전년 실적"
                    className="input-fintech h-10 text-right font-bold text-sm"
                    value={state.prevRevenue}
                    onChange={(e) => handleInputChange('prevRevenue', e.target.value)}
                  />
                  <p className="text-[9px] text-center text-gray-400">전년 (2024.12)</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 shrink-0" />
                <div className="flex-1 space-y-1">
                  <input
                    type="text" placeholder="당기 실적"
                    className="input-fintech h-10 text-right font-bold text-sm border-primary/20"
                    value={state.currRevenue}
                    onChange={(e) => handleInputChange('currRevenue', e.target.value)}
                  />
                  <p className="text-[9px] text-center text-primary font-bold">당기 (2025.12)</p>
                </div>
              </div>
            </div>

            {/* EPS 그룹 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-gray-500 uppercase">EPS(원)</label>
                {calculatedMetrics.epsGrowth !== 0 && (
                  <span className={`text-[10px] font-black ${calculatedMetrics.epsGrowth > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    증가율: {calculatedMetrics.epsGrowth.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <input
                    type="text" placeholder="전년 EPS"
                    className="input-fintech h-10 text-right font-bold text-sm"
                    value={state.prevEps}
                    onChange={(e) => handleInputChange('prevEps', e.target.value)}
                  />
                  <p className="text-[9px] text-center text-gray-400">전년 EPS</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 shrink-0" />
                <div className="flex-1 space-y-1">
                  <input
                    type="text" placeholder="당기 EPS"
                    className="input-fintech h-10 text-right font-bold text-sm border-primary/20"
                    value={state.currEps}
                    onChange={(e) => handleInputChange('currEps', e.target.value)}
                  />
                  <p className="text-[9px] text-center text-primary font-bold">당기 EPS</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 수익성 & 안정성 (단일 수치 입력) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 수익성 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1 border-b border-gray-100 dark:border-white/5 pb-2">
              <BarChart3 size={16} className="text-emerald-500" />
              <h3 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">수익성 분석 (30%)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase">ROE (%)</label>
                <input
                  type="text" placeholder="15.0"
                  className="input-fintech h-10 text-right font-bold text-sm"
                  value={state.roe}
                  onChange={(e) => handleInputChange('roe', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase">영업이익률 (%)</label>
                <input
                  type="text" placeholder="10.0"
                  className="input-fintech h-10 text-right font-bold text-sm"
                  value={state.operatingMargin}
                  onChange={(e) => handleInputChange('operatingMargin', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* 안정성 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1 border-b border-gray-100 dark:border-white/5 pb-2">
              <ShieldCheck size={16} className="text-amber-500" />
              <h3 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">안정성 분석 (20%)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase">유보율 (%)</label>
                <input
                  type="text" placeholder="1,000"
                  className="input-fintech h-10 text-right font-bold text-sm"
                  value={state.retentionRate}
                  onChange={(e) => handleInputChange('retentionRate', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase">부채비율 (%)</label>
                <input
                  type="text" placeholder="80.0"
                  className="input-fintech h-10 text-right font-bold text-sm"
                  value={state.debtRatio}
                  onChange={(e) => handleInputChange('debtRatio', e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 결과 리포트 */}
      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="w-full h-[1px] bg-gray-100 dark:bg-white/5" />

          {/* 종합 등급 카드 */}
          <div className={`p-8 rounded-[2rem] border-2 flex flex-col md:flex-row md:items-center md:justify-between gap-8 transition-colors duration-500 ${
            result.grade === 'excellent' ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200/50' : 
            result.grade === 'good' ? 'bg-amber-50/50 dark:bg-amber-500/10 border-amber-200/50' : 
            'bg-red-50/50 dark:bg-red-500/10 border-red-200/50'
          }`}>
            <div className="space-y-3">
              <span className="text-[10px] font-black bg-white dark:bg-black/20 px-3 py-1 rounded-full text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-white/5">
                Simulator Analysis Result
              </span>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{result.gradeEmoji}</span>
                <div className="space-y-1">
                  <p className={`text-4xl font-black tracking-tighter ${result.gradeColor}`}>{result.gradeLabel}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold opacity-80 uppercase tracking-tight">Ten-Bagger Potential Index</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-md font-medium">
                {result.gradeDescription}
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2 pr-4">
              <p className="text-7xl font-black tabular-nums tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-current to-gray-400" 
                 style={{ color: result.grade === 'excellent' ? '#10b981' : result.grade === 'good' ? '#f59e0b' : '#ef4444' }}>
                {Math.round(result.totalScore)}
              </p>
              <div className="flex flex-col items-end">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Points</p>
                <div className="w-48 h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-2 border border-gray-300/20">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      result.grade === 'excellent' ? 'bg-emerald-500' : result.grade === 'good' ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${result.totalScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 레이더 차트 */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-2">지표 밸런스</h4>
              <div className="h-[300px] w-full card-fintech bg-white/50 dark:bg-white/5 border-dashed">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" strokeDasharray="4 4" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 800, fill: 'var(--text-muted)' }} />
                    <Radar
                      name="Score" dataKey="score"
                      stroke={result.gradeColor.includes('emerald') ? '#10b981' : result.gradeColor.includes('amber') ? '#f59e0b' : '#ef4444'}
                      fill={result.gradeColor.includes('emerald') ? '#10b981' : result.gradeColor.includes('amber') ? '#f59e0b' : '#ef4444'}
                      fillOpacity={0.2} strokeWidth={3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 상세 지표 카드 */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-2">지표별 상세 판정</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.metricScores.map((metric) => (
                  <MetricScoreCard key={metric.key} metric={metric} />
                ))}
              </div>
            </div>
          </div>

          {/* 하단 팁 */}
          <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
               <Info size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-blue-700 dark:text-blue-300">💡 시뮬레이터 활용 팁</p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed font-medium">
                텐배거 후보를 찾을 때는 성장이 정체된 저PER주 보다는, **고PER임에도 불구하고 이익 성장률(EPS 증가율)이 그보다 더 가파르게 증가하는 기업**에 주목하세요. 매출액이 전년 대비 15~20% 이상 꾸준히 증가하는지가 가장 중요한 '성장의 증거'입니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 대기 화면 */}
      {!hasAnyInput && (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 opacity-80">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center animate-bounce shadow-2xl">
              <BarChart3 size={40} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white border-4 border-white dark:border-bg-card font-black text-xs">
              GO
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-black tracking-tight dark:text-white">
              재무제표의 실적 수치를 그대로 입력해보세요
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold max-w-xs mx-auto leading-relaxed">
              매출액(억원)과 EPS(원)의 전년/당기 수치를 입력하면<br/>텐배거 가능성이 즉시 계산됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
