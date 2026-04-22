/**
 * stockEvaluator.ts
 * 저평가 우량주 7개 지표 평가 로직 (순수 함수 모음)
 *
 * 왜 순수 함수로 분리했는가:
 * - UI와 비즈니스 로직을 완전히 분리해 독립적으로 테스트 가능
 * - 지표 추가/변경 시 이 파일만 수정하면 됨
 * - orchestration.md §7: 재무 계산 로직은 필수 단위 테스트 대상
 */

export interface StockMetrics {
  per: number;            // 주가수익비율(PER)
  pbr: number;            // 주가순자산비율(PBR)
  roe: number;            // 자기자본이익률(ROE, %)
  roic: number;           // 투하자본수익률(ROIC, %)
  operatingMargin: number; // 영업이익률(%)
  debtRatio: number;      // 부채비율(%)
  dividendYield: number;  // 배당수익률(%)
}

export interface MetricScore {
  key: keyof StockMetrics;
  label: string;
  value: number;
  score: 0 | 1 | 2;
  maxScore: 2;
  unit: string;
  remark: string; // 점수 판정 이유 (e.g. "10 이하: 2점")
}

export interface EvaluationResult {
  metricScores: MetricScore[];
  totalScore: number;
  maxPossibleScore: number; // 항상 14
  grade: 'undervalued' | 'fair' | 'overvalued';
  gradeLabel: string;
  gradeColor: string;       // Tailwind 색상 클래스
  gradeEmoji: string;
  gradeDescription: string;
}

// ─────────────────────────────────────────────
// 개별 지표 채점 함수 (0~2점)
// ─────────────────────────────────────────────

/** PER: 낮을수록 저평가 */
const scorePer = (val: number): 0 | 1 | 2 => {
  if (val <= 0) return 0; // 음수 PER은 적자 기업
  if (val < 10) return 2;
  if (val <= 20) return 1;
  return 0;
};

/** PBR: 낮을수록 자산 대비 저평가 */
const scorePbr = (val: number): 0 | 1 | 2 => {
  if (val <= 0) return 0;
  if (val < 1) return 2;
  if (val <= 2) return 1;
  return 0;
};

/** ROE: 높을수록 자본 효율성이 좋음 */
const scoreRoe = (val: number): 0 | 1 | 2 => {
  if (val >= 15) return 2;
  if (val >= 10) return 1;
  return 0;
};

/** ROIC: 높을수록 투하자본을 잘 활용 */
const scoreRoic = (val: number): 0 | 1 | 2 => {
  if (val >= 15) return 2;
  if (val >= 10) return 1;
  return 0;
};

/** 영업이익률: 높을수록 수익 창출력 우수 */
const scoreOperatingMargin = (val: number): 0 | 1 | 2 => {
  if (val >= 10) return 2;
  if (val >= 5) return 1;
  return 0;
};

/** 부채비율: 낮을수록 재무 건전성 높음 */
const scoreDebtRatio = (val: number): 0 | 1 | 2 => {
  if (val < 100) return 2;
  if (val <= 200) return 1;
  return 0;
};

/** 배당수익률: 높을수록 주주 환원 친화적 */
const scoreDividendYield = (val: number): 0 | 1 | 2 => {
  if (val >= 3) return 2;
  if (val >= 1) return 1;
  return 0;
};

// ─────────────────────────────────────────────
// 지표 메타데이터 정의
// ─────────────────────────────────────────────

interface MetricMeta {
  key: keyof StockMetrics;
  label: string;
  unit: string;
  scoreFn: (val: number) => 0 | 1 | 2;
  remarks: [string, string, string]; // [2점 기준, 1점 기준, 0점 기준]
}

const METRIC_META: MetricMeta[] = [
  {
    key: 'per',
    label: 'PER (주가수익비율)',
    unit: '배',
    scoreFn: scorePer,
    remarks: ['10 미만: 저평가', '10~20: 적정', '20 초과 또는 음수: 고평가'],
  },
  {
    key: 'pbr',
    label: 'PBR (주가순자산비율)',
    unit: '배',
    scoreFn: scorePbr,
    remarks: ['1 미만: 순자산 이하 매수 기회', '1~2: 적정 수준', '2 초과: 고평가'],
  },
  {
    key: 'roe',
    label: 'ROE (자기자본이익률)',
    unit: '%',
    scoreFn: scoreRoe,
    remarks: ['15% 이상: 우량 수익성', '10~15%: 평균 수준', '10% 미만: 낮은 수익성'],
  },
  {
    key: 'roic',
    label: 'ROIC (투하자본수익률)',
    unit: '%',
    scoreFn: scoreRoic,
    remarks: ['15% 이상: 자본 배분 우수', '10~15%: 적정', '10% 미만: 자본 비효율'],
  },
  {
    key: 'operatingMargin',
    label: '영업이익률',
    unit: '%',
    scoreFn: scoreOperatingMargin,
    remarks: ['10% 이상: 높은 수익 창출력', '5~10%: 보통', '5% 미만: 낮은 마진'],
  },
  {
    key: 'debtRatio',
    label: '부채비율',
    unit: '%',
    scoreFn: scoreDebtRatio,
    remarks: ['100% 미만: 재무 우량', '100~200%: 보통', '200% 초과: 과부채 위험'],
  },
  {
    key: 'dividendYield',
    label: '배당수익률',
    unit: '%',
    scoreFn: scoreDividendYield,
    remarks: ['3% 이상: 주주 환원 우수', '1~3%: 보통', '1% 미만: 배당 미흡'],
  },
];

// ─────────────────────────────────────────────
// 등급 판정 함수
// ─────────────────────────────────────────────

/** 총점(0~14) → 등급 판정 */
const determineGrade = (
  total: number
): Pick<EvaluationResult, 'grade' | 'gradeLabel' | 'gradeColor' | 'gradeEmoji' | 'gradeDescription'> => {
  if (total >= 11) {
    return {
      grade: 'undervalued',
      gradeLabel: '저평가 우량주',
      gradeColor: 'text-emerald-500',
      gradeEmoji: '🟢',
      gradeDescription: '7개 핵심 지표 모두에서 우수한 점수를 기록했습니다. 현재 주가가 내재 가치 대비 저평가된 우량 기업일 가능성이 높습니다. 장기 투자 관점에서 긍정적으로 검토할 수 있습니다.',
    };
  }
  if (total >= 7) {
    return {
      grade: 'fair',
      gradeLabel: '적정 평가',
      gradeColor: 'text-amber-500',
      gradeEmoji: '🟡',
      gradeDescription: '전반적으로 적정한 수준의 밸류에이션을 보입니다. 일부 지표에서 개선 여지가 있으며, 추가 분석과 함께 신중한 접근이 필요합니다.',
    };
  }
  return {
    grade: 'overvalued',
    gradeLabel: '고평가 또는 주의',
    gradeColor: 'text-red-500',
    gradeEmoji: '🔴',
    gradeDescription: '다수의 지표에서 낮은 점수를 기록했습니다. 현재 주가가 내재 가치 대비 고평가되어 있거나, 재무 건전성에 문제가 있을 수 있습니다. 투자 전 면밀한 실사(Due Diligence)가 필요합니다.',
  };
};

// ─────────────────────────────────────────────
// 메인 평가 함수
// ─────────────────────────────────────────────

/**
 * 7개 지표를 입력받아 종합 평가 결과를 반환한다.
 * 각 지표마다 0~2점, 총 14점 만점으로 채점한다.
 */
export const evaluateStock = (metrics: StockMetrics): EvaluationResult => {
  const metricScores: MetricScore[] = METRIC_META.map((meta) => {
    const value = metrics[meta.key];
    const score = meta.scoreFn(value);
    const remarkIndex = score === 2 ? 0 : score === 1 ? 1 : 2;

    return {
      key: meta.key,
      label: meta.label,
      value,
      score,
      maxScore: 2,
      unit: meta.unit,
      remark: meta.remarks[remarkIndex],
    };
  });

  const totalScore = metricScores.reduce((sum, m) => sum + m.score, 0);
  const gradeInfo = determineGrade(totalScore);

  return {
    metricScores,
    totalScore,
    maxPossibleScore: 14,
    ...gradeInfo,
  };
};
