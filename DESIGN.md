# Design System — Binance.US (Revised v2.0)

> **개정 이력**: v1.0 감사 결과를 반영한 개선판.
> 즉시 수정 7개 · 권장 개선 9개 항목 전체 반영.
> 변경·추가된 항목은 `[수정]` `[추가]` 태그로 표시.

---

## 1. Visual Theme & Atmosphere

Binance.US radiates the polished urgency of a digital trading floor — a space where money moves and decisions happen in seconds. The design is a two-tone composition that alternates between stark white trading surfaces and deep near-black panels (`#222126`), creating a visual rhythm that mirrors the bull-and-bear duality of crypto markets. Binance Yellow (`#F0B90B`) cuts through this monochrome foundation like a gold ingot on a steel desk — unmistakable, confident, and engineered to guide every eye toward the next action.

The interface speaks the language of fintech trust. Custom BinancePlex typography gives every headline and data point a proprietary gravitas, while generous whitespace and restrained decoration keep the focus on numbers, charts, and call-to-action buttons. The design avoids visual complexity in favor of operational clarity — every element exists to either inform or convert.

**Key Characteristics:**
- Two-tone light/dark section alternation — white surfaces for trust, dark panels for depth
- Binance Yellow (`#F0B90B`) as the singular accent color driving all primary actions
- BinancePlex custom typeface providing proprietary brand identity at every text level
- Pill-shaped CTA buttons (50px radius) that demand attention
- Floating device mockups on golden gradients for product showcasing
- Crypto price tickers with real-time data prominently displayed
- Shadow-light elevation with subtle 5% opacity card shadows

---

## 2. Color Palette & Roles

### Primary

- **Binance Yellow** (`#F0B90B`): The signature — primary CTA **backgrounds**, brand accent, active states. **[수정] 텍스트 링크에 사용 금지. Yellow는 버튼 배경·아이콘·테두리 전용.**
- **Binance Gold** (`#FFD000`): Lighter gold variant used for pill button borders, secondary CTA fills, and golden gradient highlights
- **Light Gold** (`#F8D12F`): Soft gold for gradient endpoints and hover-adjacent states
- **Active Yellow** (`#D0980B`): **[수정] 호버 전용 색상. Primary 버튼·Pill 버튼 hover 시 이 색상으로 전환. (기존 Focus Blue 호버 사용 폐기)**

### Secondary & Accent

- **Focus Blue** (`#1EAEDB`): **[수정] 키보드 포커스 상태 전용. hover 상태에 사용 금지.** 모든 인터랙티브 요소의 `:focus-visible` 아웃라인에만 적용.

### Surface & Background

- **Pure White** (`#FFFFFF`): Primary page canvas, card surfaces, light section backgrounds
- **Snow** (`#F5F5F5`): Subtle surface differentiation, input backgrounds, alternating table row fills
- **Binance Dark** (`#222126`): Dark section backgrounds, footer canvas
- **Dark Card** (`#2B2F36`): Card surfaces within dark sections
- **Ink** (`#1E2026`): Button text on yellow backgrounds, deepest text color on light surfaces

### Neutrals & Text

- **Primary Text** (`#1E2026`): Main body text, headings on light backgrounds
- **Secondary Text** (`#32313A`): Navigation links, descriptive copy on light surfaces
- **Slate** (`#848E9C`): **[수정] 메타데이터·타임스탬프·플레이스홀더 전용. 흰 배경 위 일반 본문 텍스트에 사용 금지 (대비율 3.9:1 — WCAG AA 미충족).**
- **Body Accessible** (`#6B7280`): **[추가] 흰 배경 위 보조 본문 텍스트 전용 (대비율 4.6:1 — WCAG AA 충족). Slate를 대체.**
- **Dark Section Secondary** (`#9CA3AF`): **[추가] Dark Card(#2B2F36) 위 보조 텍스트 전용 (대비율 5.2:1 — WCAG AA 충족).**
- **Steel** (`#686A6C`): Subtle labels on light backgrounds — use sparingly, large text only
- **Muted** (`#777E90`): **[수정] 18px Bold 이상 텍스트에만 사용 (4.1:1 — 대형 텍스트 AA 충족). 14px 이하 일반 텍스트 사용 금지.**
- **Hover Dark** (`#1A1A1A`): Universal text link hover color

### Semantic & Data

- **Crypto Green** (`#0ECB81`): **[수정] 가격 데이터 상승 표시 전용. UI 성공 상태에 사용 금지.**
- **Crypto Red** (`#F6465D`): **[수정] 가격 데이터 하락 표시 전용. UI 에러 상태에 사용 금지.**
- **UI Success Green** (`#16A34A`): **[추가] 폼 성공·완료 등 UI 상태 전용 성공 색상 (흰 배경 대비율 5.0:1).**
- **UI Error Red** (`#DC2626`): **[추가] 폼 에러·경고 등 UI 상태 전용 에러 색상 (흰 배경 대비율 5.9:1).**
- **Border Light** (`#E6E8EA`): Standard card and section borders on light backgrounds
- **Border Gold** (`#FFD000`): Active/selected state borders, pill button outlines

### Gradient System

- **Golden Glow**: Radial gradient from `#F0B90B` center to `#F8D12F` edge — used behind product mockup screenshots
- **Dark Fade**: Linear gradient from `#222126` to transparent — used for dark section transitions

### [추가] 대비율 빠른 참조표

| 조합 | 대비율 | 상태 |
|---|---|---|
| Ink(#1E2026) on Yellow(#F0B90B) | 9.8:1 | AAA 통과 ✓ |
| White on Dark(#222126) | 18.7:1 | AAA 통과 ✓ |
| Ink on White | 16.1:1 | AAA 통과 ✓ |
| Body Accessible(#6B7280) on White | 4.6:1 | AA 통과 ✓ |
| Dark Section Secondary(#9CA3AF) on Dark Card(#2B2F36) | 5.2:1 | AA 통과 ✓ |
| Slate(#848E9C) on White | 3.9:1 | **AA 미충족 — 본문 사용 금지** |
| Yellow(#F0B90B) on White | 2.2:1 | **AA 미충족 — 텍스트 링크 사용 금지** |
| Disabled bg(#E6E8EA) / text(#848E9C) | 2.5:1 | WCAG 1.4.3 Disabled 예외 적용 |

---

## 3. Typography Rules

### Font Family

**Primary:** BinancePlex (custom proprietary typeface)
- Fallbacks: Arial, sans-serif
- Tabular numerals applied by default — critical for price column vertical alignment
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### [수정] 데스크톱 타이포그래피 위계

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---|---|---|---|
| Display Hero | 60px | 700 | 1.08 | — | Hero headlines |
| Display Secondary | 34px | 700 | 1.00 | — | Dark section titles |
| Heading 1 | 28px | 500 | 1.00 | — | Major section headings |
| Heading 2 | 24px | 700 | 1.00 | — | Feature headings, card titles |
| Heading 3 | **22px** | 600 | 1.00 | — | **[수정] 기존 24px → 22px. H2(24px)와 크기 차별화** |
| Heading 4 | 20px | 600 | 1.25 | — | Card headings, feature labels |
| Body Large | 20px | 500 | 1.50 | — | Hero subtitle, lead paragraphs |
| Body | 16px | 500 | 1.50 | — | Standard body text |
| Body SemiBold | 16px | 600 | 1.30 | — | Emphasized body, nav links |
| Body Bold | 16px | 700 | 1.50 | — | Strong emphasis text |
| Button | 16px | 600 | 1.25 | 0.16px | Primary button text |
| Button Small | 14.4px | 600 | 1.60 | 0.72px | Secondary buttons |
| Caption | 14px | 500 | 1.43 | — | Metadata, labels, prices |
| Caption SemiBold | 14px | 600 | 1.50 | — | Emphasized captions |
| Small | 12px | 600 | 1.00 | — | Tags, badges, fine print |
| Tiny | 11px | 500 | 1.00 | — | Micro-labels, chart annotations |

### [추가] 모바일 타이포그래피 스케일 (max-width 768px)

| Role | Desktop | Mobile | Weight | Notes |
|---|---|---|---|---|
| Display Hero | 60px | **36px** | 700 | 모바일 1열 화면 줄바꿈 방지 |
| Display Secondary | 34px | **24px** | 700 | |
| Heading 1 | 28px | **22px** | 500 | |
| Heading 2 | 24px | **20px** | 700 | |
| Heading 3 | 22px | **18px** | 600 | |
| Heading 4 | 20px | **17px** | 600 | |
| Body Large | 20px | **16px** | 500 | |
| Body | 16px | 16px | 500 | 변경 없음 (최소 유지) |
| Caption | 14px | 14px | 500 | 변경 없음 |
| Small | 12px | 12px | 600 | 변경 없음 |

### [추가] 텍스트 정렬 규칙

| 컨텍스트 | 정렬 방향 |
|---|---|
| 마케팅 섹션 헤드라인 (Hero, Section title) | center |
| 카드 내부 콘텐츠 | left |
| 가격·수량·퍼센트 데이터 | right (tabular numerals) |
| 버튼 텍스트 | center |
| 폼 레이블·에러 메시지 | left |
| 내비게이션 링크 | left (데스크톱 horizontal) / left (모바일 overlay) |
| Footer 링크 | left |
| Dark 섹션 헤드라인 | center |

### Principles

BinancePlex is engineered for data-dense interfaces where numbers and text must coexist at multiple scales. Tabular numerals are applied by default — critical for price columns and portfolio values. Weights lean toward the heavier end (500-700) for authority and confidence. H2(24px)와 H3(22px)의 크기 차이로 시각적 위계가 명확히 구분된다.

---

## 4. Component Stylings

### Buttons

#### [수정] 버튼 유형 선택 기준

| 상황 | 사용할 버튼 유형 |
|---|---|
| 마케팅 페이지 CTA, 히어로 섹션, 내비게이션 | **Pill (50px radius)** |
| 폼 내부 제출 버튼, 트레이딩 UI 인라인 액션 | **Regular (6px radius)** |
| 동일 행에 Pill + Regular 혼용 | **금지** |

#### Primary Button (Yellow Fill)

- Background: Binance Yellow (`#F0B90B`)
- Text: Ink (`#1E2026`), 16px/600, BinancePlex
- Border: none
- Border radius: 6px
- Padding: **[수정] 12px 32px (기존 6px 32px → 모바일 44px 터치 타겟 확보)**
- Min-height: **[추가] 44px**
- **Hover: Active Yellow(`#D0980B`) 배경 유지, 텍스트 Ink 유지 [수정: 기존 Blue 전환 폐기]**
- Active: darkens further to `#B8840A`
- Focus (`:focus-visible`): **[수정] Focus Blue(`#1EAEDB`) 2px outline + 2px offset. 배경색 변경 없음.**
- Disabled: bg `#E6E8EA`, text `#848E9C`, cursor: not-allowed
- Transition: background 200ms ease

#### Primary Pill Button (Gold)

- Background: Binance Gold (`#FFD000`)
- Text: White (`#FFFFFF`)
- Border: 1px solid `#FFD000`
- Border radius: 50px
- Padding: **[수정] 12px 24px (기존 10px → 44px 터치 타겟 확보)**
- Min-height: **[추가] 44px**
- Shadow: `rgb(153,153,153) 0px 2px 10px -3px`
- **Hover: Active Yellow(`#D0980B`) 배경, White 텍스트 [수정: 기존 Blue 전환 폐기]**
- Focus: Focus Blue 2px outline

#### Secondary Button (White Outlined)

- Background: White (`#FFFFFF`)
- Text: Binance Yellow (`#F0B90B`)
- Border: 1px solid `#F0B90B`
- Border radius: 50px
- Padding: **[수정] 12px 24px**
- Min-height: **[추가] 44px**
- Shadow: `rgb(153,153,153) 0px 2px 10px -3px`
- **Hover: Active Yellow(`#D0980B`) border + text [수정: 기존 Blue 전환 폐기]**
- Focus: Focus Blue 2px outline

#### Disabled

- Background: `#E6E8EA`
- Text: `#848E9C`
- Cursor: not-allowed
- **[추가] WCAG 1.4.3 Disabled 예외 적용 — 대비율 요건 면제**
- Pointer-events: none

### Cards & Containers

- Background: White (`#FFFFFF`) on light sections, Dark Card (`#2B2F36`) on dark sections
- Border: 0.5px solid `#E6E8EA` on light cards
- Border radius: 12px for content cards, 8px for data/trading cards
- Shadow (resting): `rgba(32, 32, 37, 0.05) 0px 3px 5px 0px`
- Shadow (hover): `rgba(8, 8, 8, 0.05) 0px 3px 5px 5px`
- Transition: box-shadow 200ms ease

### Inputs & Forms

- Background: White (`#FFFFFF`) or Snow (`#F5F5F5`)
- Text: Ink (`#1E2026`)
- Border: 1px solid `#E6E8EA`
- Border radius: 8px
- Padding: **[수정] 10px 12px (기존 0px 12px → 수직 패딩 추가, 터치 타겟 확보)**
- Min-height: **[추가] 44px**
- Placeholder: **[수정] Body Accessible(`#6B7280`) — 기존 Slate 대체**
- Focus: border 1px solid `#000000`, `box-shadow: 0 0 0 2px rgba(0,0,0,0.1)`
- Transition: border-color 200ms ease

#### [추가] 폼 레이블 간격 규칙

| 간격 | 값 | 설명 |
|---|---|---|
| 레이블 → 인풋 | 4px (space-1) | 레이블과 필드 사이 |
| 필드 그룹 간 | 16px (space-4) | 별개의 입력 항목 사이 |
| 인라인 필드 간 | 12px (space-3) | 같은 행의 필드 사이 |

#### [추가] 폼 에러 상태

- Border: 1px solid UI Error Red (`#DC2626`)
- Background: White 유지
- 에러 메시지: 12px/500, UI Error Red (`#DC2626`), 인풋 하단 4px 간격
- 에러 아이콘: 16px, Red, 인풋 우측 내부 배치

```
[에러 상태 구조]
<label>이메일</label>            ← text: Ink, 14px/500, mb: 4px
<input error-state />            ← border: DC2626, bg: white
<span class="error-msg">        ← text: DC2626, 12px/500, mt: 4px
  유효하지 않은 이메일 형식입니다.
</span>
```

### [추가] 아이콘-텍스트 정렬 규칙

Feature 카드 내 아이콘과 텍스트 수직 정렬:

- 레이아웃: `display: flex`, `flex-direction: column`, `align-items: flex-start`
- 아이콘 크기: 48px × 48px 원형
- 아이콘 → 제목 간격: 16px (space-4)
- 제목 → 설명 간격: 8px (space-2)
- 아이콘 색상: Binance Yellow (`#F0B90B`) 배경 + White 아이콘 심볼

### Navigation

- Background: White (`#FFFFFF`), sticky, `z-index: 100`
- Height: 64px
- Left: Binance logo (SVG)
- **Center/Right: 14px/600 BinancePlex, color `#32313A`**
- **Hover: `#1A1A1A` (텍스트 어두워짐. Blue 전환 없음) [수정]**
- CTA: Yellow Pill button "Get Started" — nav 우측
- Touch target: min 44×44px
- Mobile: hamburger menu, full-height overlay

---

## 5. [추가] 컴포넌트 상세 명세 (신규)

### 가격 티커 (Price Ticker)

실시간 암호화폐 가격을 표시하는 수평 스트립.

```
레이아웃:
  배경: White (#FFFFFF)
  하단 border: 1px solid #E6E8EA
  높이: 48px
  수평 패딩: 32px (컨테이너 기준)
  아이템 간 간격: 32px

아이템 구조 (좌→우):
  [코인 아이콘 24px] [코인명 14px/600 Ink] [가격 14px/600 Ink] [변동률 14px/500 Green/Red]

색상 규칙:
  상승(+): Crypto Green (#0ECB81)
  하락(-): Crypto Red (#F6465D)
  가격: Ink (#1E2026)
  코인명: Ink (#1E2026)

실시간 업데이트:
  숫자 변경 시 0.3s color fade (Red → 원래 색 또는 Green → 원래 색)
  깜빡임 없이 부드럽게 전환

터치 타겟:
  데스크톱: 아이템 클릭 시 해당 코인 상세 페이지 이동
  모바일: 전체 너비 탭 영역

모바일 처리:
  overflow-x: auto, 스크롤 가능한 가로 스크롤
  스크롤바 숨김 (scrollbar-width: none)
  최소 3개 코인 표시
```

### 모달 (Modal)

```
오버레이:
  background: rgba(0, 0, 0, 0.6)
  z-index: 1000

모달 컨테이너:
  background: White (#FFFFFF)
  border-radius: 24px
  max-width: 480px
  width: calc(100% - 32px) (모바일 기준)
  padding: 32px
  shadow: rgba(0,0,0) 0px 32px 37px

헤더 영역:
  제목: 24px/700 Ink
  닫기 버튼: 24×24px, border-radius: 2px, background: Snow (#F5F5F5)
  헤더 하단 border: 1px solid #E6E8EA, margin-bottom: 24px

바디 영역:
  본문: 16px/500 Body Accessible (#6B7280)
  내용 간격: space-4 (16px)

액션 영역:
  상단 border: 1px solid #E6E8EA, margin-top: 24px, padding-top: 24px
  버튼 배치: 우측 정렬, gap: 12px
  Primary: Yellow Pill / Secondary: White Outlined

애니메이션:
  진입: opacity 0→1 + translateY 8px→0, 200ms ease
  퇴장: opacity 1→0, 150ms ease

모바일:
  화면 하단에서 슬라이드업 (bottom sheet 패턴)
  border-radius: 24px 상단만, 하단 0
```

### 드롭다운 (Dropdown)

```
컨테이너:
  background: White (#FFFFFF)
  border: 1px solid #E6E8EA
  border-radius: 8px
  shadow: rgba(8, 8, 8, 0.05) 0px 3px 5px 5px
  min-width: 160px
  z-index: 200

아이템:
  height: 44px (터치 타겟 보장)
  padding: 0 16px
  font: 14px/500 Ink (#1E2026)
  hover background: Snow (#F5F5F5)
  hover text: Ink 유지 (색상 변경 없음)

구분선:
  1px solid #E6E8EA

열기 애니메이션:
  opacity 0→1 + translateY -4px→0, 150ms ease
```

### 데이터 테이블 (Data Table)

트레이딩 히스토리, 주문 목록 등 금융 데이터 표시용.

```
헤더 행:
  background: Snow (#F5F5F5)
  font: 12px/600 Slate (#848E9C)
  height: 40px
  border-bottom: 1px solid #E6E8EA
  텍스트 정렬: 숫자 열 right, 텍스트 열 left

데이터 행:
  height: 48px
  border-bottom: 1px solid #E6E8EA
  홀수 행: White (#FFFFFF)
  짝수 행: Snow (#F5F5F5) (교대 배경)
  font: 14px/500 Ink (#1E2026)
  hover: background #EEF0F2

열 정렬 규칙:
  가격·수량·퍼센트 열: right-align + tabular numerals (필수)
  코인명·상태 열: left-align
  날짜·시간 열: right-align

정렬 인디케이터:
  정렬 가능 열 헤더: chevron 아이콘 12px, Slate (#848E9C)
  활성 정렬: Binance Yellow (#F0B90B) 아이콘

상승/하락 색상:
  양수 PnL: Crypto Green (#0ECB81)
  음수 PnL: Crypto Red (#F6465D)

모바일:
  overflow-x: auto 스크롤
  고정 열(코인명): sticky left: 0, background 유지
  최소 표시 열: 코인명 + 가격 + 변동률
```

### Toast / 알림 (Toast Notification)

```
위치: 화면 우측 하단 고정 (fixed)
  bottom: 24px, right: 24px
  z-index: 1100

컨테이너:
  max-width: 320px
  min-width: 240px
  border-radius: 12px
  padding: 14px 16px
  shadow: rgba(0,0,0,0.12) 0px 8px 24px

유형별 스타일:
  성공: background UI Success Green (#16A34A), text White
  에러: background UI Error Red (#DC2626), text White
  정보: background Binance Dark (#222126), text White
  경고: background Binance Yellow (#F0B90B), text Ink

내부 구조:
  [아이콘 20px] [메시지 14px/500] [닫기 버튼 16px] — flex, align-items: center, gap: 10px

자동 닫힘: 4초 후
닫힘 애니메이션: opacity 1→0 + translateX 8px→0 (우측으로 슬라이드아웃), 200ms
진입 애니메이션: translateX 40px→0 + opacity 0→1, 200ms ease

다중 Toast:
  최대 3개 동시 표시
  간격: 8px
  새 Toast가 하단에 추가
```

### 로딩 / 스켈레톤 (Loading Skeleton)

```
스켈레톤 색상:
  기본: #E6E8EA (Border Light — Yellow 계열 아님)
  shimmer: #F0F1F2 (10% 밝은 회색)

shimmer 애니메이션:
  배경: linear-gradient(90deg, #E6E8EA 25%, #F0F1F2 50%, #E6E8EA 75%)
  background-size: 200% 100%
  animation: shimmer 1.5s infinite linear
  (prefers-reduced-motion: reduce 시 animation 비활성화)

형태:
  텍스트 줄: border-radius 4px, 높이 14px 또는 16px
  제목 줄: 높이 24px, 너비 60%
  이미지/아이콘 영역: border-radius 8px 또는 50% (원형)
  카드: 전체 카드 border-radius 12px

가격 티커 스켈레톤:
  높이 48px, 3~4개 아이템, 각 80px 너비

```css
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 푸터 아코디언 (Footer Accordion, Mobile)

모바일에서 푸터 링크 그룹을 접고 펼치는 컴포넌트.

```
헤더 행:
  height: 48px (터치 타겟)
  background: Dark Card (#2B2F36)
  font: 14px/600 White
  padding: 0 16px
  border-bottom: 1px solid rgba(255,255,255,0.08)

아이콘:
  chevron SVG 16px, Binance Yellow (#F0B90B)
  닫힌 상태: chevron-down
  열린 상태: chevron-up (180deg rotate, 200ms ease)

콘텐츠 영역:
  background: Binance Dark (#222126)
  padding: 12px 16px 20px
  링크: 14px/500 Body Accessible (#9CA3AF — Dark 버전)
  링크 height: 36px (간격 포함)

애니메이션:
  max-height 0→auto, 200ms ease (overflow: hidden)
  opacity 0→1, 150ms ease
```

---

## 6. Layout Principles

### Spacing System

Base unit: 8px

| Token | Value | Use |
|---|---|---|
| space-1 | 4px | 레이블→인풋 간격, 아이콘 내부 패딩 |
| space-2 | 8px | 기본 단위, 버튼 아이콘 간격, 카드 내 소항목 간격 |
| space-3 | 12px | 카드 내부 패딩, 인라인 필드 간격 |
| space-4 | 16px | 표준 패딩, 필드 그룹 간 간격 |
| space-5 | 20px | 카드 gap, 중간 패딩 |
| space-6 | 24px | 섹션 내부 패딩, 모달 헤더 하단 간격 |
| space-7 | 32px | 섹션 구분, 모달 내부 패딩 |
| space-8 | 48px | 주요 섹션 패딩 |
| space-9 | 64px | 히어로 섹션 패딩 |
| space-10 | 80px | 대형 섹션 간격 |

### Grid & Container

- Max container width: 1200px (centered)
- Hero area: single column with side-by-side text + image above 1024px
- Feature grid: 3-column desktop, 2-column tablet, single-column mobile
- Product showcase: 2-column (text + device mockup)
- Horizontal padding: 32px desktop, 16px mobile
- Grid gap: 24px between feature cards

### [추가] 가격 티커 아이템 근접성 규칙

```
아이템 간 구분: 32px gap (border 없음)
아이템 내부: [아이콘 24px] [8px gap] [코인명] [12px gap] [가격] [8px gap] [변동률]
전체 스트립: 좌우 패딩 32px (컨테이너 기준)
```

### Whitespace Philosophy

Binance.US uses whitespace as a trust signal. Light sections breathe with wide margins and generous card spacing, while dark sections compress to convey depth and capability.

### Border Radius Scale

| Value | Context |
|---|---|
| 2px | 닫기 버튼, 마이크로 인터랙티브 요소 |
| 4px | 스켈레톤 텍스트 줄 |
| 6px | Primary 버튼 (비-pill), 소형 카드 |
| 8px | 폼 인풋, 데이터 카드, 드롭다운 |
| 12px | 콘텐츠 카드, 피처 컨테이너, Toast |
| 24px | 비디오 컨테이너, 히어로 이미지, 모달 |
| 50px | Pill 버튼 (CTA), 검색 인풋, 전원 요소 |

---

## 7. Depth & Elevation

| Level | Shadow | Use |
|---|---|---|
| Flat | 없음 | 인라인 요소 기본값 |
| Subtle | `rgba(32, 32, 37, 0.05) 0px 3px 5px` | 카드 기본 상태 |
| Medium | `rgba(8, 8, 8, 0.05) 0px 3px 5px 5px` | 카드 호버, 드롭다운 |
| Pill | `rgb(153,153,153) 0px 2px 10px -3px` | Pill CTA 버튼 |
| Heavy | `rgba(0,0,0) 0px 32px 37px` | 모달 오버레이 |
| Toast | `rgba(0,0,0,0.12) 0px 8px 24px` | Toast 알림 |

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | <425px | 단일 컬럼, 스택 히어로, 햄버거 내비, 16px 패딩 |
| Small Mobile | 425-599px | 넓은 모바일 레이아웃, 티커 가로 스크롤 |
| Tablet Small | 600-768px | 2-column 피처 그리드 시작 |
| Tablet | 769-896px | 히어로 좌우 분할 시작 |
| Desktop Small | 897-1024px | 전체 내비 확장, 3-column |
| Desktop | 1024-1280px | 전체 레이아웃 |
| Large Desktop | 1280-1440px | 여백 확장, 컨테이너 중앙 |
| XL Desktop | >1440px | max-width 1200px |

### Touch Targets

- 최소 터치 타겟: 44×44px (WCAG AAA)
- Pill CTA 버튼: 44px 높이 최소값 (min-height: 44px)
- 내비게이션 링크: 44px 터치 영역
- 가격 티커 아이템: 모바일 전체 너비 탭 영역
- 드롭다운 아이템: 44px 높이
- 푸터 아코디언 헤더: 48px 높이

### [수정] 모바일 컴포넌트 처리 규칙

#### 내비게이션
- 데스크톱: 전체 수평 링크 + CTA
- 모바일(<897px): 햄버거 메뉴, 로고 + CTA만 상단 유지
- 오버레이: full-height, White 배경, 링크 44px 터치

#### 히어로 섹션
- 데스크톱: 좌 텍스트 + 우 목업 (side-by-side)
- 모바일: 텍스트 상단, 목업 하단 (stacked)
- 타이포그래피: 모바일 스케일 적용 (Section 3 참조)

#### 피처 그리드
- 데스크톱: 3-col, 24px gap
- 태블릿(600-768px): 2-col
- 모바일: 1-col

#### 섹션 패딩
- 데스크톱: 64px top/bottom
- 태블릿: 48px
- 모바일: 32px

#### [수정] 디바이스 목업
- 데스크톱: 최대 너비 컨테이너 절반 차지, 황금 그라디언트 배경
- 모바일: **max-width 280px, 중앙 정렬, 섹션 텍스트 하단에 스택 배치**
- 비율 유지: aspect-ratio 고정, CSS scale

#### [수정] 가격 티커
- 데스크톱: 가로 수평 스트립
- 모바일: **overflow-x: auto 가로 스크롤, scrollbar-width: none, 최소 3개 코인 표시**

#### [수정] QR 코드 → 앱스토어 버튼
- 데스크톱: QR 코드 120px × 120px 표시
- 모바일: QR 코드 숨김, **앱스토어 버튼 2개(App Store + Google Play) 표시**
  - 버튼 height: 44px
  - 아이콘(20px) + 텍스트(14px/600) 수평 배치
  - 버튼 간격: 12px
  - 배치: 중앙 정렬, flex-direction: row (태블릿 이상) / column (모바일)

#### 푸터
- 데스크톱: 다중 컬럼 링크 그리드
- 모바일: **아코디언 섹션 (Section 5 푸터 아코디언 명세 참조)**

---

## 9. Do's and Don'ts

### Do

- Binance Yellow (`#F0B90B`)는 버튼 배경·아이콘·테두리 전용으로만 사용
- 라이트/다크 섹션을 엄격히 교대 배치하여 시각적 리듬 형성
- BinancePlex를 weight 500 이상으로 사용 — 권위 있는 타이포그래피
- 모든 CTA Pill 버튼에 50px radius 적용 — 시그니처 인터랙티브 형태
- 콘텐츠 카드에 12px radius 유지
- 실시간 데이터(가격, 퍼센트, 통계)를 눈에 잘 띄게 표시 — 숫자가 신뢰를 만든다
- **[추가] Body Accessible(#6B7280)을 흰 배경 보조 텍스트에 사용**
- **[추가] UI Success Green(#16A34A) / UI Error Red(#DC2626)를 UI 상태 색상으로 사용**
- 모든 버튼·인풋에 min-height: 44px 적용
- `:focus-visible`에만 Focus Blue 아웃라인 적용

### Don't

- **[수정] Yellow를 텍스트 링크 색상으로 사용하지 않는다 (대비율 2.2:1, WCAG 미충족)**
- **[수정] Slate(#848E9C)를 흰 배경 일반 본문에 사용하지 않는다 (대비율 3.9:1, WCAG 미충족)**
- **[수정] 버튼 hover에 Focus Blue를 사용하지 않는다 — hover는 Active Yellow 전용, Blue는 포커스 전용**
- **[수정] Crypto Green/Red를 UI 성공/에러 상태에 사용하지 않는다 — 가격 데이터 전용**
- 추가 브랜드 컬러를 도입하지 않는다 — Yellow가 유일한 액센트
- 콘텐츠 카드에 12px 초과 radius 사용 금지 (CTA·비디오·모달 제외)
- 무거운 그림자나 hover lift 효과를 사용하지 않는다
- BinancePlex를 heading에 500 미만으로 사용하지 않는다
- Yellow 텍스트를 Yellow 배경 위에 놓지 않는다
- Pill(50px)과 Regular(6px) 버튼을 같은 행에 혼용하지 않는다
- 데코레이티브 일러스트레이션을 사용하지 않는다 — 이미지는 제품 스크린샷 또는 데이터 시각화
- 200ms ease를 초과하는 트랜지션을 사용하지 않는다
- 버튼 패딩을 12px 미만 수직값으로 설정하지 않는다 (44px 타겟 미충족)
- 스켈레톤 shimmer에 Yellow 계열 색상을 사용하지 않는다

---

## 10. Accessibility Checklist

**[추가] 구현 전 반드시 확인할 접근성 체크리스트**

### 색상 대비

- [ ] 모든 본문 텍스트(16px 이하): 대비율 4.5:1 이상
- [ ] 대형 텍스트(18px+ 일반 / 14px+ Bold): 대비율 3.0:1 이상
- [ ] CTA 버튼(Yellow 배경 + Ink 텍스트): 9.8:1 확인
- [ ] Disabled 상태: WCAG 1.4.3 예외 조항 적용 명시
- [ ] 색상만으로 정보를 전달하지 않는다 (가격 상승/하락: 색상 + 아이콘 + 기호 동시 사용)

### 키보드 접근성

- [ ] 모든 인터랙티브 요소가 `:focus-visible` 아웃라인 표시
- [ ] Focus Blue(`#1EAEDB`) 아웃라인: 2px solid, 2px offset
- [ ] Tab 순서가 시각적 순서와 일치
- [ ] 모달 열릴 때 포커스 트랩 (ESC로 닫기)
- [ ] 드롭다운: 화살표 키로 탐색 가능

### 터치 / 클릭 타겟

- [ ] 모든 버튼: min-height 44px
- [ ] 모든 인풋: min-height 44px
- [ ] 내비게이션 링크: 44px 터치 영역
- [ ] 드롭다운 아이템: 44px 높이
- [ ] 모바일 가격 티커 아이템: 전체 너비 탭 가능

### 모션 / 애니메이션

- [ ] `@media (prefers-reduced-motion: reduce)` 시 모든 트랜지션·애니메이션 비활성화
- [ ] 스켈레톤 shimmer: prefers-reduced-motion 시 정적 #E6E8EA 표시
- [ ] Toast 진입 애니메이션: prefers-reduced-motion 시 즉시 표시

---

## 11. Agent Prompt Guide

### Quick Color Reference

| 용도 | 색상 | Hex |
|---|---|---|
| Primary CTA 배경 | Binance Yellow | `#F0B90B` |
| CTA 버튼 호버 | Active Yellow | `#D0980B` |
| 포커스 아웃라인 | Focus Blue | `#1EAEDB` |
| 라이트 섹션 배경 | Pure White | `#FFFFFF` |
| 다크 섹션 배경 | Binance Dark | `#222126` |
| 헤딩 텍스트 | Ink | `#1E2026` |
| 흰 배경 보조 텍스트 | Body Accessible | `#6B7280` |
| 다크 카드 보조 텍스트 | Dark Section Secondary | `#9CA3AF` |
| 메타데이터·플레이스홀더 | Slate | `#848E9C` |
| 카드 border | Border Light | `#E6E8EA` |
| 가격 상승 | Crypto Green | `#0ECB81` |
| 가격 하락 | Crypto Red | `#F6465D` |
| UI 성공 상태 | UI Success Green | `#16A34A` |
| UI 에러 상태 | UI Error Red | `#DC2626` |

### Example Component Prompts

- "Create a hero section with white background, 36px/700 Bold headline (mobile) or 60px/700 (desktop) in Ink (#1E2026), a 16px/500 subtitle in Body Accessible (#6B7280), and a Binance Yellow (#F0B90B) pill button (50px radius, min-height 44px, 12px 24px padding) with Ink text. Hover state: Active Yellow (#D0980B)."

- "Design a crypto price ticker strip: 48px height, white background, 1px #E6E8EA bottom border. Each item: 24px coin icon + 14px/600 Ink coin name + 14px/600 Ink price + 14px/500 Green(#0ECB81) or Red(#F6465D) percentage. 32px gap between items. Mobile: overflow-x auto scroll."

- "Build a feature card grid (3-column desktop / 1-column mobile, 24px gap) with 12px radius white cards, shadow rgba(32,32,37,0.05) 0px 3px 5px. Each card: 48px circular Yellow (#F0B90B) icon at top, 16px space-4 below, 20px/600 Ink heading, 8px below, 14px/500 Body Accessible (#6B7280) description."

- "Create a dark section (#222126) with 24px/700 (mobile) or 34px/700 (desktop) white headline centered, 3-column feature grid using dark cards (#2B2F36) with 12px radius and yellow (#F0B90B) accent icons."

- "Design a form input: height 44px, padding 10px 12px, border 1px #E6E8EA, border-radius 8px, placeholder color #6B7280. Error state: border 1px #DC2626, error message 12px/500 #DC2626 below with 4px margin-top. Focus: border #000000, box-shadow 0 0 0 2px rgba(0,0,0,0.1)."

- "Create a data table: 40px header (bg #F5F5F5, text 12px/600 #848E9C), 48px data rows alternating White/#F5F5F5, 14px/500 Ink. Price and percentage columns: right-aligned tabular numerals. Positive values: #0ECB81, Negative: #F6465D."

- "Build a Toast notification: fixed bottom-right (24px offset), max-width 320px, 12px radius, shadow rgba(0,0,0,0.12) 0px 8px 24px. Success variant: #16A34A background, white text, white icon. 4s auto-dismiss. Entry: translateX 40px→0 + opacity 0→1, 200ms ease."

### Iteration Guide

1. 한 번에 하나의 컴포넌트에만 집중
2. 색상은 반드시 이 문서의 hex 코드를 참조 — 특히 Slate와 Body Accessible 구분
3. Binance Yellow는 **버튼 배경·아이콘·테두리 전용** — 텍스트 링크에 절대 사용 금지
4. 호버: Active Yellow / 포커스: Focus Blue 아웃라인 — 두 상태를 절대 혼용하지 않음
5. 모든 버튼·인풋의 min-height: 44px 확인
6. 모바일 타이포그래피는 Section 3 모바일 스케일 표 참조
7. Crypto Green/Red는 가격 데이터 전용 — UI 상태는 UI Success/Error 색상 사용
8. 5% opacity shadow 원칙 — 신뢰는 명확함에서 나온다
9. 200ms ease 트랜지션 — 금융 플랫폼은 안정감이 우선
10. 라이트/다크 섹션 교대 패턴 — 항상 엄격히 유지
