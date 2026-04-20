# AntStockNote Orchestration & Rules v2.0

> **개정 이력**: v1.0 평가 결과(61/100)를 반영한 개선판.
> 모호한 선언 → 구체적 수치 기준으로 전환.
> 완전 누락 5개 영역(폴더 구조, 상태 관리, Supabase 규칙, Git 전략, 테스트) 신규 추가.
> **v2.1**: Tier 구조 변경 — Basic 삭제, Free 기능 확대, Premium 재정의.
> 변경·추가 항목은 `[수정]` `[추가]` 태그로 표시.

이 문서는 이 프로젝트의 **최고 권위 문서**입니다.
모든 코드 생성, 리팩터링, 디버깅, 배포 작업은 이 문서의 규칙을 우선합니다.

---

## 목차

1. [페르소나 & 커뮤니케이션](#1-페르소나--커뮤니케이션)
2. [인프라 (환경)](#2-인프라-환경)
3. [기술 스택](#3-기술-스택)
4. [실행 프로세스 (Plan Mode)](#4-실행-프로세스-plan-mode)
5. [환경 변수 & 디버깅](#5-환경-변수--디버깅)
6. [배포 체크리스트](#6-배포-체크리스트)
7. [코드 품질 기준](#7-코드-품질-기준)
8. [프로젝트 폴더 구조](#8-프로젝트-폴더-구조)
9. [Supabase 사용 규칙](#9-supabase-사용-규칙)
10. [상태 관리 전략](#10-상태-관리-전략)
11. [Git 전략 & 브랜치 규칙](#11-git-전략--브랜치-규칙)
12. [테스트 전략](#12-테스트-전략)
13. [핵심 비즈니스 규칙 요약](#13-핵심-비즈니스-규칙-요약)

---

## 1. 페르소나 & 커뮤니케이션

### 언어 & 문체

- **언어**: 모든 설명, 주석, 커뮤니케이션은 반드시 **한국어**로 작성한다.
- **문체**: 비즈니스 로직과 구조는 명확하게, 표현은 초보자도 이해할 수 있는 수준으로 작성한다.
- **접근법**: 코드만 작성하지 말고, 더 나은 대안이나 잠재적 리스크를 먼저 제안한다.

### 출력 형식

모든 응답은 아래 순서를 따른다:

```
[결론 / 해결책]  ← 핵심 답변을 가장 먼저
[코드]           ← 필요한 경우에만
[상세 설명]      ← 이유, 주의사항, 대안
```

### 능동적 제안 의무

다음 상황에서는 반드시 먼저 언급한다:

- 현재 접근법보다 더 나은 패턴이 존재할 때
- 성능 저하, 보안 취약점, 데이터 정합성 문제가 예상될 때
- 나중에 리팩터링이 필요해질 구조가 만들어질 때
- Supabase RLS 정책 누락이 예상될 때

---

## 2. 인프라 (환경)

아래 인프라는 확정된 사항이다. **다시 묻지 않는다.**

| 역할 | 서비스 | 비고 |
|---|---|---|
| 데이터베이스 | Supabase (PostgreSQL + Auth) | RLS 필수 적용 |
| 백엔드 | Supabase Serverless (Edge Functions, DB Triggers) | 민감 로직만 |
| 프론트엔드 | Vercel (React/Vite) | main 브랜치 자동 배포 |
| 도메인 | Namecheap | DNS → Vercel 연결 |

---

## 3. 기술 스택

아래 스택은 확정된 사항이다. **임의로 다른 라이브러리를 제안하거나 추가하지 않는다.**
스택 변경이 필요한 경우 반드시 먼저 이유를 설명하고 승인을 받는다.

| 분류 | 기술 | 버전 기준 |
|---|---|---|
| UI 프레임워크 | React (Functional Components + Hooks) | 18.x |
| 언어 | TypeScript | strict 모드 |
| 스타일 | Tailwind CSS | 유틸리티 클래스만 사용 |
| 전역 상태 | Zustand | 도메인별 스토어 분리 |
| DB / Auth | Supabase JS SDK | `@supabase/supabase-js` |
| 라우팅 | React Router v6 | |
| 날짜 처리 | date-fns | Day.js, Moment.js 사용 금지 |
| 차트 | recharts | 다른 차트 라이브러리 사용 금지 |
| 빌드 도구 | Vite | CRA 사용 금지 |

### 라이브러리 추가 금지 목록

아래 기능은 라이브러리 추가 없이 구현한다:

- **날짜 포맷**: date-fns 사용 (moment.js 금지)
- **HTTP 요청**: Supabase SDK 사용 (axios, fetch 직접 호출 최소화)
- **폼 관리**: React useState + 직접 구현 (react-hook-form은 복잡한 폼에만 허용)
- **아이콘**: Lucide React (다른 아이콘 라이브러리 금지)

---

## 4. 실행 프로세스 (Plan Mode)

### 작업 시작 전 체크

1. 요구사항이 `Section 13 핵심 비즈니스 규칙`과 충돌하는지 확인한다.
2. 기존 컴포넌트/훅/유틸이 이미 존재하는지 확인한다 (중복 생성 금지).
3. 영향받는 Supabase 테이블의 RLS 정책을 확인한다.

### 재무 무결성 원칙

금융 계산은 아래 규칙을 반드시 따른다:

- **PnL 계산**: 이동평균법 (FIFO 금지) — `Section 13` 공식 참조
- **부동소수점**: 모든 금액은 `parseFloat(값.toFixed(8))` 처리 후 사용
- **표시 포맷**: `Math.round(값).toLocaleString('ko-KR') + '원'`
- **비중 계산**: 총액 대비 각 항목 비율, 소수점 1자리 표시

### `[수정]` 코드 표준 — 구체적 수치 기준

| 기준 | 규칙 |
|---|---|
| 파일 최대 길이 | **300줄** 초과 시 분리 필수 |
| 함수 최대 길이 | **30줄** 초과 시 추출 필수 |
| 컴포넌트 책임 | 1개 컴포넌트 = 1개 역할 (단일 책임 원칙) |
| 중첩 조건문 | 최대 **2단계** (3단계 이상 시 early return 패턴) |
| Magic Number | 금지 — 반드시 상수로 추출 |
| `any` 타입 | 금지 — `unknown` 또는 명시적 타입 사용 |
| console.log | 개발 중에만 허용, 배포 전 전량 제거 |

### 주석 원칙

- **What(무엇)이 아닌 Why(왜)를 설명**한다.
- 모든 비즈니스 로직 함수 상단에 JSDoc 주석 필수:

```typescript
/**
 * 이동평균법으로 매도 PnL을 계산한다.
 * FIFO가 아닌 이동평균법을 쓰는 이유: 분할 매수 케이스에서
 * 매수 단가가 계속 변하므로 가중평균이 현실에 더 부합함.
 */
export const calcPnlForSell = (
  avgBuyPrice: number,
  sellPrice: number,
  quantity: number,
  fee: number
): number => {
  return (sellPrice - avgBuyPrice) * quantity - fee;
};
```

### `[수정]` 에러 핸들링 패턴

```typescript
// ✅ Supabase 쿼리 에러 처리
const { data, error } = await supabase.from('trades').select('*');
if (error) {
  console.error('[TradeList] 매매 목록 조회 실패:', error);
  toast.error('매매 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  return;
}

// ✅ try-catch 패턴
try {
  const result = await someAsyncOperation();
} catch (err) {
  console.error('[ComponentName] 작업 실패:', err);
  toast.error('처리 중 오류가 발생했습니다.');
}
```

| 에러 종류 | 처리 방법 |
|---|---|
| Supabase 쿼리 에러 | `{ data, error }` 구조 분해 후 error 우선 처리 |
| 비동기 작업 에러 | try-catch + console.error + toast.error |
| 사용자 노출 메시지 | 반드시 한국어, 친근한 문체 |
| 치명적 에러 | ErrorBoundary 컴포넌트에서 전역 처리 |
| 개발 로그 형식 | `console.error('[컴포넌트명] 설명:', error)` |

---

## 5. 환경 변수 & 디버깅

### 환경 설정 전제

모든 개발 및 배포 환경의 환경 변수는 **완벽하게 설정되어 있다**고 가정한다.

### 디버깅 우선순위

```
1순위: 코드 로직 오류 (타입 불일치, 조건문 오류, 비동기 처리)
2순위: Supabase 쿼리 조건 오류 (필터, RLS 정책, 컬럼명)
3순위: 데이터 정합성 문제 (null 처리, 부동소수점 오차)
4순위: 네트워크 / CORS 문제
5순위: 브라우저 캐시, 로컬스토리지 상태
최하위: 환경 변수 설정 오류 (1~5순위 모두 소진 후 마지막으로 확인)
```

### 필수 환경 변수

```bash
# .env.local (절대 git에 커밋하지 않음)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ 환경 변수는 반드시 `import.meta.env.VITE_*` 형식으로 접근한다.
> `process.env.*` 사용 금지 (Vite 환경에서 동작하지 않음).

---

## 6. 배포 체크리스트

### `[수정]` Vercel (프론트엔드) 배포 전

```
[ ] VITE_SUPABASE_URL 환경변수 설정 확인
[ ] VITE_SUPABASE_ANON_KEY 환경변수 설정 확인
[ ] Build Command: npm run build
[ ] Output Directory: dist
[ ] Node.js Version: 18.x 이상
[ ] 로컬에서 npm run build 에러 없이 완료 확인
[ ] TypeScript 컴파일 오류 없음 (tsc --noEmit)
[ ] console.log 잔존 여부 확인 (배포 전 전량 제거)
[ ] 모든 라우트에서 새로고침 시 404 없음 확인
```

### `[수정]` Supabase (백엔드) 배포 전

```
[ ] 모든 테이블 RLS 활성화 확인
[ ] auth.uid() = user_id 정책이 각 테이블에 적용됨 확인
[ ] Edge Function 환경변수 설정 확인
[ ] DB Migration 파일 순서대로 적용 완료 확인
[ ] subscriptions 테이블 INSERT/UPDATE가 service_role만 가능한지 확인
```

### `[추가]` 배포 후 스모크 테스트

```
[ ] 회원가입 → 이메일 인증 → 로그인 정상 작동
[ ] 매매 기록 1건 저장 → Supabase DB에 반영 확인
[ ] 다른 계정으로 로그인 시 데이터 격리 확인 (RLS 검증)
[ ] 보유 종목 조회 → is_open=true 데이터만 표시 확인
[ ] 전량 매도 후 보유 종목에서 제거 확인
```

---

## 7. 코드 품질 기준

### 파일 & 함수 크기

| 기준 | 규칙 |
|---|---|
| 파일 최대 길이 | 300줄 (초과 시 분리 필수) |
| 컴포넌트 함수 최대 길이 | 150줄 (JSX 포함) |
| 비-컴포넌트 함수 최대 길이 | 30줄 |
| 컴포넌트 책임 수 | 1개 (단일 책임 원칙) |
| Props 최대 개수 | 7개 (초과 시 객체로 묶기) |

### `[추가]` 네이밍 규칙

| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 파일 | PascalCase | `TradeModal.tsx` |
| 훅 파일 | camelCase + `use` 접두어 | `useTrades.ts` |
| 스토어 파일 | camelCase + `Store` 접미어 | `tradeStore.ts` |
| 유틸 파일 | camelCase | `calcPnl.ts` |
| 타입 파일 | PascalCase | `Trade.types.ts` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Boolean 변수 | `is`, `has`, `can` 접두어 | `isOpen`, `hasError` |
| Supabase 테이블 | snake_case | `trade_records` |
| CSS 클래스 | Tailwind 유틸리티만 | 커스텀 CSS 클래스 최소화 |

### `[추가]` 코드 작성 금지 사항

```typescript
// ❌ Magic Number 금지
if (tradeCount > 30) { ... }
// ✅ 상수로 추출
const FREE_TIER_MONTHLY_LIMIT = 30;
if (tradeCount > FREE_TIER_MONTHLY_LIMIT) { ... }

// ❌ any 타입 금지
const handleData = (data: any) => { ... }
// ✅ 명시적 타입
const handleData = (data: Trade) => { ... }

// ❌ 3단계 이상 중첩 → Early Return 패턴 사용
// ❌ 배포 코드에 console.log
```

### `[추가]` TypeScript 규칙

```typescript
// tsconfig.json 기준 — strict 모드 활성화
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

## 8. 프로젝트 폴더 구조

```
src/
├── components/
│   ├── ui/                  # 원자 단위 (Button, Input, Modal, Toast 등)
│   ├── layout/              # NavBar, BottomNav, Sidebar 등
│   └── common/              # TierGate, ErrorBoundary 등
├── pages/
│   ├── DashboardPage.tsx
│   ├── HistoryPage.tsx
│   ├── HoldingsPage.tsx
│   ├── AnalysisPage.tsx
│   ├── CalculatorPage.tsx
│   └── auth/
│       ├── LoginPage.tsx
│       └── RegisterPage.tsx
├── features/
│   ├── trades/
│   ├── holdings/
│   ├── analysis/
│   └── calculator/
├── hooks/
│   ├── useHoldings.ts
│   ├── useTrades.ts
│   └── useMobileMode.ts
├── store/                   # Zustand 전역 상태 (기존 stores/ 폴더)
│   ├── authStore.ts
│   ├── tradeStore.ts
│   ├── tierStore.ts         # [추가]
│   ├── themeStore.ts
│   └── layoutStore.ts
├── lib/
│   ├── supabase.ts
│   └── utils/
│       ├── calcPnl.ts       # [추가] PnL 계산 유틸 (tradeStore에서 분리)
│       └── format.ts
└── types/
    └── index.ts
```

---

## 9. Supabase 사용 규칙

### 클라이언트 인스턴스

```typescript
// src/api/supabase.ts (현재 프로젝트 경로 기준) — 이 파일의 인스턴스만 사용
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
// ❌ 컴포넌트 내부에서 createClient() 직접 호출 금지
```

### 쿼리 작성 규칙

```typescript
// ✅ 필요한 컬럼만 select
const { data, error } = await supabase
  .from('trades')
  .select('id, ticker, name, pnl, traded_at')
  .eq('user_id', user.id)  // RLS 이중 방어
  .order('traded_at', { ascending: false });

// ✅ 대량 데이터 페이지네이션
.range(0, 49);  // 50건 단위
```

### is_open 업데이트

```typescript
const remaining = parseFloat((buyQty - sellQty).toFixed(8));
const isFullySold = remaining < 0.000001;
if (isFullySold) {
  await supabase.from('trades').update({ is_open: false })
    .eq('user_id', userId).eq('ticker', ticker)
    .eq('type', 'buy').eq('is_open', true);
}
```

### RLS 정책 원칙

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| trades | 본인만 | 본인만 | 본인만 | 본인만 |
| notes | 본인만 | 본인만 | 본인만 | 본인만 |
| subscriptions | 본인만 | service_role만 | service_role만 | service_role만 |
| goals | 본인만 | 본인만 | 본인만 | 본인만 |

---

## 10. 상태 관리 전략

### Store 파일 목록

| 파일 | 역할 |
|---|---|
| `authStore.ts` | 로그인 사용자 정보, 세션 |
| `tradeStore.ts` | 매매 목록, CRUD, PnL 계산 |
| `tierStore.ts` | 구독 Tier, PERMISSIONS 맵, canAccess() |
| `themeStore.ts` | 다크/라이트 모드 |
| `layoutStore.ts` | 모바일/PC 레이아웃 분기 |

### PERMISSIONS 맵 (tierStore 기준)

```typescript
// Tier 구조: free(무료) / premium(유료) — basic 없음
const PERMISSIONS: Record<string, ('free' | 'premium')[]> = {
  'trade_record':       ['free', 'premium'], // 매매 기록 (Free: 월 30건 제한)
  'calendar':           ['free', 'premium'],
  'history_recent':     ['free', 'premium'], // 히스토리 최근 3개월
  'history_date_range': ['premium'],         // 히스토리 기간 직접 설정
  'calculators':        ['premium'],         // 계산기 4종
  'export_csv':         ['free', 'premium'],
  'analysis':           ['free', 'premium'],
  'theme_toggle':       ['free', 'premium'],
  'goal_tracking':      ['premium'],
  'emotion_analysis':   ['premium'],
  'csv_bulk_upload':    ['premium'],
  'ai_analysis':        ['premium'],
  'investment_goal':    ['premium'],
  'investment_rule':    ['premium'],
  'community':          ['premium'],
};
```

---

## 11. Git 전략 & 브랜치 규칙

### 브랜치 구조

```
main          ← 프로덕션 (Vercel 자동 배포)
  └─ develop  ← 개발 통합 브랜치
       └─ feature/{이슈번호}-{짧은-설명}
       └─ fix/{이슈번호}-{짧은-설명}
       └─ hotfix/{이슈번호}-{짧은-설명}
```

### Commit Message 규칙

```
{타입}: {한국어 설명} (#{이슈번호})

타입: feat | fix | refactor | style | docs | test | chore
예시: feat: 모바일 매매내역 기록하기 버튼 연결 (#07)
```

---

## 12. 테스트 전략

### 테스트 범위 정책

| 대상 | 여부 | 이유 |
|---|---|---|
| PnL 계산 로직 | **필수** | 금융 데이터 — 오류 시 사용자 손해 |
| Tier 권한 로직 | **필수** | 비즈니스 핵심 규칙 |
| 날짜/포맷 유틸 | **필수** | 엣지 케이스 많음 |
| Supabase 쿼리 함수 | 권장 | Mock 필요 |
| React 컴포넌트 | 선택 | UI 변경 잦음 |

### 테스트 실행 명령어

```bash
npm run test          # 전체 테스트 실행
npm run test:watch    # 변경 감지 모드
npm run test:coverage # 커버리지 리포트
```

---

## 13. 핵심 비즈니스 규칙 요약

### 앱 개요

| 항목 | 내용 |
|---|---|
| 앱명 | 개미의 집 (AntStockNote) |
| 대상 | 국내 개인 주식·코인 투자자 |
| Tier | **free (무료) / premium (유료) — basic 없음** |

### PnL 계산 공식 (이동평균법)

```typescript
// 매도 PnL
PnL = (매도가 - 평균매수가) × 수량 - 수수료

// 평균 매수가 (이동평균)
평균매수가 = 총매수금액 / 총보유수량

// 부동소수점 처리
잔여수량 = parseFloat((buyQty - sellQty).toFixed(8))
전량매도 = 잔여수량 < 0.000001
```

### Tier별 핵심 제한

> Tier는 **free / premium 2단계**. basic은 존재하지 않는다.

| 기능 | free | premium |
|---|---|---|
| 매매 기록 | 월 30건 | 무제한 |
| 히스토리 조회 | 최근 3개월 고정 | 최근 3개월 기본 + 기간 직접 설정 가능 |
| 계산기 4종 | ❌ | ✅ |
| CSV 다운로드 | ✅ | ✅ |
| 목표 손익 트래킹 | ❌ | ✅ |
| 감정×수익 상관 분석 | ❌ | ✅ |
| AI 고급 분석 | ❌ | ✅ |

### Free Tier 제한 구현

```typescript
const FREE_TIER_MONTHLY_LIMIT = 30;
if (tier === 'free' && (count ?? 0) >= FREE_TIER_MONTHLY_LIMIT) {
  toast.error('무료 플랜은 월 30건까지 기록할 수 있습니다. Premium으로 업그레이드하세요.');
  return;
}
```

### 숫자 표시 형식

```typescript
// 금액: Math.round(value).toLocaleString('ko-KR') + '원'
// 퍼센트: value.toFixed(2) + '%'
// 날짜: format(new Date(traded_at), 'yyyy.MM.dd HH:mm', { locale: ko })
```

---

*이 문서의 규칙 변경이 필요한 경우 이 파일을 먼저 수정하고 팀에 공유한다.*
