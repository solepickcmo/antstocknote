# 장기투자 계산기 4종 — 바이브코딩 구현 명세서

| 항목 | 내용 |
|---|---|
| 문서 버전 | 1.0.0 |
| 작성일 | 2026-04-17 |
| 대상 앱 | 개미의 집 (AntStockNote) |
| 기술 스택 | React + TypeScript + Zustand + TailwindCSS + Supabase |
| 접근 Tier | Premium (tierStore.canAccess 검증 필수) |
| 라우트 | `/calculator` — 탭 구조로 4개 계산기 통합 |

---

## 공통 설계 원칙

### Tier 접근 제어 (전 계산기 공통)

모든 계산기는 `TierGate` 컴포넌트로 감싸야 한다. Premium 미충족 사용자에게는 `UpgradePrompt` 모달을 표시하고 계산기를 렌더링하지 않는다.

```tsx
// 예시 — 각 계산기 컴포넌트에 동일하게 적용
<TierGate feature="calculators">
  <CompoundCalculator />
</TierGate>
```

### 색상 역할 분리 원칙

| 용도 | 클래스 | 비고 |
|---|---|---|
| 사용자 입력값 텍스트 | `text-white` | 입력 필드 내 값 |
| 핵심 결과·기준값 | `text-amber-400` | BEP, 적정가, EV 등 |
| 수익·긍정 결과 | `text-green-400` | 양수 PnL, 달성률 |
| 손실·경고 결과 | `text-red-400` | 음수 PnL, 위험 신호 |
| 자동 파생 중간값 | `text-blue-400` | 소계, 총 투자금 등 |
| 레이블·단위·서브텍스트 | `text-gray-400` | "원", "주", 설명 텍스트 |

### 숫자 포맷 유틸 (전 계산기 공통)

```typescript
// utils/format.ts

/** 정수 원화 포맷 — 콤마 + 단위 */
export const fmtKRW = (n: number): string =>
  Math.round(n).toLocaleString('ko-KR') + '원';

/** 소수점 포함 포맷 */
export const fmtNum = (n: number, digits = 2): string =>
  n.toFixed(digits);

/** 퍼센트 포맷 */
export const fmtPct = (n: number, digits = 2): string =>
  n.toFixed(digits) + '%';

/** 배수 포맷 */
export const fmtX = (n: number): string =>
  n.toFixed(1) + '배';

/** 입력 필드 실시간 콤마 포맷 (onChange용) */
export const fmtInput = (raw: string): string => {
  const num = raw.replace(/[^0-9]/g, '');
  return Number(num).toLocaleString('ko-KR');
};
```

### 보유 종목 불러오기 공통 훅

```typescript
// hooks/useHoldings.ts
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface HoldingSummary {
  ticker: string;
  name: string;
  avgPrice: number;    // 평균 매수가 (tradeStore 계산값)
  quantity: number;    // 보유 수량
  currentValue: number; // 평가금액 (현재가 × 수량, 수기 입력 필요)
}

export const useHoldings = () => {
  const { user } = useAuthStore();

  const fetchHoldings = async (): Promise<HoldingSummary[]> => {
    const { data, error } = await supabase
      .from('trades')
      .select('ticker, name, price, quantity, type, is_open, pnl')
      .eq('user_id', user!.id)
      .eq('is_open', true)
      .eq('type', 'buy')
      .order('traded_at', { ascending: false });

    if (error || !data) return [];

    // ticker별 groupBy → 평균 매수가·수량 계산
    const grouped: Record<string, HoldingSummary> = {};
    data.forEach((t) => {
      if (!grouped[t.ticker]) {
        grouped[t.ticker] = { ticker: t.ticker, name: t.name, avgPrice: 0, quantity: 0, currentValue: 0 };
      }
      grouped[t.ticker].quantity += t.quantity;
      // avgPrice는 tradeStore의 calcAvgPrice() 로직 재사용 권장
    });

    return Object.values(grouped);
  };

  return { fetchHoldings };
};
```

### 마진 · 간격 가이드

| 항목 | 값 |
|---|---|
| 페이지 패딩 | `p-4` (16px) |
| 섹션 카드 간 gap | `gap-3` (12px) |
| 카드 내부 패딩 | `p-4` (16px) |
| 레이블 → 인풋 간격 | `mb-1.5` (6px) |
| 입력 행 간 간격 | `space-y-3` (12px) |
| 결과 항목 행 간격 | `space-y-3` (12px) |
| 결과 레이블 폰트 | `text-xs text-gray-400` |
| 핵심 결과값 폰트 | `text-xl font-bold` |
| 서브텍스트 폰트 | `text-xs text-gray-500` |

---

## 탭 라우팅 구조

```tsx
// pages/CalculatorPage.tsx
import { useState } from 'react';
import { TierGate } from '@/components/TierGate';
import CompoundCalculator from './calculators/CompoundCalculator';
import DividendCalculator from './calculators/DividendCalculator';
import ValuationCalculator from './calculators/ValuationCalculator';
import RiskRewardCalculator from './calculators/RiskRewardCalculator';

const TABS = [
  { id: 'compound',   label: '복리 수익률',   icon: '📈' },
  { id: 'dividend',   label: '배당 수익률',   icon: '💰' },
  { id: 'valuation',  label: '적정 주가',      icon: '📊' },
  { id: 'rr',         label: '리스크 비율',   icon: '⚖️' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function CalculatorPage() {
  const [active, setActive] = useState<TabId>('compound');

  return (
    <TierGate feature="calculators">
      <div className="p-4 max-w-2xl mx-auto">
        {/* 탭 내비게이션 */}
        <div className="flex gap-2 flex-wrap mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                active === tab.id
                  ? 'bg-[#1A3558] text-white border-[#1A3558]'
                  : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 계산기 렌더링 */}
        {active === 'compound'  && <CompoundCalculator />}
        {active === 'dividend'  && <DividendCalculator />}
        {active === 'valuation' && <ValuationCalculator />}
        {active === 'rr'        && <RiskRewardCalculator />}
      </div>
    </TierGate>
  );
}
```

---

## 계산기 01 — 복리 수익률 계산기

### 기능 개요

초기 투자금과 월 적립금을 기반으로 연복리 수익률과 기간별 최종 자산을 시뮬레이션한다.
단순 투자금 누적과 복리 자산의 차이를 선형 차트로 시각화하고, 72의 법칙으로 자산 2배 도달 기간을 안내한다.

### 계산 공식

```
월 수익률(rm) = 연 수익률 / 12

최종 자산 = 초기투자금 × (1 + rm)^(N개월)
           + Σ[m=0 to N-1] 월적립금 × (1 + rm)^(N-m)

총 투자원금 = 초기투자금 + 월적립금 × 12 × 투자기간(년)
복리 수익금 = 최종 자산 - 총 투자원금
수익 배수   = 최종 자산 / 총 투자원금
72의 법칙   = 72 / 연 수익률(%)  → 자산 2배 소요 년수
```

### 입력 항목

| 항목 | 타입 | 기본값 | 범위 | 비고 |
|---|---|---|---|---|
| 초기 투자금 | number | 10,000,000 | 0 이상 | 단위: 원 |
| 월 적립금 | number | 500,000 | 0 이상 | 단위: 원 |
| 연 수익률 | range + number | 8 | 1 ~ 30 | step 0.5, 단위: % |
| 투자 기간 | range + number | 20 | 1 ~ 40 | step 1, 단위: 년 |

> 보유 종목 불러오기: 현재 포트폴리오 총 평가금액을 초기 투자금으로 자동 입력.
> `HoldingsPage`의 `totalCurrentValue`를 참조.

### 출력 항목

| 항목 | 계산 방법 | 색상 |
|---|---|---|
| 최종 자산 | 위 공식 | `text-amber-400` |
| 총 투자원금 | 초기금 + 월적립 × 12 × 기간 | `text-white` |
| 복리 수익금 | 최종 자산 - 총 투자원금 | `text-green-400` |
| 수익 배수 | 최종 자산 / 총 투자원금 | `text-amber-400` |
| 기간별 복리 차트 | recharts LineChart, 2개 라인 | — |
| 72의 법칙 안내 | 72 / 연수익률 | `text-gray-400` |

### 차트 스펙

```typescript
// recharts LineChart 구성
const chartData = Array.from({ length: years + 1 }, (_, y) => {
  const months = y * 12;
  const compound = principal * Math.pow(1 + rm, months)
    + Array.from({ length: months }, (_, m) => monthly * Math.pow(1 + rm, months - m))
      .reduce((a, b) => a + b, 0);
  const simple = principal + monthly * months;
  return { year: `${y}년`, compound: Math.round(compound), simple: Math.round(simple) };
});

// 라인 구성
// - 복리 자산: stroke="#BA7517" strokeWidth={2}
// - 단순 투자금: stroke="#6B7280" strokeWidth={1.5} strokeDasharray="4 4"
// - YAxis tickFormatter: (v) => (v / 100000000).toFixed(1) + '억'
// - 범례: 우측 상단, font-size 11px
```

### 컴포넌트 구조

```
CompoundCalculator
├── HoldingsAutoFill (보유 종목 총 평가금액 → 초기투자금 자동 입력)
├── InputSection
│   ├── PrincipalInput (초기 투자금)
│   ├── MonthlyInput (월 적립금)
│   ├── RateSlider (연 수익률 슬라이더 + 숫자 입력)
│   └── YearsSlider (투자 기간 슬라이더 + 숫자 입력)
├── ResultCards (최종자산 / 총원금 / 복리수익금 / 수익배수)
├── CompoundLineChart (recharts)
└── Rule72Notice (72의 법칙 안내 텍스트)
```

### 상태 관리

```typescript
// 로컬 useState — 전역 store 불필요
const [principal, setPrincipal] = useState(10_000_000);
const [monthly, setMonthly]     = useState(500_000);
const [rate, setRate]           = useState(8);      // %
const [years, setYears]         = useState(20);

// 계산 결과 useMemo 파생
const result = useMemo(() => {
  const rm = rate / 100 / 12;
  const N  = years * 12;
  let finalVal = principal * Math.pow(1 + rm, N);
  for (let m = 0; m < N; m++) finalVal += monthly * Math.pow(1 + rm, N - m);
  const invested = principal + monthly * N;
  return {
    finalVal:   Math.round(finalVal),
    invested:   Math.round(invested),
    gain:       Math.round(finalVal - invested),
    multiple:   +(finalVal / Math.max(invested, 1)).toFixed(1),
    rule72:     +(72 / rate).toFixed(1),
  };
}, [principal, monthly, rate, years]);
```

### 엣지 케이스

- 월 적립금 0: 초기 투자금만으로 계산 (정상 동작)
- 연 수익률 0: "0% 수익률은 복리 효과가 없습니다" 안내
- 초기 투자금 + 월 적립금 모두 0: 계산 중단, 입력 유도 메시지

---

## 계산기 02 — 배당 수익률 계산기

### 기능 개요

주당 배당금과 현재 주가로 시가 배당률을 계산하고, 배당소득세(15.4%) 차감 후 실수령 배당금을 산출한다.
배당금을 재투자할 경우의 복리 자산 성장도 함께 시뮬레이션한다.

### 계산 공식

```
시가 배당률(%)  = 주당 배당금 / 현재 주가 × 100
연 배당금(세전) = 주당 배당금 × 보유 주수
연 배당금(세후) = 연 배당금(세전) × (1 - 배당소득세율 / 100)
세후 배당 수익률 = 주당 배당금 × (1 - 세율) / 현재 주가

배당 재투자 복리 최종 자산 = 보유금액 × (1 + 세후 배당 수익률)^재투자 기간(년)
  여기서 보유금액 = 현재 주가 × 보유 주수
```

### 입력 항목

| 항목 | 타입 | 기본값 | 비고 |
|---|---|---|---|
| 종목명 | text | — | 불러오기 또는 수기 입력 |
| 현재 주가 | number | — | 단위: 원 |
| 주당 배당금 | number | — | 연간 합계 기준, 단위: 원 |
| 보유 주수 | number | — | 단위: 주 |
| 배당소득세율 | number | 15.4 | % (금융소득 2천만 초과 시 종합과세) |
| 재투자 기간 | range | 10 | 1 ~ 30년 |

> 보유 종목 불러오기: `useHoldings()` 훅으로 종목 드롭다운 제공.
> 선택 시 현재 주가(수기 확인 필요), 보유 주수 자동 입력.
> 주당 배당금은 수기 입력 (증권사 API 미연동 단계).

### 출력 항목

| 항목 | 색상 | 비고 |
|---|---|---|
| 시가 배당률 | `text-amber-400` | 4% 이상: 고배당 |
| 연 배당금 (세전) | `text-white` | — |
| 연 배당금 (세후) | `text-green-400` | — |
| 재투자 후 최종 자산 | `text-amber-400` | — |
| 판정 배너 | 조건별 색상 | 아래 판정 기준 참조 |

### 판정 기준

```typescript
const getVerdict = (yld: number) => {
  if (yld >= 4) return { type: 'success', msg: `시가 배당률 ${yld.toFixed(2)}% — 고배당주 기준(4% 이상) 충족. 배당 재투자 복리 효과가 높습니다.` };
  if (yld >= 2) return { type: 'info',    msg: `시가 배당률 ${yld.toFixed(2)}% — 중간 배당주. 성장성과 배당을 함께 고려하세요.` };
  return         { type: 'warning',        msg: `시가 배당률 ${yld.toFixed(2)}% — 배당보다 주가 성장 중심 종목입니다.` };
};
```

### 컴포넌트 구조

```
DividendCalculator
├── HoldingsDropdown (종목 선택 → 주수 자동 입력)
├── InputSection
│   ├── StockNameInput
│   ├── PriceInput (현재 주가)
│   ├── DPSInput (주당 배당금)
│   ├── QuantityInput (보유 주수)
│   ├── TaxRateInput (배당소득세율)
│   └── ReinvestYearsSlider
├── ResultCards (배당률 / 세전배당금 / 세후배당금 / 재투자자산)
├── VerdictBanner (판정 배너)
└── TaxNote (세율 안내 텍스트)
```

### 상태 관리

```typescript
const [name, setName]       = useState('');
const [price, setPrice]     = useState(0);
const [dps, setDps]         = useState(0);     // 주당 배당금
const [qty, setQty]         = useState(0);
const [taxRate, setTaxRate] = useState(15.4);  // %
const [reinvestYears, setReinvestYears] = useState(10);

const result = useMemo(() => {
  if (!price || !dps) return null;
  const yld       = dps / price * 100;
  const grossAnnual = dps * qty;
  const netAnnual   = grossAnnual * (1 - taxRate / 100);
  const netRate     = dps * (1 - taxRate / 100) / price;
  const reinvestVal = price * qty * Math.pow(1 + netRate, reinvestYears);
  return { yld, grossAnnual, netAnnual, reinvestVal };
}, [price, dps, qty, taxRate, reinvestYears]);
```

### 엣지 케이스

- 주당 배당금 0: "무배당 종목입니다" 안내
- 세율 100 이상: 입력 불가 처리
- 현재 주가 0: 계산 중단

---

## 계산기 03 — 적정 주가 계산기 (PER · PBR · PEG)

### 기능 개요

세 가지 밸류에이션 지표(PER, PBR, PEG)로 종목의 적정 주가를 산출하고,
현재 주가가 고평가/저평가/적정 중 어느 구간인지 판정한다.

### 계산 공식

```
현재 PER     = 현재 주가 / EPS
현재 PBR     = 현재 주가 / BPS
PER 기준 적정가 = EPS × 업종 평균 PER
PBR 기준 적정가 = BPS × 업종 평균 PBR
종합 적정가   = (PER 기준 적정가 + PBR 기준 적정가) / 2
PEG 비율     = 현재 PER / EPS 성장률(%)
현재가 괴리율 = (현재 주가 - 종합 적정가) / 종합 적정가 × 100
```

### PEG 해석 기준

| PEG 값 | 판정 |
|---|---|
| 1 미만 | 저평가 (성장 대비 싸다) |
| 1 ~ 2 | 적정 |
| 2 초과 | 고평가 (성장 대비 비싸다) |

### 입력 항목

| 항목 | 타입 | 기본값 | 비고 |
|---|---|---|---|
| 현재 주가 | number | — | 단위: 원 |
| EPS (주당순이익) | number | — | 최근 연간 기준, 단위: 원 |
| BPS (주당순자산) | number | — | 최근 연간 기준, 단위: 원 |
| 업종 평균 PER | number | — | KRX 또는 네이버 금융 참조 |
| 업종 평균 PBR | number | — | 소수점 1자리 |
| EPS 성장률 | number | — | 향후 5년 연평균 예상 성장률, % |

> 보유 종목 불러오기: 현재 주가 참조용으로 보유 종목 드롭다운 제공.
> EPS·BPS·업종 PER·PBR은 수기 입력 (증권사 API 미연동 단계).
> 네이버 금융 → 종목 → 투자지표 탭에서 확인 가능함을 UI에 안내.

### 출력 항목

| 항목 | 색상 | 비고 |
|---|---|---|
| 현재 PER | 조건별 (아래 참조) | 업종 평균 대비 표시 |
| 현재 PBR | 조건별 | 업종 평균 대비 표시 |
| PER 기준 적정가 | `text-amber-400` | — |
| PBR 기준 적정가 | `text-amber-400` | — |
| PEG 비율 | 조건별 | 해석 텍스트 함께 표시 |
| 종합 적정가 | `text-amber-400` | PER·PBR 평균 |
| 현재가 괴리율 | 조건별 | + 고평가 / - 저평가 |
| 위치 게이지 바 | 저평가↔고평가 | 현재가/적정가 비율로 마커 위치 |
| 판정 배너 | 조건별 | 아래 기준 참조 |

### 판정 기준

```typescript
const getVerdict = (gap: number) => {
  if (gap < -15) return { type: 'success', msg: `종합 적정가 대비 ${Math.abs(gap).toFixed(1)}% 저평가. 장기 매수 관점에서 긍정적 구간입니다.` };
  if (gap >  15) return { type: 'danger',  msg: `종합 적정가 대비 ${gap.toFixed(1)}% 고평가. 추가 매수보다 관망이 적절합니다.` };
  return           { type: 'info',    msg: `종합 적정가 대비 ±15% 이내 적정 구간입니다.` };
};
```

### 컴포넌트 구조

```
ValuationCalculator
├── HoldingsDropdown (현재가 참조용 종목 선택)
├── InputSection
│   ├── PriceInput (현재 주가)
│   ├── EPSInput (주당순이익)
│   ├── BPSInput (주당순자산)
│   ├── SectorPERInput (업종 평균 PER)
│   ├── SectorPBRInput (업종 평균 PBR)
│   └── GrowthRateInput (EPS 성장률, PEG 계산용)
├── ResultCards
│   ├── CurrentPERCard
│   ├── CurrentPBRCard
│   ├── FairValuePERCard
│   ├── FairValuePBRCard
│   ├── PEGCard
│   ├── FairValueAvgCard
│   └── GapCard (현재가 괴리율)
├── ValuationGaugeBar (저평가↔고평가 위치 시각화)
├── VerdictBanner
└── DataSourceNote (데이터 출처 안내)
```

### 상태 관리

```typescript
const [price, setPrice]       = useState(0);
const [eps, setEps]           = useState(0);
const [bps, setBps]           = useState(0);
const [sectorPer, setSectorPer] = useState(0);
const [sectorPbr, setSectorPbr] = useState(0);
const [growth, setGrowth]     = useState(0);   // EPS 성장률 %

const result = useMemo(() => {
  if (!price || !eps || !bps) return null;
  const per       = price / eps;
  const pbr       = price / bps;
  const fairPer   = eps * sectorPer;
  const fairPbr   = bps * sectorPbr;
  const fairAvg   = (fairPer + fairPbr) / 2;
  const peg       = growth > 0 ? per / growth : null;
  const gap       = fairAvg > 0 ? (price - fairAvg) / fairAvg * 100 : null;
  // 게이지 위치: price/fairAvg × 50 (0~100% 범위 내 클램프)
  const gaugePos  = fairAvg > 0 ? Math.min(Math.max(price / fairAvg * 50, 0), 100) : 50;
  return { per, pbr, fairPer, fairPbr, fairAvg, peg, gap, gaugePos };
}, [price, eps, bps, sectorPer, sectorPbr, growth]);
```

### 엣지 케이스

- EPS 음수(적자 기업): "EPS가 음수인 경우 PER 계산이 무의미합니다. PBR 기준만 참고하세요" 경고
- 업종 PER·PBR 미입력: PEG·적정가 계산 불가 안내
- 성장률 0: PEG 계산 제외 (null 처리)

---

## 계산기 04 — 손절·목표가 리스크 비율 계산기 (R:R)

### 기능 개요

진입가, 손절가, 목표가(1차·2차)를 입력하면 리스크 대비 수익 비율(R:R)을 계산한다.
1:2 이상을 권장 기준으로 삼고, 현재 R:R 기준 최소 필요 승률을 함께 산출한다.

### 계산 공식

```
손실 위험(%)    = (진입가 - 손절가) / 진입가 × 100
1차 목표 수익(%) = (1차 목표가 - 진입가) / 진입가 × 100
2차 목표 수익(%) = (2차 목표가 - 진입가) / 진입가 × 100

R:R 비율 (1차) = 1차 목표 수익(%) / 손실 위험(%)
R:R 비율 (2차) = 2차 목표 수익(%) / 손실 위험(%)

손실 금액       = 투자금액 × (손실 위험% / 100)
1차 수익 금액   = 투자금액 × (1차 목표 수익% / 100)
2차 수익 금액   = 투자금액 × (2차 목표 수익% / 100)

최소 필요 승률 (1차) = 1 / (1 + R:R 비율 1차) × 100  (%)
최소 필요 승률 (2차) = 1 / (1 + R:R 비율 2차) × 100  (%)
```

> 최소 필요 승률: 해당 R:R 구조에서 기대값이 0 이상이 되려면 최소한 이 승률 이상이어야 함.

### 입력 항목

| 항목 | 타입 | 기본값 | 비고 |
|---|---|---|---|
| 진입가 (매수가) | number | — | 단위: 원 |
| 손절가 | number | — | 진입가보다 낮아야 함 |
| 1차 목표가 | number | — | 진입가보다 높아야 함 |
| 2차 목표가 | number | — | 선택 입력, 진입가보다 높아야 함 |
| 투자금액 | number | — | 단위: 원 (손실·수익 금액 계산용) |

> 보유 종목 불러오기: `useHoldings()` 훅으로 종목 선택 → 진입가(평균 매수가) 자동 입력.
> 손절가·목표가는 수기 입력 (사용자 전략에 따라 결정).

### 출력 항목

| 항목 | 색상 | 비고 |
|---|---|---|
| 손실 위험 % | `text-red-400` | — |
| 손실 금액 | `text-red-400` | — |
| 1차 목표 수익 % | `text-green-400` | — |
| 1차 수익 금액 | `text-green-400` | — |
| R:R 비율 (1차) | `text-amber-400` | "1 : X.X" 형식 |
| R:R 비율 (2차) | `text-amber-400` | 2차 미입력 시 "-" |
| 손실 vs 수익 시각화 바 | 빨강/초록 | 비율 기반 너비 |
| 최소 필요 승률 (1차) | `text-white` | — |
| 최소 필요 승률 (2차) | `text-white` | 2차 미입력 시 "-" |
| 판정 배너 | 조건별 | 아래 기준 참조 |

### 판정 기준

```typescript
const getVerdict = (rr1: number) => {
  if (rr1 >= 3)  return { type: 'success', msg: `R:R 1:${rr1.toFixed(1)} — 매우 유리한 진입 구조. 손실 1에 수익 ${rr1.toFixed(1)} 기대.` };
  if (rr1 >= 2)  return { type: 'info',    msg: `R:R 1:${rr1.toFixed(1)} — 권장 수준(1:2 이상) 충족. 진입 타당성 있습니다.` };
  if (rr1 >= 1)  return { type: 'warning', msg: `R:R 1:${rr1.toFixed(1)} — 권장치(1:2) 미달. 목표가 상향 또는 손절가 하향을 검토하세요.` };
  return           { type: 'danger',  msg: `R:R ${rr1.toFixed(1)} — 손실이 수익보다 큰 구조입니다. 진입을 재고하세요.` };
};
```

### R:R 시각화 바

```typescript
// 1차 기준 손실:수익 비율로 바 너비 계산
const lossPart   = riskPct;
const gainPart   = tp1Pct;
const total      = lossPart + gainPart;
const lossWidth  = Math.round(lossPart / total * 100); // %
const gainWidth  = 100 - lossWidth;                    // %

// 렌더링
// <div className="flex h-5 rounded overflow-hidden">
//   <div className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
//        style={{ width: `${lossWidth}%` }}>손실</div>
//   <div className="bg-green-600 flex items-center justify-center text-white text-xs font-medium"
//        style={{ width: `${gainWidth}%` }}>수익</div>
// </div>
```

### 컴포넌트 구조

```
RiskRewardCalculator
├── HoldingsDropdown (평균 매수가 → 진입가 자동 입력)
├── InputSection
│   ├── EntryPriceInput (진입가)
│   ├── StopLossInput (손절가)
│   ├── TP1Input (1차 목표가)
│   ├── TP2Input (2차 목표가, 선택)
│   └── InvestAmountInput (투자금액)
├── ResultCards
│   ├── RiskCard (손실 위험 % + 금액)
│   ├── TP1Card (1차 수익 % + 금액)
│   ├── RR1Card (R:R 비율 1차)
│   └── RR2Card (R:R 비율 2차)
├── RRVisualizationBar (손실 vs 수익 시각화)
├── VerdictBanner
├── MinWinRateSection (최소 필요 승률 1차·2차)
└── RRNote (R:R 해석 안내)
```

### 상태 관리

```typescript
const [entry,  setEntry]  = useState(0);
const [stop,   setStop]   = useState(0);
const [tp1,    setTp1]    = useState(0);
const [tp2,    setTp2]    = useState(0);
const [amount, setAmount] = useState(0);

const result = useMemo(() => {
  if (!entry || !stop || !tp1) return null;
  const riskPct  = (entry - stop) / entry * 100;
  const tp1Pct   = (tp1 - entry) / entry * 100;
  const tp2Pct   = tp2 > 0 ? (tp2 - entry) / entry * 100 : null;
  const rr1      = tp1Pct / Math.max(riskPct, 0.001);
  const rr2      = tp2Pct !== null ? tp2Pct / Math.max(riskPct, 0.001) : null;
  const riskAmt  = amount * (riskPct / 100);
  const tp1Amt   = amount * (tp1Pct / 100);
  const minWr1   = 1 / (1 + rr1) * 100;
  const minWr2   = rr2 !== null ? 1 / (1 + rr2) * 100 : null;
  return { riskPct, tp1Pct, tp2Pct, rr1, rr2, riskAmt, tp1Amt, minWr1, minWr2 };
}, [entry, stop, tp1, tp2, amount]);
```

### 엣지 케이스

- 손절가 ≥ 진입가: "손절가는 진입가보다 낮아야 합니다" 오류 표시
- 목표가 ≤ 진입가: "목표가는 진입가보다 높아야 합니다" 오류 표시
- 손실 위험 0%: 나누기 0 방어 (`Math.max(riskPct, 0.001)`)
- 2차 목표가 미입력: 2차 관련 항목 "-" 표시 (null 처리)

---

## 미결 사항 (Open Issues)

| # | 내용 | 우선순위 |
|---|---|---|
| OI-C01 | 증권사 API 연동 시 EPS·BPS·배당금 자동 입력 (현재: 수기 입력) | 향후 |
| OI-C02 | 복리 계산기의 세금(양도세·금융투자소득세) 차감 옵션 추가 | P3 |
| OI-C03 | 배당 계산기의 분기 배당 지원 (현재: 연간 합계 기준) | P3 |
| OI-C04 | 적정주가 계산기에 DCF(현금흐름할인) 모델 추가 | 향후 |
| OI-C05 | 리스크 비율 계산기의 계산 결과를 trades 메모에 자동 첨부 기능 | P2 |
| OI-C06 | 계산기 입력값 localStorage 임시 저장 (새로고침 시 복원) | P2 |

---

## 구현 순서 권장

| 순서 | 계산기 | 근거 |
|---|---|---|
| 1 | 리스크 비율 (R:R) | 서버 통신 없음, 순수 계산, 보유 종목 연동 단순 |
| 2 | 복리 수익률 | 차트 라이브러리(recharts) 필요, HoldingsPage 총 자산 연동 |
| 3 | 배당 수익률 | 보유 종목 드롭다운 연동 패턴 재사용 |
| 4 | 적정 주가 | 가장 많은 입력 항목, 게이지 UI 복잡도 높음 |
