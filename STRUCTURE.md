# AntStockNote 프로젝트 구조 및 역할 가이드 (STRUCTURE.md)

이 문서는 AI와 개발자가 새로운 기획이나 기능을 추가할 때 길잡이로 활용하기 위한 문서입니다.
**관심사 분리(Separation of Concerns)**와 **컴포넌트 중심 개발** 원칙에 따라 설계되었습니다.

---

## 최상위 디렉토리 (Root Structure)

```
antstocknote/
├── backend/          # Node.js/Express 기반 API 서버 (비즈니스/데이터 처리)
├── frontend/         # React/Vite 기반 사용자 프론트엔드 (UI 및 상태 관리)
├── supabase/         # Supabase 관리 및 SQL 마이그레이션 정보
├── README.md
├── DESIGN.md         # 디자인 시스템 및 UI 원칙 문서
├── STRUCTURE.md      # 본 문서 (루트 디렉토리, 폴더별 역할 명세)
└── orchestration.md  # 프로젝트의 전체적 룰 셋 및 개발 가이드라인
```

---

## Frontend 스택 구조 (`frontend/src/`)

프론트엔드는 **UI 렌더링(Components/Pages)**과 **비즈니스 로직(Hooks/Store/Lib)**이 철저히 분리되도록 구성합니다.

```
frontend/src/
├── api/             # 서버 또는 서드파티 통신 모듈 (Supabase 클라이언트 등)
├── assets/          # 정적 리소스 (이미지, 폰트 등)
├── components/      # 재사용 가능한 UI 컴포넌트 모음 (비즈니스 로직 포함 지양)
│   ├── common/      # 프로젝트 전역에서 쓰이는 공통 컴포넌트 (버튼, 모달, 레이아웃 등)
│   ├── [Feature]/   # 특정 기능 도메인에 종속된 컴포넌트 (예: analysis, calculators)
│   └── ...
├── hooks/           # 비즈니스 로직 및 데이터 패칭을 담당하는 Custom Hooks
│   # 🚨 DB 접근(Supabase Query) 및 복잡한 리액트 외부 연동 로직은 반드시 이곳 또는 store로 분리
├── lib/             # 순수 함수 유틸리티 (테스트 대상, 외부 의존성 없음)
│   └── utils/       # PnL 계산(calcPnl) 등 핵심 비즈니스 계산 순수 함수
├── utils/           # UI/헬퍼 유틸리티 (포맷팅, CSV 파싱, 내보내기 등 사이드이펙트 허용)
│   # calcFormat.ts, csv.ts, exportUtils.ts 등 lib/utils/와 구분
├── pages/           # 라우팅 라우트에서 연결되는 최상위 페이지 컴포넌트
│   # 🚨 페이지 컴포넌트는 UI 조립의 역할만 하며, 데이터는 hook/store를 통해 주입받아야 함
│   # DesktopHistoryView, MobileHistoryView도 이곳에 위치 (HistoryPage 전용 뷰 분기)
├── store/           # Zustand 전역 상태 관리 (인증, 테마, 글로벌 도메인 데이터)
│   # authStore(인증/역할), tradeStore(매매/PnL), tierStore(구독 등급 게이팅),
│   # layoutStore(PC/모바일 전환), themeStore(라이트/다크 테마), tagStore(태그 목록),
│   # goalStore(월별 목표 손익) — 새 Store 추가 시 이곳에 명시
├── App.tsx          # 최상위 라우터 및 글로벌 프로바이더 구성
└── index.css        # Tailwind 설정 및 글로벌 스타일 (가능하면 유틸리티 클래스 위주 활용)
```

---

## Backend 스택 구조 (`backend/src/`)

백엔드는 Express와 Prisma(또는 Postgres 연동)를 통해 비즈니스 데이터 처리 및 관리자/민감 로직에 집중합니다.

```
backend/src/
├── controllers/     # 클라이언트의 HTTP 요청을 받고 응답을 반환하는 입출력 역할 (라우팅 처리)
├── middlewares/     # 라우터 진입 전 권한(Auth) 및 유효성 검사, 에러 파싱 로직
├── routes/          # API 엔드포인트와 컨트롤러를 연결
├── services/        # 실제 도메인 비즈니스 로직 처리 및 DB 호출
├── utils/           # 서버 전용 유틸리티 및 헬퍼 함수
├── prisma.ts        # Prisma ORM 클라이언트 인스턴스 설정
└── server.ts        # Express 애플리케이션 진입점 및 서버 초기화
```

---

## UI 및 컴포넌트 계층 구조 (UI & Component Hierarchy)

이 프로젝트의 UI는 재사용성과 독립성을 극대화하기 위해 다음과 같은 4단계 계층 시스템을 따릅니다.

### 1. Layout Layer (전역 레이아웃)
애플리케이션의 뼈대를 형성하며, 모든 페이지에서 공통적으로 노출되는 요소입니다.
- **주요 컴포넌트**: `NavBar` (PC 사이드 네비게이션), `BottomNav` (모바일 전용 하단 바)
- **위치**: `src/components/layout/`
- `DesktopHistoryView`, `MobileHistoryView`는 HistoryPage 전용 분기 뷰이므로 **`src/pages/`에 위치**합니다.

### 2. Page Layer (페이지 단위)
사용자가 접속하는 URL과 1:1로 대응되는 최상위 단위입니다. 비즈니스 로직을 Hook/Store로부터 주입받아 하위 컴포넌트들에 전달하는 **'컨테이너'** 역할을 수행합니다.
- **주요 페이지**:
  - `DashboardPage` (`/dashboard`): 통합 성과 대시보드
  - `CalendarPage` (`/calendar`): 날짜별 PnL 수익 캘린더
  - `HoldingsPage` (`/holdings`): 실시간 보유 종목 현황 및 관리
  - `HistoryPage` (`/history`): 과거 매매 기록 (`DesktopHistoryView` / `MobileHistoryView` 뷰 분기 포함)
  - `AnalysisPage` (`/analysis`): 수익 분석 차트 및 심리/전략 통계
  - `CalculatorPage` (`/calculator`): 복리/배당/적정주가/손익비 계산기 4종
  - `ProfilePage` (`/profile`): 닉네임 수정 및 회원 탈퇴 등 계정 관리
  - `AdminSubscriptionPage` (`/admin/subscriptions`): 관리자 전용 구독 승인 및 관리
- **위치**: `src/pages/`

### 3. Feature Layer (기능 도메인 단위)
특정 도메인에 특화되어 복잡한 UI 세트로 구성된 독립적인 단위입니다. 
- **주요 모듈**:
  - `analysis/*`: `EmotionAnalysis`, `AnalysisStats` 등 수익 분석 핵심 모듈
  - `calculators/*`: `CompoundCalculator`, `DividendCalculator` 등 개별 계산기 모듈
  - `Dashboard/*`: `GoalTracker` (투자 목표 트래킹)
  - `subscription/*`: `SubscriptionSection` (구독 상품 안내 및 연동)
  - `layout/*`: `NavBar` (PC 사이드 네비게이션), `BottomNav` (모바일 전용 하단 바)
- **위치**: `src/components/[FeatureName]/`

### 4. Atomic Layer (원자/공통 단위)
어떤 도메인에서든 범용적으로 사용될 수 있는 가장 작은 UI 조각들입니다.
- **공통 컴포넌트**: `common/TierGate` (유료 기능 접근 제한 패널)
- **독립 UI**: `MetricCard` (지표 카드), `TagChip` (태그 칩), `TradeModal` (입력 폼)
- **위치**: `src/components/` (루트 또는 `common/`)

---

## 데이터 흐름 가이드라인 (UI Data Flow)

1.  **Bottom-Up Event**: 하위 컴포넌트(Atomic)는 자체 상태를 변경하지 않고 `props`로 받은 `onClick`, `onChange` 등의 이벤트를 상위로 전달합니다.
2.  **Top-Down Data**: `Page`나 `Feature` 레이어에서 `useTradeStore` 같은 전역 상태를 구독하여 가공된 데이터를 하위로 전달합니다.
3.  **Encapsulation**: 특정 기능 섹션(예: 계산기 로직)은 해당 도메인 폴더(`calculators/`) 안에서만 완결되도록 작성하여 다른 페이지에 영향을 주지 않아야 합니다.


1. **프론트엔드의 컴포넌트 중심 개발**: `pages`와 `components` 폴더의 UI 컴포넌트는 오직 **"어떻게 보여줄 것인가(Presentational)"**에만 집중합니다.
2. **비즈니스 로직의 추상화**: Supabase를 통한 데이터 쿼리나 복잡한 분기 처리는 직접 UI 컴포넌트 내부에 두지 않고 `hooks`나 `store`로 분리하여 **"무엇을 할 것인가(Logical)"** 의도를 숨깁니다.
3. **독립적인 도메인 분리**: 컴포넌트가 커지거나 파일이 많아질 경우(`components/설명/`), 기능별로 독립적인 폴더로 쪼개어 단일 책임을 유지합니다.
4. **의존성 패키지 관리**: 무분별한 서드파티 라이브러리 사용을 지양하며, 사용하지 않는 패키지는 주기적으로 정리합니다 (`orchestration.md` 참조).
5. **충분한 주석 (Why Focus)**: 코드가 '무엇'을 구동하는지가 아닌 어떻게 기능에 기여하는지 명시합니다.
   - 각 주요 파일은 **프론트엔드의 어떤 영역/UI에 영향**을 미치는지 설명하는 문서화 주석(JSDoc 등)을 포함해야 합니다.
   - 변경 시 관련된 비즈니스 규칙과 이유를 명확히 기입하여 타인이 수정 시 오류(Regression Error)가 발생하지 않도록 돕습니다.
