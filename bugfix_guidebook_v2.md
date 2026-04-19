# 개미의 집 — 버그 수정 & 개선 가이드북 v2

| 항목 | 내용 |
|---|---|
| 문서 버전 | 2.0.0 |
| 작성일 | 2026-04-19 |
| 대상 앱 | 개미의 집 (AntStockNote) |
| 기술 스택 | React + TypeScript + Zustand + TailwindCSS + Supabase |
| 총 작업 수 | 6개 |
| 권장 처리 순서 | 01 → 02 → 03 → 04 → 05 → 06 |

---

> **사용 방법**
> 각 작업은 독립적으로 처리합니다. 하나씩 완료 후 체크박스에 표시하고 다음으로 넘어가세요.
> 각 섹션의 **바이브코딩 프롬프트** 블록을 AI 툴(Cursor / Claude Code)에 그대로 붙여넣으면 됩니다.

---

## 진행 체크리스트

- [ ] 작업 01 — 라이트모드 기록하기 매수/매도 버튼 텍스트 가독성
- [ ] 작업 02 — 매도 완료 종목 보유중 표시 버그 + 모바일/PC DB 기록 일치 검증
- [ ] 작업 03 — 포트폴리오 비중 원형 차트 추가
- [ ] 작업 04 — 투자 시뮬레이터 계산기 인풋/텍스트 우측 정렬
- [ ] 작업 05 — 매매 복기/분석 거래 횟수 추가
- [ ] 작업 06 — 최종 통합 점검

---
---

## 작업 01 — 라이트모드 기록하기 매수/매도 버튼 텍스트 가독성

### 난이도 ★★☆☆☆ | 예상 소요 15분 | 파일 1~2개

### 문제 설명

라이트모드(`data-theme="light"`)에서 TradeForm(기록하기 폼)의
매수 / 매도 세그먼트 버튼 텍스트가 배경색과 비슷하거나 너무 연해서
글자가 잘 보이지 않습니다. 다크모드에서는 정상입니다.

### 원인 분석

```
활성 버튼(매수/매도 선택됨) 텍스트 색상이
var(--color-text-primary) 또는 inherit으로 설정되어 있어서
라이트모드의 어두운 텍스트색이 유색 배경 위에 그대로 표시됨.

올바른 규칙:
  활성 버튼 텍스트 → 라이트/다크 무관 항상 흰색(#FFFFFF)
  비활성 버튼 텍스트 → var(--color-text-secondary) 유지
```

### 색상 역할 정의

| 상태 | 버튼 배경 | 텍스트 색상 | Tailwind 클래스 |
|---|---|---|---|
| 매수 활성 | 파란색 계열 | 흰색 고정 | `text-white` |
| 매도 활성 | 빨간색 계열 | 흰색 고정 | `text-white` |
| 비활성 | 투명/회색 | 보조 텍스트색 | `text-gray-400` |

### 찾아야 할 코드

```
검색 키워드: "매수" OR "매도" OR "BUY" OR "SELL"
예상 위치: TradeModal.tsx, TradeForm.tsx, 또는 TradeTypeSegment.tsx
찾아야 할 패턴:
  - 활성 버튼에 text-[var(--text-primary)] 또는 text-gray-900 등이 적용된 곳
```

### 바이브코딩 프롬프트

```
[Context]
파일: TradeModal.tsx 또는 TradeForm.tsx (매수/매도 세그먼트 버튼이 있는 컴포넌트)
기술 스택: React + TypeScript + TailwindCSS
테마 시스템: data-theme="light" / "dark" 속성 + CSS 변수
문제: 라이트모드에서 매수/매도 활성 버튼 텍스트가 배경색과 구분되지 않음

[Task]
매수/매도 세그먼트 버튼의 텍스트 색상을 수정한다.

STEP 1. TradeForm 또는 TradeModal에서 매수/매도 전환 버튼(세그먼트 컨트롤)을 찾는다.
  보통 아래 패턴으로 구현되어 있다:
    type === 'buy' ? '활성 클래스' : '비활성 클래스'
    type === 'sell' ? '활성 클래스' : '비활성 클래스'

STEP 2. 활성 상태 className에서 텍스트 색상 클래스를 찾는다.
  아래 패턴을 모두 검색한다:
    text-[var(--text-primary)]
    text-gray-900
    text-gray-800
    text-black
    text-inherit
  → 발견 시 text-white 로 교체한다.

STEP 3. 비활성 상태 className의 텍스트 색상은 변경하지 않는다.

STEP 4. 결과 확인:
  라이트모드에서 매수 버튼 클릭 시 → 파란 배경 + 흰색 텍스트
  라이트모드에서 매도 버튼 클릭 시 → 빨간 배경 + 흰색 텍스트

[Rules]
- 다크모드 스타일은 변경하지 않는다
- 버튼 배경색(bg-*)은 변경하지 않는다
- 비활성 버튼 스타일은 변경하지 않는다
- onClick 핸들러는 변경하지 않는다
- themeStore 로직은 변경하지 않는다
```

### 완료 확인

- [ ] 라이트모드에서 "매수" 활성 버튼 텍스트가 흰색으로 선명하게 보임
- [ ] 라이트모드에서 "매도" 활성 버튼 텍스트가 흰색으로 선명하게 보임
- [ ] 다크모드에서 기존과 동일하게 표시됨
- [ ] 비활성 버튼 텍스트 스타일 변화 없음
- [ ] 버튼 기능(매수↔매도 전환) 정상 작동

---

## 작업 02 — 매도 완료 종목 보유중 표시 버그 + 모바일/PC DB 기록 일치 검증

### 난이도 ★★★★☆ | 예상 소요 40분 | 파일 2~4개

### 문제 설명

**문제 A**: 매도 완료(보유 수량 0주)인 종목이 매매내역에서 "보유중"으로 표시됩니다.
**문제 B**: 보유 종목 페이지(HoldingsPage)에 매도 완료 종목이 남아 있습니다.
**검증 C**: 모바일뷰와 PC뷰의 DB 기록 로직이 동일한지 확인이 필요합니다.

### 핵심 원인 분석

```
is_open 필드 업데이트 실패:
  매도 후 tradeStore.createTrade()에서 잔여 수량을 계산하여
  is_open = false로 업데이트해야 하는데,
  전량 매도(잔여 수량 = 0) 케이스에서 업데이트가 누락됨.

부동소수점 오차:
  30주 보유 후 30주 매도 시
  30 - 30 = 2.842e-14 (부동소수점 오차)
  → 0보다 크다고 판정되어 is_open = true 유지

모바일/PC 분기 문제:
  MobileHistoryView와 DesktopHistoryView가
  각각 다른 방식으로 trades를 저장하거나 조회할 경우
  DB 기록이 불일치할 수 있음
```

### is_open 판정 로직 (올바른 구현)

```typescript
// tradeStore.ts — createTrade() 내부

// 1. 해당 ticker의 총 매수 수량 합산
const { data: buyTrades } = await supabase
  .from('trades')
  .select('quantity')
  .eq('user_id', userId)
  .eq('ticker', ticker)
  .eq('type', 'buy');

const totalBuyQty = buyTrades?.reduce((sum, t) => sum + t.quantity, 0) ?? 0;

// 2. 해당 ticker의 총 매도 수량 합산 (새로 저장된 매도 포함)
const { data: sellTrades } = await supabase
  .from('trades')
  .select('quantity')
  .eq('user_id', userId)
  .eq('ticker', ticker)
  .eq('type', 'sell');

const totalSellQty = sellTrades?.reduce((sum, t) => sum + t.quantity, 0) ?? 0;

// 3. 잔여 수량 계산 — 부동소수점 오차 방어
const remaining = parseFloat((totalBuyQty - totalSellQty).toFixed(8));

// 4. is_open 판정 — 0.000001 미만이면 전량 매도로 처리
const isFullySold = remaining < 0.000001;

if (isFullySold) {
  // 해당 ticker의 모든 buy trades를 is_open = false로 업데이트
  await supabase
    .from('trades')
    .update({ is_open: false })
    .eq('user_id', userId)
    .eq('ticker', ticker)
    .eq('type', 'buy')
    .eq('is_open', true);  // 현재 open 상태인 것만 업데이트
}
```

### 모바일/PC DB 기록 일치 검증 포인트

```
확인해야 할 항목:

1. createTrade() 호출 경로
   - PC: TradeModal → tradeStore.createTrade()
   - 모바일: TradeForm(슬라이드업) → tradeStore.createTrade()
   → 두 경로가 동일한 createTrade() 함수를 호출하는지 확인

2. 저장 데이터 필드
   - PC와 모바일 모두 동일한 필드를 Supabase에 insert하는지 확인
     필수 필드: user_id, ticker, name, type, price, quantity,
                fee, pnl, is_open, is_public, strategy_tag,
                emotion_tag, memo, traded_at

3. PnL 계산 시점
   - calcPnlForSell()이 PC와 모바일 모두에서 동일하게 실행되는지 확인
   - 모바일에서만 pnl이 null로 저장되는 케이스가 있는지 확인

4. is_open 업데이트
   - 매도 저장 후 is_open 업데이트 로직이
     PC와 모바일 모두에서 동일하게 실행되는지 확인
```

### 바이브코딩 프롬프트

```
[Context]
관련 파일:
  - tradeStore.ts: createTrade() 함수, is_open 업데이트 로직
  - MobileHistoryView.tsx (또는 모바일 매매 입력 컴포넌트)
  - DesktopHistoryView.tsx (또는 PC 매매 입력 컴포넌트)
  - HoldingsPage.tsx: 보유 종목 목록 조회
기술 스택: React + TypeScript + Zustand + Supabase JS SDK
문제:
  A. 매도 완료(보유 수량 0주) 종목이 "보유중"으로 표시됨
  B. HoldingsPage에 매도 완료 종목이 잔존함
  C. 모바일/PC 매매 저장 로직 일치 여부 미검증

[Task]

STEP 1. tradeStore.ts의 매도 처리 후 is_open 업데이트 로직을 찾는다.
  createTrade()에서 type === 'sell' 분기 처리 코드를 확인한다.

STEP 2. 잔여 수량 계산에 부동소수점 오차 방어를 추가한다.
  기존: remaining = buyQty - sellQty
  변경: remaining = parseFloat((buyQty - sellQty).toFixed(8))
  전량 매도 판정: remaining < 0.000001 이면 isFullySold = true

STEP 3. is_open = false Supabase 업데이트 쿼리를 점검한다.
  아래 4가지 조건이 모두 있는지 확인하고 없으면 추가한다:
    .eq('user_id', userId)
    .eq('ticker', ticker)
    .eq('type', 'buy')
    .eq('is_open', true)

STEP 4. 모바일/PC 기록 로직 일치 여부를 검증한다.

  4-A. PC 매매 입력 흐름과 모바일 매매 입력 흐름에서
       각각 어떤 함수를 호출하는지 추적한다.
       두 흐름 모두 동일한 tradeStore.createTrade()를 호출해야 한다.
       다른 함수를 호출한다면 두 함수의 insert 필드를 비교하여 누락 필드를 추가한다.

  4-B. 모바일에서 저장된 trade의 Supabase 레코드를 확인한다.
       pnl, is_open, strategy_tag, emotion_tag 필드가
       PC에서 저장된 레코드와 동일한 값인지 비교한다.
       다르다면 모바일 저장 로직에서 누락된 필드를 추가한다.

STEP 5. HoldingsPage의 보유 종목 조회 쿼리를 확인한다.
  is_open = true 조건이 올바르게 적용되어 있는지 확인한다:
    .eq('is_open', true)
  조건이 없거나 다르다면 추가한다.

STEP 6. 매도 저장 완료 후 HoldingsPage 목록이 즉시 갱신되도록 한다.
  tradeStore의 holdings 상태 또는 HoldingsPage의 refetch를
  createTrade() 완료 후 실행한다.

[Rules]
- PnL 계산 로직(calcPnlForSell) 수식은 변경하지 않는다
- 다른 ticker의 is_open 상태에 영향을 주지 않는다
- Supabase trades 테이블 스키마는 변경하지 않는다
- 부분 매도(잔여 수량 > 0)는 is_open = true가 유지되어야 한다
```

### 완료 확인

**문제 A — 보유중 표시**
- [ ] 전량 매도 후 매매내역에서 해당 종목이 "보유중" 대신 "매도완료"로 표시됨
- [ ] 부분 매도 후에는 "보유중"이 정상 유지됨

**문제 B — HoldingsPage 잔존**
- [ ] 전량 매도 직후 HoldingsPage에서 해당 종목이 사라짐
- [ ] 부분 매도 후에는 HoldingsPage에 정상 잔존함

**검증 C — 모바일/PC 일치**
- [ ] 모바일과 PC 모두 동일한 createTrade() 함수를 호출함
- [ ] Supabase에 저장되는 필드가 모바일/PC 동일함
- [ ] 모바일 저장 시 pnl, is_open이 null 없이 정상 저장됨

---

## 작업 03 — 포트폴리오 비중 원형 차트 추가

### 난이도 ★★★☆☆ | 예상 소요 35분 | 파일 2~3개

### 문제 설명

현재 포트폴리오 비중이 단순 텍스트(%)로만 표시됩니다.
아래 두 가지를 개선합니다.

1. 비중 계산 기준을 **현재 총 평가금액** 기준으로 변경
2. 원형 차트(PieChart)로 종목별 비중을 시각화

### 비중 계산 공식

```typescript
// 현재 평가금액 기준 비중 계산
// 현재가는 사용자가 직접 입력한 값 또는 HoldingsPage의 평균매수가 사용

const totalValue = holdings.reduce(
  (sum, h) => sum + h.currentPrice * h.quantity, 0
);

const holdingsWithWeight = holdings.map((h) => ({
  ...h,
  currentValue: h.currentPrice * h.quantity,
  weight: totalValue > 0
    ? (h.currentPrice * h.quantity) / totalValue * 100
    : 0,
}));

// weight를 소수점 1자리로 표시: weight.toFixed(1) + '%'
// 합계가 100%가 되도록 마지막 종목에서 반올림 오차 보정 필요
```

### 차트 스펙

```typescript
// recharts PieChart 구성

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#378ADD', '#1D9E75', '#BA7517', '#D85A30',
  '#7F77DD', '#D4537E', '#639922', '#888780',
];

// 데이터 구조
const chartData = holdingsWithWeight.map((h) => ({
  name: h.name,          // 종목명
  value: h.currentValue, // 평가금액 (원)
  weight: h.weight,      // 비중 (%)
}));

// 컴포넌트 구성
<ResponsiveContainer width="100%" height={220}>
  <PieChart>
    <Pie
      data={chartData}
      cx="50%"
      cy="50%"
      innerRadius={55}   // 도넛 차트 (innerRadius > 0)
      outerRadius={85}
      dataKey="value"
      label={({ name, weight }) => `${name} ${weight.toFixed(1)}%`}
      labelLine={true}
    >
      {chartData.map((_, index) => (
        <Cell key={index} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip
      formatter={(value: number) =>
        [Math.round(value).toLocaleString('ko-KR') + '원', '평가금액']}
    />
  </PieChart>
</ResponsiveContainer>
```

### 현재가 입력 처리

```
현재가를 실시간으로 알 수 없는 환경(증권사 API 미연동)이므로:

옵션 A (권장): 평균매수가를 현재가로 대체 사용
  → 정확한 현재 평가금액은 아니지만 투자금액 기준 비중을 보여줌
  → 상단에 "평균매수가 기준 비중" 안내 문구 표시

옵션 B: HoldingsPage에 현재가 수기 입력 필드 추가
  → 사용자가 직접 현재가를 입력하면 실시간 비중 계산
  → 입력하지 않으면 평균매수가로 fallback

이 작업에서는 옵션 A를 기본으로 구현한다.
(옵션 B는 추후 업그레이드)
```

### 바이브코딩 프롬프트

```
[Context]
관련 파일:
  - HoldingsPage.tsx: 보유 종목 목록 + 비중 표시
  - 차트 라이브러리: recharts (이미 설치되어 있음, package.json 확인)
기술 스택: React + TypeScript + Zustand + TailwindCSS + recharts
현재 상태: 보유 종목 목록이 텍스트 비중(%)으로만 표시됨

[Task]
HoldingsPage에 두 가지를 추가한다:
  1. 비중 계산 기준을 평균매수가 × 수량(= 투자금액) 기준으로 통일
  2. recharts PieChart(도넛 형태)로 종목별 비중 시각화

STEP 1. 비중 계산 로직을 수정한다.
  현재 비중 계산이 어떤 값을 기준으로 하는지 확인한다.
  아래 기준으로 통일한다:
    각 종목 투자금액 = avgPrice × quantity
    총 투자금액     = Σ(avgPrice × quantity)
    종목 비중(%)    = 종목 투자금액 / 총 투자금액 × 100

  비중을 소수점 1자리로 표시: toFixed(1) + '%'

STEP 2. PieChart 컴포넌트를 추가한다.
  HoldingsPage 상단(목록 위)에 도넛 차트를 배치한다.

  차트 스펙:
    - ResponsiveContainer width="100%" height={220}
    - innerRadius=55, outerRadius=85 (도넛 형태)
    - dataKey="value" (각 종목의 투자금액)
    - 색상 팔레트: ['#378ADD','#1D9E75','#BA7517','#D85A30','#7F77DD','#D4537E']
    - Tooltip: 종목명 + 평가금액(원) + 비중(%)
    - 차트 중앙 텍스트: "총 {totalValue}원" (SVG text 또는 절대 위치 div)

  라벨 표시 방법:
    종목이 5개 이하: 차트 외부에 종목명 + 비중 라벨 표시
    종목이 6개 이상: 라벨 제거, 하단 범례(Legend)로 대체

STEP 3. 차트 하단 또는 상단에 안내 문구를 추가한다.
  "평균매수가 기준 투자금액 비중"
  text-xs text-gray-400 text-center

STEP 4. 모바일 반응형 처리
  모바일(기본): 차트 height=180으로 줄임
  PC(md 이상): height=220 유지
  Tailwind: className="h-[180px] md:h-[220px]"

[Rules]
- recharts PieChart만 사용한다 (다른 차트 라이브러리 설치하지 않는다)
- 기존 보유 종목 목록(리스트) 레이아웃은 유지한다 (차트는 목록 위에 추가)
- tradeStore의 데이터 조회 로직은 변경하지 않는다
- 현재가 실시간 조회 기능은 이 작업에서 구현하지 않는다
```

### 완료 확인

- [ ] HoldingsPage 상단에 도넛형 PieChart가 표시됨
- [ ] 각 종목 비중이 평균매수가 × 수량 기준으로 계산됨
- [ ] 차트 Tooltip에 종목명, 평가금액, 비중이 표시됨
- [ ] "평균매수가 기준 투자금액 비중" 안내 문구가 표시됨
- [ ] 기존 보유 종목 목록 레이아웃 변화 없음
- [ ] 모바일에서 차트가 잘리지 않고 표시됨

---

## 작업 04 — 투자 시뮬레이터 계산기 인풋/텍스트 우측 정렬

### 난이도 ★★☆☆☆ | 예상 소요 20분 | 파일 4~5개

### 문제 설명

투자 시뮬레이터 계산기(복리 수익률, 배당 수익률, 적정 주가, R:R) 의
숫자 입력 필드와 결과 숫자 텍스트가 좌측 정렬되어 있어서
숫자 자릿수를 비교하기 어렵습니다.
숫자 관련 요소는 모두 우측 정렬로 통일합니다.

### 정렬 기준

| 요소 | 현재 | 변경 |
|---|---|---|
| 숫자 input 필드 | 좌측 정렬 | 우측 정렬 |
| 결과 카드 숫자 | 좌측 정렬 | 우측 정렬 |
| 슬라이더 현재값 표시 | 좌측 또는 중앙 | 우측 정렬 |
| 단위 텍스트("원", "%") | 좌측 | 우측 (숫자 바로 뒤) |
| 레이블 텍스트 | 좌측 유지 | 좌측 유지 (변경 없음) |

### 적용할 Tailwind 클래스

```
input 필드: text-right
결과 카드 숫자: text-right
슬라이더 값: text-right
단위 포함 flex 컨테이너: justify-end
```

### 바이브코딩 프롬프트

```
[Context]
관련 파일:
  - CalculatorPage.tsx
  - CompoundCalculator.tsx (복리 수익률)
  - DividendCalculator.tsx (배당 수익률)
  - ValuationCalculator.tsx (적정 주가)
  - RiskRewardCalculator.tsx (리스크 비율)
기술 스택: React + TypeScript + TailwindCSS

[Task]
4개 계산기 컴포넌트의 숫자 관련 요소를 모두 우측 정렬로 변경한다.

STEP 1. input 필드 우측 정렬
  모든 계산기의 숫자 입력 <input> 태그에 text-right 클래스를 추가한다.
  type="number" 또는 type="text"(숫자 포맷)인 모든 입력 필드에 적용한다.
  주의: type="text"인 종목명 입력 필드는 제외한다.

STEP 2. 결과 카드 숫자 우측 정렬
  rcard-val 또는 동등한 결과 숫자 클래스에 text-right를 추가한다.
  결과 카드 컨테이너(rcard)에 text-right를 추가하면 내부 요소 전체에 적용된다.

STEP 3. 슬라이더 현재값 우측 정렬
  슬라이더 레이블-값 행의 값 표시 span에 text-right를 추가한다.
  구조: <div class="flex justify-between"> → 값 span은 이미 우측에 있음.
  값 span에 text-right와 min-w-[48px]를 추가하여 자릿수 변동 시 흔들림 방지.

STEP 4. 판정 배너(verdict)는 좌측 정렬을 유지한다.
  info-box, warn-box, success-box, danger-box 내부 텍스트는 변경하지 않는다.

STEP 5. 레이블 텍스트는 변경하지 않는다.
  "초기 투자금", "연 수익률", "현재 주가" 등의 레이블은 좌측 정렬 유지.

[Rules]
- 계산 로직(useMemo, 수식)은 변경하지 않는다
- 레이블 텍스트 정렬은 변경하지 않는다
- 판정 배너 텍스트는 변경하지 않는다
- 차트 컴포넌트(recharts)는 변경하지 않는다
- type="text"인 종목명, 텍스트 입력 필드는 제외한다
```

### 완료 확인

- [ ] 복리 수익률 계산기 — 모든 숫자 입력 필드가 우측 정렬됨
- [ ] 배당 수익률 계산기 — 모든 숫자 입력 필드가 우측 정렬됨
- [ ] 적정 주가 계산기 — 모든 숫자 입력 필드가 우측 정렬됨
- [ ] R:R 계산기 — 모든 숫자 입력 필드가 우측 정렬됨
- [ ] 결과 카드의 숫자가 우측 정렬됨
- [ ] 슬라이더 현재값이 우측 정렬됨
- [ ] 레이블 텍스트 정렬 변화 없음
- [ ] 판정 배너 레이아웃 변화 없음

---

## 작업 05 — 매매 복기/분석 거래 횟수 추가

### 난이도 ★★★☆☆ | 예상 소요 25분 | 파일 1~2개

### 문제 설명

매매 복기/분석 페이지(AnalysisPage)의 전략별 분석 테이블 또는 카드에
현재 승률(%)과 평균 PnL만 표시되고 **거래 횟수(건수)** 가 빠져 있습니다.
거래 횟수가 없으면 "10번 중 7번 성공"인지 "2번 중 1번 성공"인지 구분이 안 돼서
승률의 신뢰도를 판단하기 어렵습니다.

### 추가할 데이터 스펙

```typescript
// 전략별 집계 결과 타입
interface StrategyStats {
  tag: string;           // 전략 태그명
  totalCount: number;    // 총 거래 횟수 (기존 없음 → 추가)
  winCount: number;      // 수익 횟수 (pnl > 0)
  lossCount: number;     // 손실 횟수 (pnl < 0)
  winRate: number;       // 승률 (%) = winCount / totalCount * 100
  avgPnl: number;        // 평균 PnL
  totalPnl: number;      // 총 PnL
}

// 클라이언트 사이드 집계
const strategyStats = useMemo(() => {
  const sellTrades = trades.filter((t) => t.type === 'sell' && t.pnl !== null);
  const grouped = groupBy(sellTrades, (t) => t.strategy_tag ?? '(태그 없음)');

  return Object.entries(grouped).map(([tag, items]) => ({
    tag,
    totalCount: items.length,                          // ← 추가
    winCount:   items.filter((t) => (t.pnl ?? 0) > 0).length,
    lossCount:  items.filter((t) => (t.pnl ?? 0) < 0).length,
    winRate:    items.length > 0
      ? items.filter((t) => (t.pnl ?? 0) > 0).length / items.length * 100
      : 0,
    avgPnl:     items.reduce((s, t) => s + (t.pnl ?? 0), 0) / items.length,
    totalPnl:   items.reduce((s, t) => s + (t.pnl ?? 0), 0),
  })).sort((a, b) => b.totalCount - a.totalCount);    // 거래 횟수 많은 순 정렬
}, [trades]);
```

### UI 표시 위치

```
전략별 분석 카드 또는 테이블에 아래 항목을 표시:

  [전략 태그명]
  거래 횟수: N회          ← 추가
  승률: XX.X%  (N승 N패)  ← "N승 N패" 세부 표시 추가
  평균 PnL: +/-XXX,XXX원
  총 PnL: +/-XXX,XXX원

승률 옆에 "(5승 3패)" 형태로 winCount, lossCount를 함께 표시하면
승률의 신뢰도를 직관적으로 파악 가능.

감정 태그 분석도 동일한 구조로 totalCount 추가.
```

### 거래 횟수 신뢰도 안내

```typescript
// 거래 횟수가 적을 때 신뢰도 낮음 경고 표시
const getReliabilityLabel = (count: number) => {
  if (count >= 20) return { label: '높음', color: 'text-green-400' };
  if (count >= 10) return { label: '보통', color: 'text-amber-400' };
  return { label: '낮음 (표본 부족)', color: 'text-red-400' };
};

// 각 전략 카드에 신뢰도 배지 표시
// 예: "신뢰도: 낮음 (표본 부족)" — 5회 미만일 때
```

### 바이브코딩 프롬프트

```
[Context]
관련 파일:
  - AnalysisPage.tsx: 매매 복기/분석 페이지
  - 전략 태그 분석 컴포넌트 (StrategyAnalysis, TagAnalysis 또는 동등한 컴포넌트)
기술 스택: React + TypeScript + Zustand + TailwindCSS
현재 상태: 전략별 승률과 평균 PnL만 표시됨. 거래 횟수 없음.

[Task]
AnalysisPage의 전략별 분석과 감정별 분석에 거래 횟수를 추가한다.

STEP 1. 집계 로직에 totalCount 추가
  strategyStats (또는 동등한 useMemo/집계 함수)를 찾는다.
  각 태그 그룹의 items.length를 totalCount로 추가한다.
  정렬 기준을 winRate → totalCount 내림차순으로 변경한다
  (거래 횟수 많은 전략이 더 신뢰도 있으므로).

STEP 2. 감정 태그 분석에도 동일하게 totalCount를 추가한다.
  emotion_tag 기준 집계에도 같은 방식으로 totalCount를 추가한다.

STEP 3. UI에 거래 횟수 표시 추가
  전략 분석 카드 또는 테이블 행에 아래를 추가한다:

  거래 횟수 행:
    <div class="flex justify-between">
      <span class="text-xs text-gray-400">거래 횟수</span>
      <span class="text-sm font-medium">{totalCount}회</span>
    </div>

  승률 옆에 세부 표시 추가:
    기존: "62.5%"
    변경: "62.5%  (5승 3패)"
    구현: `${winRate.toFixed(1)}%  (${winCount}승 ${lossCount}패)`

STEP 4. 신뢰도 배지를 거래 횟수 옆에 추가한다.
  totalCount >= 20 → 배지 없음 (충분한 표본)
  totalCount 10~19 → "표본 보통" (amber)
  totalCount < 10  → "표본 부족" (red)

  구현:
    {totalCount < 10 && (
      <span class="text-xs text-red-400 ml-1">(표본 부족)</span>
    )}

STEP 5. 상단 요약 카드에 "총 분석 거래 건수"를 추가한다.
  현재 요약 카드: 전체 승률, 평균 PnL, 오답노트 건수
  추가: 총 매도 거래 건수 (type='sell'인 trades 수)

[Rules]
- Supabase 쿼리를 새로 추가하지 않는다 (기존 trades 데이터에서 클라이언트 사이드 집계)
- 기존 승률, 평균 PnL 계산 공식은 변경하지 않는다
- AnalysisPage 전체 레이아웃은 유지한다 (항목 추가만)
- 오답노트 작성 UI는 변경하지 않는다
```

### 완료 확인

- [ ] 전략별 분석 카드에 "거래 횟수: N회"가 표시됨
- [ ] 승률 옆에 "(N승 N패)" 세부 정보가 표시됨
- [ ] 거래 횟수 9회 이하일 때 "(표본 부족)" 표시가 나타남
- [ ] 감정 태그 분석에도 거래 횟수가 표시됨
- [ ] 상단 요약 카드에 "총 매도 거래 건수"가 추가됨
- [ ] 기존 승률, 평균 PnL 수치에 변화 없음

---

## 작업 06 — 최종 통합 점검

### 난이도 ★★☆☆☆ | 예상 소요 20분

작업 01~05 완료 후 전체 흐름을 통합 점검합니다.

### 기능 흐름 점검

**매매 기록 → 보유 종목 반영**
- [ ] 매수 기록 후 HoldingsPage에 종목이 즉시 추가됨
- [ ] 부분 매도 후 HoldingsPage에 수량이 감소됨
- [ ] 전량 매도 후 HoldingsPage에서 종목이 즉시 사라짐
- [ ] 매매내역에서 전량 매도 종목의 "보유중" 표시가 없음

**포트폴리오 차트**
- [ ] HoldingsPage PieChart가 정상 렌더링됨
- [ ] 보유 종목 수가 6개 이상일 때 차트 라벨이 겹치지 않음
- [ ] 보유 종목이 0개일 때 차트 대신 "보유 종목이 없습니다" 메시지 표시

**계산기**
- [ ] 복리 수익률 계산기 입력 필드 숫자가 우측 정렬됨
- [ ] 배당 수익률 계산기 결과 카드 숫자가 우측 정렬됨
- [ ] 모바일에서 계산기 레이아웃이 깨지지 않음

**분석 페이지**
- [ ] 전략별 거래 횟수가 표시됨
- [ ] 승률 옆 "(N승 N패)" 표시가 정확함
- [ ] 오답노트 개수가 대시보드와 일치함

**테마**
- [ ] 라이트모드 기록하기 — 매수 버튼 텍스트 흰색
- [ ] 라이트모드 기록하기 — 매도 버튼 텍스트 흰색
- [ ] 다크모드 기존 스타일 변화 없음

**모바일 / PC 일치**
- [ ] 모바일에서 저장한 매매가 PC 히스토리에 동일하게 표시됨
- [ ] PC에서 저장한 매매가 모바일 히스토리에 동일하게 표시됨
- [ ] Supabase DB에서 직접 조회 시 모바일/PC 저장 레코드의 필드값이 동일함

### 회귀 테스트 (기존 기능 이상 없는지 확인)

- [ ] 로그인 / 로그아웃 정상
- [ ] 매수 기록 저장 정상
- [ ] 매도 기록 저장 + PnL 자동 계산 정상
- [ ] 수익 캘린더 날짜별 PnL 표시 정상
- [ ] 오답노트 작성 및 저장 정상
- [ ] 계산기 4종 계산 결과 정상

---

## 부록 — 이 가이드북에서 수정되는 파일 목록

| 파일 | 관련 작업 | 수정 내용 |
|---|---|---|
| `TradeModal.tsx` / `TradeForm.tsx` | 01 | 매수/매도 버튼 텍스트 색상 |
| `tradeStore.ts` | 02 | is_open 업데이트 로직, 부동소수점 방어 |
| `MobileHistoryView.tsx` | 02 | 저장 필드 일치 검증 |
| `HoldingsPage.tsx` | 02, 03 | is_open 필터 확인, PieChart 추가 |
| `CompoundCalculator.tsx` | 04 | 숫자 우측 정렬 |
| `DividendCalculator.tsx` | 04 | 숫자 우측 정렬 |
| `ValuationCalculator.tsx` | 04 | 숫자 우측 정렬 |
| `RiskRewardCalculator.tsx` | 04 | 숫자 우측 정렬 |
| `AnalysisPage.tsx` | 05 | 거래 횟수 집계 및 UI 추가 |

---

## 부록 — 자주 쓰는 패턴 참조

### 부동소수점 안전 비교
```typescript
const isSafeZero = (n: number) => Math.abs(n) < 0.000001;
const remaining = parseFloat((buyQty - sellQty).toFixed(8));
const isFullySold = isSafeZero(remaining) || remaining < 0;
```

### 숫자 우측 정렬 Input
```tsx
<input
  type="number"
  className="... text-right"
  inputMode="decimal"  // 모바일 숫자 키보드
/>
```

### recharts PieChart 빈 상태 처리
```tsx
{holdings.length === 0 ? (
  <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">
    보유 종목이 없습니다
  </div>
) : (
  <ResponsiveContainer width="100%" height={180}>
    <PieChart>...</PieChart>
  </ResponsiveContainer>
)}
```

### 승률 세부 표시
```typescript
const winRateLabel = (winRate: number, winCount: number, lossCount: number) =>
  `${winRate.toFixed(1)}%  (${winCount}승 ${lossCount}패)`;
```
