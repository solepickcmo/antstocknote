/**
 * stockEvaluator.ts
 * 텐배거(Ten-bagger) 시뮬레이터 핵심 로직 (100점 만점 시스템)
 *
 * [개편 내역]
 * 1. 성장성 중심 채점 (50%): EPS 증가율(30점), 매출액 증가율(20점)
 * 2. 수익성 중심 채점 (30%): ROE(20점), 영업이익률(10점)
 * 3. 안정성 중심 채점 (20%): 부채비율(10점), 유보율(10점)
 */

export interface StockMetrics {
  epsGrowth: number;       // EPS 증가율 (%)
  revenueGrowth: number;   // 매출액 증가율 (%)
  roe: number;             // 자기자본이익률 (%)
  operatingMargin: number; // 영업이익률 (%)
  debtRatio: number;       // 부채비율 (%)
  retentionRate: number;   // 유보율 (%)
}

export interface MetricScore {
  key: keyof StockMetrics;
  label: string;
  value: number;
  score: number;
  maxScore: number;
  unit: string;
  remark: string;
  category: 'growth' | 'profitability' | 'stability';
}

export interface EvaluationResult {
  metricScores: MetricScore[];
  totalScore: number;
  maxPossibleScore: number; // 항상 100
  grade: 'excellent' | 'good' | 'caution';
  gradeLabel: string;
  gradeColor: string;
  gradeEmoji: string;
  gradeDescription: string;
}

// ─────────────────────────────────────────────
// 개별 지표 채점 로직 (가중치 반영)
// ─────────────────────────────────────────────

/** EPS 증가율 (30점): 텐배거의 심장 */
const scoreEpsGrowth = (val: number): number => {
  if (val >= 20) return 30;
  if (val >= 10) return 15;
  if (val > 0)   return 5;
  return 0;
};

/** 매출액 증가율 (20점): 성장의 증거 */
const scoreRevenueGrowth = (val: number): number => {
  if (val >= 15) return 20;
  if (val >= 7)  return 10;
  if (val > 0)   return 3;
  return 0;
};

/** ROE (20점): 효율적인 복리 머신 */
const scoreRoe = (val: number): number => {
  if (val >= 15) return 20;
  if (val >= 10) return 10;
  if (val >= 5)  return 5;
  return 0;
};

/** 영업이익률 (10점): 경제적 해자 */
const scoreOperatingMargin = (val: number): number => {
  if (val >= 15) return 10;
  if (val >= 10) return 5;
  if (val >= 5)  return 2;
  return 0;
};

/** 부채비율 (10점): 재무 건전성 (낮을수록 좋음) */
const scoreDebtRatio = (val: number): number => {
  if (val <= 100) return 10;
  if (val <= 200) return 5;
  return 0;
};

/** 유보율 (10점): 투자를 위한 탄약 (높을수록 좋음) */
const scoreRetentionRate = (val: number): number => {
  if (val >= 1000) return 10;
  if (val >= 500)  return 5;
  return 0;
};

// ─────────────────────────────────────────────
// 지표 메타데이터 정의
// ─────────────────────────────────────────────

interface MetricMeta {
  key: keyof StockMetrics;
  label: string;
  unit: string;
  maxScore: number;
  category: 'growth' | 'profitability' | 'stability';
  scoreFn: (val: number) => number;
  getRemark: (score: number, max: number) => string;
}

const METRIC_META: MetricMeta[] = [
  {
    key: 'epsGrowth',
    label: 'EPS 증가율',
    unit: '%',
    maxScore: 30,
    category: 'growth',
    scoreFn: scoreEpsGrowth,
    getRemark: (s, m) => s === m ? '폭발적 성장 중' : s >= 15 ? '양호한 비실 성장' : '이익 성장 정체',
  },
  {
    key: 'revenueGrowth',
    label: '매출액 증가율',
    unit: '%',
    maxScore: 20,
    category: 'growth',
    scoreFn: scoreRevenueGrowth,
    getRemark: (s, m) => s === m ? '강력한 외형 확장' : s >= 10 ? '평균 이상의 성장' : '성장 모멘텀 부족',
  },
  {
    key: 'roe',
    label: 'ROE',
    unit: '%',
    maxScore: 20,
    category: 'profitability',
    scoreFn: scoreRoe,
    getRemark: (s, m) => s === m ? '최상급 복리 머신' : s >= 10 ? '평균적 수익성' : '자본 효율성 낮음',
  },
  {
    key: 'operatingMargin',
    label: '영업이익률',
    unit: '%',
    maxScore: 10,
    category: 'profitability',
    scoreFn: scoreOperatingMargin,
    getRemark: (s, m) => s === m ? '높은 경제적 해자' : s >= 5 ? '보통 수준 마진' : '낮은 이익률',
  },
  {
    key: 'debtRatio',
    label: '부채비율',
    unit: '%',
    maxScore: 10,
    category: 'stability',
    scoreFn: scoreDebtRatio,
    getRemark: (s, m) => s === m ? '매우 건전한 재무' : s >= 5 ? '관리 가능한 부채' : '재무 위험 주의',
  },
  {
    key: 'retentionRate',
    label: '유보율',
    unit: '%',
    maxScore: 10,
    category: 'stability',
    scoreFn: scoreRetentionRate,
    getRemark: (s, m) => s === m ? '넉넉한 투자 실탄' : s >= 5 ? '안정적 자금력' : '자금 여력 부족',
  },
];

// ─────────────────────────────────────────────
// 메인 평가 함수
// ─────────────────────────────────────────────

export const evaluateStock = (metrics: StockMetrics): EvaluationResult => {
  const metricScores: MetricScore[] = METRIC_META.map((meta) => {
    const value = metrics[meta.key];
    const score = meta.scoreFn(value);
    return {
      key: meta.key,
      label: meta.label,
      value,
      score,
      maxScore: meta.maxScore,
      unit: meta.unit,
      remark: meta.getRemark(score, meta.maxScore),
      category: meta.category,
    };
  });

  const totalScore = metricScores.reduce((sum, m) => sum + m.score, 0);

  let gradeInfo: Pick<EvaluationResult, 'grade' | 'gradeLabel' | 'gradeColor' | 'gradeEmoji' | 'gradeDescription'>;

  if (totalScore >= 85) {
    gradeInfo = {
      grade: 'excellent',
      gradeLabel: '텐배거 유망주',
      gradeColor: 'text-emerald-500',
      gradeEmoji: '🚀',
      gradeDescription: '성장성, 수익성, 안정성 삼박자를 모두 갖춘 텐배거 후보입니다. 특히 이익의 성장 폭이 주가를 끌어올리는 강력한 엔진 역할을 할 것으로 기대됩니다.',
    };
  } else if (totalScore >= 60) {
    gradeInfo = {
      grade: 'good',
      gradeLabel: '우량 성장주',
      gradeColor: 'text-amber-500',
      gradeEmoji: '📈',
      gradeDescription: '견고한 성장을 보여주는 우량 기업입니다. 일부 지표에서 보완이 필요하지만, 장기적으로 우상향할 가능성이 높은 비즈니스 모델을 가졌습니다.',
    };
  } else {
    gradeInfo = {
      grade: 'caution',
      gradeLabel: '주의 요망',
      gradeColor: 'text-red-500',
      gradeEmoji: '⚠️',
      gradeDescription: '현재 성장 모멘텀이 둔화되었거나 재무 안정성이 낮습니다. 리스크 관리가 최우선이며, 성장의 증거가 확실해질 때까지 신중한 접근이 필요합니다.',
    };
  }

  return {
    metricScores,
    totalScore,
    maxPossibleScore: 100,
    ...gradeInfo,
  };
};
