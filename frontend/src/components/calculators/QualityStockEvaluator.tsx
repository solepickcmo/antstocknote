import React, { useState, useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Info, RotateCcw } from 'lucide-react';
import { evaluateStock } from '../../lib/utils/stockEvaluator';
import type { StockMetrics, MetricScore } from '../../lib/utils/stockEvaluator';

// ─────────────────────────────────────────────
// 상수: 7개 지표 입력 필드 메타데이터
// 단일 책임 원칙: 지표 정보는 한 곳에서만 관리
// ─────────────────────────────────────────────
const METRIC_FIELDS: {
  key: keyof StockMetrics;
  label: string;
  unit: string;
  placeholder: string;
  hint: string;
  step: string;
}[] = [
  {
    key: 'per',
    label: 'PER',
    unit: '배',
    placeholder: '12.5',
    hint: '주가 ÷ EPS. 낮을수록 저평가',
    step: '0.1',
  },
  {
    key: 'pbr',
    label: 'PBR',
    unit: '배',
    placeholder: '1.2',
    hint: '주가 ÷ BPS. 1 미만이면 청산 가치 이하',
    step: '0.01',
  },
  {
    key: 'roe',
    label: 'ROE',
    unit: '%',
    placeholder: '15',
    hint: '자기자본이익률. 15% 이상이 우량',
    step: '0.1',
  },
  {
    key: 'roic',
    label: 'ROIC',
    unit: '%',
    placeholder: '13',
    hint: '투하자본수익률. 자본 배분 효율성 지표',
    step: '0.1',
  },
  {
    key: 'operatingMargin',
    label: '영업이익률',
    unit: '%',
    placeholder: '8',
    hint: '영업이익 ÷ 매출액. 10% 이상 우수',
    step: '0.1',
  },
  {
    key: 'debtRatio',
    label: '부채비율',
    unit: '%',
    placeholder: '80',
    hint: '총부채 ÷ 자기자본 × 100. 낮을수록 안전',
    step: '1',
  },
  {
    key: 'dividendYield',
    label: '배당수익률',
    unit: '%',
    placeholder: '2.5',
    hint: '배당금 ÷ 주가 × 100. 3% 이상 우수',
    step: '0.1',
  },
];

// 점수별 색상 클래스 (초록/노랑/빨강)
const SCORE_COLORS: Record<0 | 1 | 2, { bg: string; text: string; bar: string; badge: string }> = {
  2: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  1: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  },
  0: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    bar: 'bg-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  },
};

// 초기값 (기본 예시 데이터로 UI를 즉시 확인할 수 있게)
const INITIAL_METRICS: Record<keyof StockMetrics, string> = {
  per: '',
  pbr: '',
  roe: '',
  roic: '',
  operatingMargin: '',
  debtRatio: '',
  dividendYield: '',
};

// ─────────────────────────────────────────────
// 개별 지표 점수 카드 컴포넌트
// ─────────────────────────────────────────────
const MetricScoreCard: React.FC<{ metric: MetricScore }> = ({ metric }) => {
  const colors = SCORE_COLORS[metric.score];
  const barWidth = (metric.score / metric.maxScore) * 100;

  return (
    <div className={`p-4 rounded-xl border ${colors.bg} ${metric.score === 2 ? 'border-emerald-100 dark:border-emerald-500/20' : metric.score === 1 ? 'border-amber-100 dark:border-amber-500/20' : 'border-red-100 dark:border-red-500/20'}`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {metric.label}
        </p>
        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${colors.badge}`}>
          {metric.score}/{metric.maxScore}점
        </span>
      </div>
      <p className={`text-xl font-black mb-2 ${colors.text}`}>
        {metric.value === 0 && metric.score === 0 ? '-' : metric.value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}{metric.unit}
      </p>
      {/* 점수 바 */}
      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">{metric.remark}</p>
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

  const handleReset = () => {
    setInputs(INITIAL_METRICS);
  };

  // 모든 필드가 입력되어야 결과를 표시 (빈 값은 0으로 처리)
  const hasAnyInput = Object.values(inputs).some((v) => v !== '');

  const metrics: StockMetrics = useMemo(() => ({
    per: parseFloat(inputs.per) || 0,
    pbr: parseFloat(inputs.pbr) || 0,
    roe: parseFloat(inputs.roe) || 0,
    roic: parseFloat(inputs.roic) || 0,
    operatingMargin: parseFloat(inputs.operatingMargin) || 0,
    debtRatio: parseFloat(inputs.debtRatio) || 0,
    dividendYield: parseFloat(inputs.dividendYield) || 0,
  }), [inputs]);

  // 평가 결과 (useMemo로 불필요한 재계산 방지)
  const result = useMemo(() => {
    if (!hasAnyInput) return null;
    return evaluateStock(metrics);
  }, [metrics, hasAnyInput]);

  // 레이더 차트 데이터 (0~2점을 퍼센트로 변환해 시각화)
  const radarData = result?.metricScores.map((m) => ({
    subject: m.label.split(' ')[0], // "PER (주가수익비율)" → "PER"만
    score: (m.score / m.maxScore) * 100,
    fullMark: 100,
  })) ?? [];

  return (
    <div className="card-fintech p-6 space-y-8 animate-fade-in bg-white dark:bg-bg-card">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">저평가 우량주 평가기</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            7개 핵심 지표로 기업의 밸류에이션과 재무 건전성을 종합 평가합니다
          </p>
        </div>
        {hasAnyInput && (
          <button
            onClick={handleReset}
            className="btn-fintech-secondary text-[11px] h-8 px-3 flex items-center gap-1.5"
          >
            <RotateCcw size={12} /> 초기화
          </button>
        )}
      </div>

      {/* 7개 지표 입력 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {METRIC_FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {field.label}
              </label>
              <button
                type="button"
                onMouseEnter={() => setActiveHint(field.key)}
                onMouseLeave={() => setActiveHint(null)}
                onFocus={() => setActiveHint(field.key)}
                onBlur={() => setActiveHint(null)}
                className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                aria-label={`${field.label} 도움말`}
              >
                <Info size={12} />
              </button>
            </div>
            {/* 툴팁 */}
            {activeHint === field.key && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                {field.hint}
              </p>
            )}
            <div className="relative">
              <input
                type="number"
                step={field.step}
                min="0"
                placeholder={field.placeholder}
                className="input-fintech h-11 pr-10 text-right font-bold"
                value={inputs[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                aria-label={`${field.label} 입력`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
                {field.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 결과 섹션: 입력값이 있을 때만 표시 */}
      {result && (
        <>
          <div className="w-full h-[1px] bg-gray-100 dark:bg-white/5" />

          {/* 종합 판정 배너 */}
          <div className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
            result.grade === 'undervalued'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
              : result.grade === 'fair'
              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
              : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
          }`}>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">종합 판정</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{result.gradeEmoji}</span>
                <p className={`text-2xl font-black ${result.gradeColor}`}>{result.gradeLabel}</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                {result.gradeDescription}
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-1 shrink-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">총점</p>
              <p className={`text-5xl font-black tabular-nums ${result.gradeColor}`}>
                {result.totalScore}
              </p>
              <p className="text-sm font-bold text-gray-400">/ {result.maxPossibleScore}점</p>
              {/* 총점 바 */}
              <div className="w-32 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    result.grade === 'undervalued' ? 'bg-emerald-500' : result.grade === 'fair' ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${(result.totalScore / result.maxPossibleScore) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400">
                {result.grade === 'undervalued' ? '11~14점' : result.grade === 'fair' ? '7~10점' : '0~6점'}
              </p>
            </div>
          </div>

          {/* 레이더 차트 */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">지표 균형 분석</p>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(0,0,0,0.06)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fontWeight: 700, fill: 'currentColor' }}
                  />
                  <Radar
                    name="점수"
                    dataKey="score"
                    stroke={
                      result.grade === 'undervalued'
                        ? '#10b981'
                        : result.grade === 'fair'
                        ? '#f59e0b'
                        : '#ef4444'
                    }
                    fill={
                      result.grade === 'undervalued'
                        ? '#10b981'
                        : result.grade === 'fair'
                        ? '#f59e0b'
                        : '#ef4444'
                    }
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 개별 지표 점수 카드 그리드 */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">지표별 상세 점수</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.metricScores.map((metric) => (
                <MetricScoreCard key={metric.key} metric={metric} />
              ))}
            </div>
          </div>

          {/* 등급 기준 안내 */}
          <div className="flex items-start gap-2 text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed font-medium">
            <Info size={12} className="shrink-0 mt-0.5" />
            <p>
              채점 기준: 각 지표 0~2점 × 7개 = 14점 만점 |
              <span className="text-emerald-500 font-bold"> 11~14점: 저평가 우량주</span> ·
              <span className="text-amber-500 font-bold"> 7~10점: 적정</span> ·
              <span className="text-red-500 font-bold"> 0~6점: 고평가</span>.
              본 평가는 투자 참고용이며 투자 결정의 유일한 근거로 사용하지 마십시오.
            </p>
          </div>
        </>
      )}

      {/* 입력 전 안내 */}
      {!hasAnyInput && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500">
            위 7개 지표를 입력하면 자동으로 평가 결과를 보여드립니다
          </p>
          <p className="text-[10px] text-gray-300 dark:text-gray-600">
            네이버 금융, 에프앤가이드 등에서 지표를 확인하세요
          </p>
        </div>
      )}
    </div>
  );
};
