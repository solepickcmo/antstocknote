# 소프트웨어 요구사항 명세서
**Software Requirements Specification**

| 항목 | 내용 |
|---|---|
| 제품명 | 매매일지 앱 (개미의 집) |
| 문서 버전 | 2.4.0 |
| 적용 표준 | IEEE 830-1998 |
| 작성일 | 2026-04-08 |
| 최종 수정일 | 2026-04-16 |
| 문서 상태 | 진행 중 (In Progress) |
| 적용 범위 | 매매일지 앱 전체 시스템 (MVP + Premium Tier 범위) |

---

## 개정 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|---|---|---|---|
| 1.0.0 | 2026-04-08 | — | 최초 작성 (IEEE 830-1998 기반 초안) |
| 1.1.0 | 2026-04-09 | — | 계좌 개념 삭제 및 유저 중심 아키텍처로 전면 수정 |
| 1.2.0 | 2026-04-09 | — | 대시보드 개편, 태그 드롭다운, 캘린더 상세, 보유 종목 사이드바 추가 등 7대 기능 개선 반영 |
| 1.3.0 | 2026-04-10 | — | 종목 검색 자동완성, 매매 유형별 동적 태그, 매매 복기 UI 전면 개편 및 오답노트 작성 연동 반영 |
| 1.4.0 | 2026-04-11 | — | 기록하기 폼 모바일 UI 단일화, 종목명 검색용 `stock_master` 테이블 도입 및 GIN 인덱스 적용 |
| 1.5.0 | 2026-04-11 | — | 종목 검색 자동완성을 백엔드 DB 통신에서 프론트엔드 내장 CSV 로컬 파싱 방식으로 롤백 |
| 1.6.0 | 2026-04-15 | — | 종목 검색 드롭다운 UI 입력 필드별 최적화 및 백엔드 404 에러 로깅 강화 반영 |
| 1.7.0 | 2026-04-15 | — | 인프라 구조를 Railway+Supabase에서 Supabase 단독으로 변경, DDL 및 RLS 정책 추가 |
| 1.8.0 | 2026-04-15 | — | 프론트엔드 아키텍처 확정: Supabase SDK 직접 통신, Zustand 전역 상태관리, HoldingsPage 신규 추가, 반응형 레이아웃, ErrorBoundary 및 IsometricTown 요구사항 반영 |
| 1.9.0 | 2026-04-16 | — | 심리 관리 및 매매 루틴 요구사항 반영 (Pre/Post-market Journal, 심리 상태 자가 진단 등) |
| 2.0.0 | 2026-04-16 | — | **구독 Tier 3단계(Free/Basic/Premium) 도입 및 7개 신규 기능 반영**: 다크/라이트 테마, 매매내역 내보내기, 손익분기점/목표수익 계산기, 감정 분석 보강, 목표 손익 트래킹 등. subscriptions·goals 테이블 정의 및 TierGate 접근 제어 체계 명세 추가 (구현 상태: 미구현) |
| 2.1.0 | 2026-04-16 | — | **데이터베이스 보안 강화**: Supabase RLS(Row Level Security) 정책 전수 적용, UUID/TEXT 타입 불일치 에러 해결을 위한 명시적 캐스팅(::uuid) 정책 반영 |
| 2.2.0 | 2026-04-16 | — | **고급 매매 도구 및 정합성 로직 구현**: 손익분기점(BEP) 계산기, CSV 내보내기, KST 시간대 자동 반영, 공매도 방지 검증, 수수료 제외 단순 차익 계산, 동적 태그 관리(CRUD) 기능 구현 완료 |
| 2.3.0 | 2026-04-16 | — | **전체 기능 구현 완료 및 배포 반영**: SRS 상의 모든 MVP 및 P2 요구사항 구현 완료 및 Vercel 배포 완료 |
| 2.4.0 | 2026-04-16 | — | **기능 개편 및 롤백**: 손익분기점(BEP) 계산기 제거(물타기 시뮬레이터로 통합), 태그 시스템을 매수/매도 상황별로 분리된 고정 태그 세트로 롤백 및 개선 |
| 2.5.0 | 2026-04-16 | — | **롤백 및 안정화**: Apple 디자인 철회 및 이전 인디고 테마 복구, 빌드 안정성 확보 |
| 2.6.0 | 2026-04-16 | — | **Binance 디자인 시스템 도입 및 다크 모드 구현**: Binance Yellow 액센트, 고대비 White/Dark 테마 전환 기능 명세 반영 |
| 2.7.0 | 2026-04-16 | — | **보안 및 접근성 강화**: Backend Helmet 미들웨어 도입, WCAG 2.1 Level A 기반 접근성(Gold Standard) 강화 및 시각 장애인용 aria-label 전수 적용 |
| 2.8.0 | 2026-04-16 | — | **UI 가독성 및 정렬 최적화**: 매매 내역 그리드 레이아웃 도입, 라이트 모드 텍스트 대비 강화(WCAG AA 준수), 모바일 시뮬레이션 프레임 제거 및 풀스크린 대응 |
| 2.9.0 | 2026-04-17 | — | **투자 시뮬레이터 4종 구현**: 복리 수익률, 배당 수익률, 적정 주가, 리스크 비율 계산기 도입 및 보유 종목 연동 로직 반영 |
| 3.0.0 | 2026-04-18 | — | **UI/UX 대규모 개편 및 디자인 시스템 고도화**: Indigo/Blue 프라이머리 컬러 도입, 라이트 모드 고대비 가시성 확보, TradeModal 반응형 최적화(횡스크롤 제거), .impeccable.md 디자인 컨텍스트 수립 |
| 3.0.1 | 2026-04-18 | — | 대시보드 레이아웃 겹침 문제 해결 및 주력 액션 버튼 가시성(CSS 변수 맵핑) 긴급 패치 |
| 3.0.2 | 2026-04-18 | — | **UI/UX 폴리싱 및 가독성 완성**: 통계 데이터 정수화, 라이트 모드 명도 대비 보강(사이드바/홀딩스), 시뮬레이터 사용성 개선 및 오타 수정 |

---

## 목차

1. [소개](#1-소개)
2. [전체 설명](#2-전체-설명)
3. [구독 Tier 정의](#3-구독-tier-정의)
4. [기능 요구사항](#4-기능-요구사항)
5. [비기능 요구사항](#5-비기능-요구사항)
6. [데이터베이스 설계 요구사항](#6-데이터베이스-설계-요구사항)
7. [외부 인터페이스 요구사항](#7-외부-인터페이스-요구사항)
8. [부록](#8-부록)

---

## 1. 소개

### 1.1 목적 (Purpose)

본 문서는 개인 투자자를 위한 매매일지 애플리케이션의 소프트웨어 요구사항을 IEEE 830-1998 표준에 따라 정의한다. 본 SRS는 개발팀, 기획자, 이해관계자가 시스템의 기능·비기능 요구사항을 명확히 이해하고 합의하기 위한 기준 문서로 활용된다.

### 1.2 범위 (Scope)

본 애플리케이션의 명칭은 "개미의 집(가칭)"이며, 개인 주식·코인 투자자가 매매 내역을 기록하고 전략별 성과를 분석하는 모바일/웹 서비스이다. 시스템의 핵심 목표는 다음과 같다.

- 매매 내역(체결가, 수량, 전략/감정 태그)의 체계적 기록
- 손익(PnL) 캘린더 및 히스토리 시각화를 통한 투자 패턴 파악
- 전략별 승률·실수 유형 분석으로 매매 복기 지원
- 커뮤니티(개미의 집) 기능은 메인 시스템과 분리된 독립 모듈로 향후 확장

### 1.3 정의, 약어 및 용어 (Definitions, Acronyms, and Abbreviations)

| 용어/약어 | 정의 |
|---|---|
| SRS | Software Requirements Specification, 소프트웨어 요구사항 명세서 |
| MVP | Minimum Viable Product, 최소 기능 제품 |
| PnL | Profit and Loss, 손익 |
| UUID | Universally Unique Identifier, 범용 고유 식별자 |
| FK | Foreign Key, 외래 키 |
| is_public | 매매 기록의 커뮤니티 공개 여부를 나타내는 Boolean 필드 |
| is_open | 현재 보유 중인 종목 여부를 나타내는 Boolean 필드 |
| 태그 | 전략 태그(strategy_tag) 및 감정 태그(emotion_tag)의 총칭 |
| 오답 노트 | 특정 매매 건에 연결된 실수 분석 및 복기 메모 (notes 테이블) |
| 커뮤니티 DB | 개미의 집 커뮤니티 전용 데이터베이스, 메인 DB와 물리적으로 분리 |

### 1.4 참조 문서 (References)

- IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications
- 내부 DB 설계 문서: 매매일지 앱 DB 구조 단순화 설계안 v1.0
- 커뮤니티 분리 설계 문서: 개미의 집 커뮤니티 DB 분리 전략 v1.0

### 1.5 개요 (Overview)

본 문서는 다음과 같이 구성된다. 2절은 전체 시스템 개요, 3절은 기능 요구사항, 4절은 비기능 요구사항, 5절은 DB 설계 요구사항, 6절은 외부 인터페이스 요구사항을 다룬다.

---

## 2. 전체 설명

### 2.1 제품 관점 (Product Perspective)

본 시스템은 **Supabase BaaS 단독** 서버리스 아키텍처로 구현한다. 프론트엔드(Vercel 배포)는 **Supabase JS SDK**를 통해 데이터베이스에 직접 접근하며, 별도의 중간 백엔드 서버를 두지 않는다. 데이터 보안은 PostgreSQL **RLS(Row Level Security)** 정책으로 보장하며, `auth.uid() = user_id` 조건으로 본인 데이터만 접근 가능하다. 핵심 비즈니스 로직(PnL 계산, is_open 상태 결정)은 **프론트엔드 Zustand 스토어**에서 처리한다. 메인 서비스와 커뮤니티 서비스는 논리적으로 분리되며, 두 서비스는 UUID 기반의 단방향 통신으로 연결된다.

> **아키텍처 확정 (2026-04-15)**: 초기 설계의 Node.js Express 백엔드(Railway 배포)는 Supabase 단독 구조로 완전 대체되었다. 프론트엔드에서 Supabase SDK를 사용하여 CRUD 작업을 직접 수행한다.

### 2.2 제품 기능 요약 (Product Functions)

| 기능 모듈 | 설명 | 우선순위 | 구현 상태 |
|---|---|---|---|
| 대시보드 | 누적 실현손익, 수익금 추이 차트(7일), 분석 탭 통합 뷰 | P1 (MVP) | ✅ 완료 |
| 매매 기록 | 매매가·수량·전략/감정 태그 입력 및 저장, TradeModal | P1 (MVP) | ✅ 완료 |
| 수익 캘린더 | trades 집계 기반 날짜별 PnL 시각화, 월별 요약 카드 | P1 (MVP) | ✅ 완료 |
| 매매 히스토리 | 필터·검색·역시간순 목록, PC/모바일 반응형 | P1 (MVP) | ✅ 완료 |
| 보유 종목 | is_open=TRUE 종목 목록, 비중 계산 (HoldingsPage) | P1 (MVP) | ✅ 완료 |
| 매매 복기/분석 | 전략별 승률, 실수 유형, 오답 노트 (AnalysisPage) | P2 | ✅ 완료 |
| 설정/도구 | 손익분기점 계산출, 매매내역 내보내기, 알림 | P2 | ✅ 완료 |
| 커뮤니티 | 개미의 집 — 집 스킨·레벨·정보 공유 | P3 (분리) | 🔲 미구현 |

### 2.3 사용자 특성 (User Characteristics)

- 주요 사용자: 국내 개인 투자자 (주식, 코인 포함)
- 기술 수준: 스마트폰 앱에 익숙한 일반 사용자 — 전문 투자 소프트웨어 사용 경험 불필요
- 사용 빈도: 매매 발생 시 즉시 입력, 주간 단위 복기 활용

### 2.4 제약 사항 (Constraints)

- MVP 단계에서 외부 증권사/거래소 API 자동 연동은 범위 외로 제외한다.
- 별도의 백엔드 서버를 운영하지 않으며, 데이터베이스는 **Supabase(PostgreSQL) 단독** 구조로 운영한다. 모든 클라이언트-DB 통신은 **Supabase JS SDK**를 사용한다.
- 커뮤니티 기능은 메인 DB에 FK 제약을 생성하지 않는 방식으로 분리 구현해야 한다.
- 개인정보(이름, 이메일)는 커뮤니티 DB에 직접 저장하지 않는다.
- PnL 계산 및 is_open 상태 결정 로직은 **프론트엔드(Zustand tradeStore)**에서 처리한다. (향후 DB 트리거로 이관 검토 가능)
- 종목 검색 자동완성은 **프론트엔드 내장 CSV(`all_stock_master.csv`)**를 직접 파싱하여 처리하며, 네트워크 요청을 발생시키지 않는다.

### 2.5 가정 및 의존성 (Assumptions and Dependencies)

- 사용자는 최신 버전의 iOS 또는 Android 기기, 혹은 최신 웹 브라우저를 사용한다고 가정한다.
- 커뮤니티 서비스는 메인 서비스의 REST API를 통해서만 사용자 정보를 조회한다.
- 태그(전략/감정)는 시스템이 매수/매도 상황에 최적화된 고정 리스트를 제공하며, 사용자는 그 중 선택한다.
- **디자인 시스템(v2.8.0)**: **Binance.US 디자인 가이드**를 준수하며, 라이트/다크 모드 전체에서 WCAG AA 가독성 표준(텍스트 대비 4.5:1 이상)을 충족하도록 설계한다. Binance Yellow(`#F0B90B`)를 핵심 액센트로 사용하며, 모바일 환경에서는 전용 시뮬레이션 프레임 없이 브라우저 전체 영역을 활용한다.

---

## 3. 구독 Tier 정의 (Subscription Tier Definition)

> 구독 Tier는 `subscriptions` 테이블로 관리되며, 앱 전반의 기능 접근 제어 기준이 된다.

### 3.1 Tier 등급 정의

| Tier | 월 요금 | 대상 | 설명 |
|---|---|---|---|
| **Free** | 무료 | 신규 가입자 기본 | 핵심 기록 기능 제한적 제공. 서비스 체험 목적 |
| **Basic** | 월 2,900원 | 꾸준한 기록 사용자 | 무제한 기록·전체 기간 조회·내보내기 제공 |
| **Premium** | 월 6,900원 | 심층 분석·도구 활용 사용자 | Basic 전체 포함 + 계산기·분석·목표 관리·커뮤니티 |

### 3.2 Tier별 기능 접근 매트릭스

| 기능 | Free | Basic | Premium |
|---|---|---|---|
| 매매 기록 | 월 30건 | 무제한 | 무제한 |
| 히스토리 조회 기간 | 최근 3개월 | 전체 기간 | 전체 기간 |
| 보유 종목 | 최대 5종목 | 무제한 | 무제한 |
| 수익 캘린더 | O | O | O |
| 매매 복기/분석 | X | O | O |
| 감정×수익 상관 분석 | X | X | O |
| 손익분기점 계산기 | X | X | O |
| 목표 수익 역산 계산기 | X | X | O |
| 전체 매매내역 내보내기 | X | O | O |
| 목표 손익 설정 + 트래킹 | X | X | O |
| 다크/라이트 테마 전환 | O | O | O |
| 매매 루틴 관리 | O | O | O |
| 커뮤니티 (개미의 집) | X | X | O |

### 3.3 Tier 접근 제어 구현 원칙

**이중 방어 구조 필수 적용**
- **프론트엔드**: `TierGate` 컴포넌트 및 `tierStore`를 통한 UX 레이어 제어
- **DB 레이어**: Supabase RLS 및 `get_user_tier()` 함수를 통한 데이터 접근 제어

---

## 4. 기능 요구사항

### 4.1 사용자 계정 관리

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-001 | 사용자는 이메일과 비밀번호로 회원가입할 수 있어야 한다. 인증은 **Supabase Auth**를 통해 처리한다. | P1 | ✅ 완료 |
| FR-002 | 사용자는 소셜 로그인(Google, Kakao)으로 인증할 수 있어야 한다. | P2 | 🔲 미구현 |
| FR-003 | 시스템은 사용자에게 UUID 기반의 고유 ID를 발급해야 한다. Supabase Auth가 `auth.users` 테이블에서 자동 발급한다. | P1 | ✅ 완료 |
| FR-004 | 사용자는 커뮤니티 참여 여부(public_profile_enabled)를 설정할 수 있다. | P2 | 🔲 미구현 |
| FR-005 | 사용자는 설정(모바일 BottomNav) 또는 사이드바(PC NavBar)에서 안전하게 로그아웃할 수 있어야 한다. | P1 | ✅ 완료 |
| FR-006 | 사용자는 로그인 화면에서 이메일 인증을 통해 비밀번호를 재설정할 수 있어야 한다. (ResetPasswordPage) | P1 | ✅ 완료 |
| FR-007 | 앱은 **반응형 레이아웃**을 지원해야 한다. PC 환경에서는 사이드 NavBar를, 모바일 환경에서는 하단 BottomNav를 표시해야 한다. 레이아웃 모드는 `layoutStore`에서 전역 관리된다. | P1 | ✅ 완료 |
| FR-008 | 앱은 **ErrorBoundary** 컴포넌트를 최상위에 배치하여 런타임 오류 발생 시 앱 전체가 흰 화면으로 멈추는 것을 방지하고 사용자에게 오류 메시지를 노출해야 한다. | P1 | ✅ 완료 |

### 4.2 구독 Tier 관리 (미구현)

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-110 | 앱 초기화 시 `tierStore`는 `subscriptions` 테이블을 조회하여 현재 사용자의 Tier를 로드해야 한다. (기본값: free) | P1 | 🔲 미구현 |
| FR-111 | `TierGate` 컴포넌트는 검증 미충족 시 `UpgradePrompt` 모달을 렌더링해야 한다. | P1 | 🔲 미구현 |
| FR-112 | Free 사용자가 월 30건 한도 초과 시도 시 `UpgradePrompt`를 표시하고 저장을 차단해야 한다. | P1 | 🔲 미구현 |
| FR-113 | Free 사용자가 3개월 이전 히스토리 조회 시도 시 해당 기간 데이터 영역에 잠금 UI를 표시해야 한다. | P1 | 🔲 미구현 |
| FR-114 | DB Function `get_user_tier()`는 `subscriptions` 테이블에서 유효한 Tier를 반환해야 한다. | P1 | 🔲 미구현 |

### 4.3 매매 기록

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-020 | 사용자는 매수/매도 구분(type), 종목 코드(ticker), 종목명(name), 체결가(price), 수량(quantity), 수수료(fee), 체결일시(traded_at)를 입력할 수 있어야 한다. 입력 UI는 **TradeModal** 컴포넌트로 구현한다. | P1 | ✅ 완료 |
| FR-021 | 사용자는 매매 건에 전략 태그(strategy_tag) 및 감정 태그(emotion_tag)를 복수 지정할 수 있어야 한다. | P1 | ✅ 완료 |
| FR-022 | 매매 건에 자유 메모(memo, 최대 1,000자)를 입력할 수 있어야 한다. | P1 | ✅ 완료 |
| FR-023 | 시스템은 매수/매도 매칭 시 PnL(수익/손실)을 **이동평균법**으로 계산하여 저장해야 한다. `PnL = (매도가 - 평균매수가) × 수량 - 수수료`. **현재 구현**: 프론트엔드 `tradeStore`의 `calcPnlForSell()` 함수에서 처리 후 Supabase에 저장. (향후 DB 트리거로 이관 검토) | P1 | ✅ 완료 |
| FR-024 | 사용자는 특정 매매 건을 커뮤니티에 공개(is_public = TRUE)로 설정할 수 있어야 한다. | P2 | 🔲 미구현 |
| FR-025 | 보유 중인 종목은 is_open = TRUE로 표시되며, 전량 매도 시 자동으로 FALSE로 변경되어야 한다. **현재 구현**: 프론트엔드 `tradeStore`의 `createTrade()`에서 잔여 수량을 계산하여 `is_open` 값을 결정 후 저장. | P1 | ✅ 완료 |
| FR-026 | 종목 입력 시 프론트엔드에 내장된 CSV 파일(`all_stock_master.csv`)을 직접 로드하고 파싱하여 초고속으로 검색 자동완성(Auto-Complete) 기능을 제공한다. **사용자 편의를 위해 종목코드 입력 시에는 드롭다운에 티커만, 종목명 입력 시에는 종목명만 노출하여 가독성을 극대화한다.** KRX 종목은 티커 좌측 0패딩 규칙을 따른다. | P1 | ✅ 완료 |
| FR-027 | 거래 유형(매수/매도)에 따라 선택 가능한 기본 전략 태그와 감정 태그가 동적으로 제공되어야 한다. PC 환경에서도 모바일과 동일한 컴포넌트(세그먼트 컨트롤, 칩 버튼)로 렌더링 되어야 한다. | P1 | ✅ 완료 |
| FR-028 | 앱 최초 진입 시 **IsometricTown** 시각화 컴포넌트를 제공해야 한다. 매매 일지 저장 횟수에 따라 건물이 성장하는 아이소메트릭 타운 애니메이션이 대시보드에 표시되어야 한다. | P2 | ✅ 완료 |
| FR-029 | 기록하기 버튼 클릭 시 초기 거래 시간은 **대한민국 시간(UTC+09:00)**을 기준으로 시스템 현재 시간을 자동으로 입력해야 한다. | P1 | ✅ 완료 |
| FR-033 | 매도 기록 시 해당 종목의 현재 보유 수량을 실시간으로 체크하여, 보유량보다 많은 주식을 매도하려 할 경우 경고와 함께 저장을 차단해야 한다(공매도 방지). | P1 | ✅ 완료 |
| FR-034 | 전체 손익(PnL) 통계 산출 시 수수료를 제외한 **(매도가 - 평균매수가) × 수량** 공식을 적용하여 단순 매매 차익만을 집계해야 한다. | P2 | ✅ 완료 |

### 4.4 대시보드

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-030 | 대시보드는 **누적 실현손익**을 표시하되, 매매 내역이 없을 시 0원으로 노출해야 한다. 금액 표기 시 소수점을 제거(Math.floor)한다. MetricCard 컴포넌트 3개(누적 실현손익, 누적 수익금, 전체 매매 건수)로 구성한다. | P1 | ✅ 완료 |
| FR-031 | 대시보드는 접속일 기준 과거 3일 ~ 미래 3일 (총 7일)의 수익금 추이 AreaChart를 표시해야 하며, 거래가 없는 날짜는 빈 값이 아닌 0원으로 표기되어야 한다. 차트의 툴팁은 "손익" 한글 텍스트를 사용한다. recharts 라이브러리를 사용한다. | P1 | ✅ 완료 |
| FR-032 | 대시보드 하단에 **AnalysisPage 컴포넌트를 직접 임베딩**하여 전략/감정 태그별 분석 데이터를 함께 표시한다. /analysis 경로로의 독립 접근도 지원한다. | P1 | ✅ 완료 |

### 4.5 수익 캘린더

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-040 | 시스템은 캘린더의 각 날짜 칸에 해당 날짜의 총 손익(PnL) 잔액을 간결하게 표시해야 한다. 날짜 칸 내부에는 매매 리스트를 표시하지 않는다. | P1 | ✅ 완료 |
| FR-041 | 달력의 해당 날짜 전체 PnL 합계를 계산하여 적색/녹색 색상 기반 배경이나 아이콘으로 표시하며, 하단에 기호(수익, 손실, 거래없음) 범례를 제공해야 한다. | P1 | ✅ 완료 |
| FR-042 | 날짜 셀 터치/클릭 시 캘린더 하단 영역에 해당일의 매매 내역 목록(종목명, 매수/매도, 금액 등)을 상세히 나열하여 보여주어야 한다. | P1 | ✅ 완료 |
| FR-043 | 캘린더 상단에는 현재 선택된 달의 요약 정보(이달 총 손익, 수익일 수, 손실일 수, 일평균 손익)를 4개의 카드로 요약하여 제공해야 한다. | P1 | ✅ 완료 |

### 4.6 매매 히스토리

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-050 | 매매 히스토리는 전체 trades를 역시간순으로 목록 표시해야 한다. PC에서는 `DesktopHistoryView`, 모바일에서는 `MobileHistoryView`로 분기 렌더링한다. | P1 | ✅ 완료 |
| FR-051 | 사용자는 종목 코드, 전략 태그, 감정 태그, 기간으로 필터링할 수 있어야 한다. | P1 | ✅ 완료 |
| FR-052 | 사용자는 종목명 또는 메모 키워드로 검색할 수 있어야 한다. | P1 | ✅ 완료 |
| FR-053 | 현재 보유 종목(is_open = TRUE) 목록은 **독립 HoldingsPage**(`/holdings` 경로)에서 보유 비중과 함께 제공해야 한다. | P1 | ✅ 완료 |

### 4.7 매매 복기 / 분석

| ID | 요구사항 | 우선순위 |
|---|---|---|
| FR-060 | 시스템은 전체 승률, 평균수익률, 총 오답 노트 건수 중심의 요약 대시보드를 상단에 제공해야 한다. | P2 |
| FR-061 | 사용자는 콤보박스로 특정 매도 건을 직접 선택하여 오답 노트(notes)를 편하게 작성할 수 있는 UI 폼을 제공받아야 한다. | P2 |
| FR-062 | '실수 유형 분석' 데이터는 별도의 실수 코드가 아닌 손실 거래 시 사용된 전략 태그를 기준으로 자동 분류 및 시각화되어야 한다. | P2 |
| FR-063 | 복기 리스트는 오답 노트의 내용을 작성일 역순으로 보여주며, 각 노트에는 연관된 매매 정보(종목명, 날짜, 전략태그)와 더보기 기능이 구현되어야 한다. | P2 |

### 4.8 태그 관리

| ID | 요구사항 | 우선순위 |
|---|---|---|
| FR-070 | 시스템은 매수(Buy)와 매도(Sell) 상황에 각각 최적화된 전략 태그와 감정 태그 리스트를 고정 제공해야 한다. | P1 | ✅ 완료 |
| FR-071 | 태그는 고정 시스템으로 운영되며, 사용자의 직접적인 생성/삭제 기능은 제공하지 않는다. (데이터 정합성 및 분석 안정성 목적) | P1 | ✅ 완료 |
| FR-072 | 각 태그 카테고리(전략/감정)별로 상황에 맞는 10개 내외의 태그를 제공하여 선택 편의성을 제공한다. | P2 | ✅ 완료 |

### 4.9 커뮤니티 (개미의 집) — 분리 모듈

> 커뮤니티 기능은 메인 서비스와 독립적으로 운영되는 별도 모듈로 정의한다. 본 SRS의 MVP 범위에서는 연결 인터페이스 요구사항만 명시하며, 커뮤니티 자체 기능 상세는 별도 SRS에서 다룬다.

| ID | 요구사항 | 우선순위 |
|---|---|---|
| FR-080 | 메인 DB의 users 테이블은 커뮤니티 참여 동의 여부(public_profile_enabled BOOLEAN)와 최초 가입 시점(community_joined_at TIMESTAMP)을 저장해야 한다. | P3 |
| FR-081 | 메인 DB의 trades 테이블은 커뮤니티 공개 여부(is_public BOOLEAN, DEFAULT FALSE)를 저장해야 한다. | P3 |
| FR-082 | 커뮤니티 서비스는 메인 서비스의 REST API를 통해서만 사용자 정보를 조회해야 하며, 메인 DB에 직접 접근할 수 없어야 한다. | P3 |
| FR-083 | 커뮤니티 DB는 user_id(UUID) 및 trade_id(정수)만 참조하며, FK 제약을 설정하지 않는 Loose Coupling 방식을 적용해야 한다. | P3 |
| FR-084 | 커뮤니티 서비스를 중단하거나 삭제해도 메인 DB(users, trades, notes, tags 테이블)에 영향이 없어야 한다. | P3 | 🔲 미구현 |
| FR-085 | 사용자는 탈퇴 시 모든 데이터를 안전하게 삭제할 수 있어야 한다. (DeleteAccountPage) | P1 | ✅ 완료 |

### 4.10 다크/라이트 테마 전환 (미구현)

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-120 | 앱은 다크모드와 라이트모드 두 가지 테마를 지원해야 한다. | P2 | 🔲 미구현 |
| FR-121 | 테마 전환은 페이지 새로고침 없이 즉시 UI에 반영되어야 한다. | P2 | 🔲 미구현 |
| FR-122 | 선택한 테마는 `localStorage`에 저장되어 앱 재시작 시 자동 복원되어야 한다. | P2 | 🔲 미구현 |
| FR-123 | 테마 상태는 Zustand `themeStore`에서 전역 관리한다. | P2 | 🔲 미구현 |

### 4.11 전체 매매내역 내보내기 (미구현)

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-130 | 사용자는 자신의 전체 매매내역을 CSV 및 xlsx 파일로 다운로드할 수 있어야 한다. | P2 | ✅ 완료 |
| FR-131 | 내보내기 파일에는 체결일시, 종목, 유형, 가격, 수량, 수수료, 손익, 태그, 메모 등이 포함되어야 한다. | P2 | ✅ 완료 |
| FR-132 | 내보내기는 클라이언트 사이드에서 처리하며, 데이터가 많을 시 로딩 상태를 표시해야 한다. | P2 | ✅ 완료 |

### 4.12 투자 시뮬레이터 (Calculators)

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-140 | **복리 수익률 계산기**: 초기금, 월 적립금, 수익률, 기간을 입력받아 최종 자산을 계산하고 Recharts 차트로 시각화해야 한다. | P2 | ✅ 완료 |
| FR-141 | **배당 수익률 계산기**: 세후 실수령 배당금 산출 및 배당 재투자 시의 복리 자산 성장 시뮬레이션을 제공해야 한다. | P2 | ✅ 완료 |
| FR-142 | **적정 주가 계산기**: EPS, BPS 기반의 PER, PBR, PEG를 산출하고 종합 적정가 대비 괴리율(게이지 바)을 표시해야 한다. | P2 | ✅ 완료 |
| FR-143 | **리스크 비율(R:R) 계산기**: 진입/손절/목표가 기반의 기대 수익 비율을 산출하고, 이에 따른 손익분기 최소 승률 분석을 제공해야 한다. | P2 | ✅ 완료 |
| FR-144 | **보유 종목 연동**: 모든 계산기에서 사용자의 현재 보유 종목 리스트를 불러와 주가, 수량 등의 입력값을 자동 완성할 수 있어야 한다. | P2 | ✅ 완료 |

### 4.13 목표 수익 역산 계산기 (미구현)

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-150 | 목표 월 수익금액을 달성하기 위한 필요 매매 건수와 승률을 역산하여 제공해야 한다. | P2 | 🔲 미구현 |
| FR-151 | 실제 `trades` 데이터에서 평균 수익/손실/승률 통계를 불러오는 기능을 제공해야 한다. | P2 | 🔲 미구현 |

### 4.14 감정 태그 × 수익 상관 분석 (미구현)

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-160 | 감정 태그별로 그룹화된 승률, 평균 PnL, 총 PnL 통계를 차트로 제공해야 한다. | P2 | 🔲 미구현 |
| FR-161 | 분석 결과에 따른 인사이트 메세지(예: 가장 수익이 좋은 감정)를 자동 생성해야 한다. | P2 | 🔲 미구현 |

### 4.15 목표 손익 설정 + 트래킹 (미구현)

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-170 | 사용자는 월별 목표 손익 금액을 설정하고 `goals` 테이블에 저장할 수 있어야 한다. | P2 | 🔲 미구현 |
| FR-171 | 대시보드에서 이달 목표 달성률을 프로그레스 바 형태로 시각화하여 제공해야 한다. | P2 | 🔲 미구현 |

### 4.16 매매 루틴 및 심리 관리 (미구현)

> 서비스 핵심 가치인 '뇌동매매 방지'를 위해 매매 전후의 심리 상태와 계획 준수 여부를 관리하는 기능이다.

| ID | 요구사항 | 우선순위 | 구현 상태 |
|---|---|---|---|
| FR-200 | 사용자는 장 시작 전, 오늘의 매매 계획(관심 종목, 목표가, 손절가, 매매 근거)을 자유 서술 형태로 작성할 수 있어야 한다. | P1 | 🔲 미구현 |
| FR-201 | 사용자는 오늘의 심리 상태(컨디션, 욕심 수위)를 1~5점 척도로 자가 진단할 수 있어야 한다. | P1 | 🔲 미구현 |
| FR-202 | 사용자는 "오늘 반드시 지킬 매매 원칙"을 한 줄로 입력할 수 있어야 한다. | P1 | 🔲 미구현 |
| FR-203 | 사용자는 장 마감 후, 매매 계획 준수 여부(YES/NO)와 이탈 원인을 기록할 수 있어야 한다. | P1 | 🔲 미구현 |
| FR-204 | 사용자는 오늘 발생한 뇌동매매 횟수를 자가 보고하고, 관련 메모를 작성할 수 있어야 한다. | P1 | 🔲 미구현 |
| FR-205 | 시스템은 심리 점수(mood_score)를 시계열 데이터로 저장하여 감정 변화 추이를 제공해야 한다. | P2 | 🔲 미구현 |
| FR-206 | 시스템은 계획 이탈 통계(손절 미이행률, 계획 외 매수 빈도 등)를 분석하여 제공해야 한다. | P2 | 🔲 미구현 |
| FR-207 | 시스템은 심리 점수와 수익률(PnL)의 상관관계를 시각화하여 보고해야 한다. | P2 | 🔲 미구현 |
| FR-208 | 시스템은 시간대별 매매 분포를 분석하여 충동 매매가 집중되는 시간대를 파측해야 한다. | P2 | 🔲 미구현 |
| FR-209 | 시스템은 보유 기간별 성과 분석(단타 vs 스윙)을 제공해야 한다. | P2 | 🔲 미구현 |
| FR-210 | 시스템은 N회 연속 손실 감지 시 "매매 냉각기(Cooling-off)" 경보를 노출해야 한다. | P1 | 🔲 미구현 |
| FR-211 | 시스템은 설정된 시각(기본 08:50)에 Pre-market 루틴 작성 알림을 발송해야 한다. | P2 | 🔲 미구현 |
| FR-212 | 시스템은 설정된 시각(기본 15:35)에 Post-market 루틴 작성 알림을 발송해야 한다. | P2 | 🔲 미구현 |
| FR-213 | 냉각기 경보 시 시스템은 사용자에게 경고 알림을 발송하고 매매 자제를 권고해야 한다. | P1 | 🔲 미구현 |
| FR-214 | 루틴 미작성이 연속 3일 지속될 경우 시스템은 독려 알림을 발송해야 한다. | P2 | 🔲 미구현 |

---

## 4. 비기능 요구사항

### 4.1 성능 (Performance)

| ID | 요구사항 |
|---|---|
| NFR-001 | 매매 내역 목록 조회(최대 1,000건)는 2초 이내에 응답해야 한다. Supabase SDK `.select('*')` 쿼리 기준. |
| NFR-002 | 수익 캘린더 집계(월별)는 3초 이내에 응답해야 한다. 프론트엔드 클라이언트 사이드 필터링 방식으로 처리. |
| NFR-003 | 전략별 분석 집계는 5초 이내에 응답해야 한다. 프론트엔드 클라이언트 사이드 집계 방식으로 처리. |
| NFR-004 | 종목 검색 자동완성 응답은 키 입력 후 **200ms 이내**에 드롭다운이 표시되어야 한다. CSV 로컬 파싱 특성상 네트워크 지연 없이 달성 가능하다. |

### 4.2 보안 (Security)

| ID | 요구사항 |
|---|---|
| NFR-010 | 모든 API 통신은 HTTPS(TLS 1.2 이상)를 사용해야 한다. Supabase 엔드포인트는 기본적으로 HTTPS를 적용한다. |
| NFR-011 | 사용자 비밀번호는 Supabase Auth가 내부적으로 안전하게 해시 처리하며, 개발팀이 평문 비밀번호에 직접 접근할 수 없어야 한다. |
| NFR-012 | 커뮤니티 DB는 이메일·전화번호 등 개인 식별 정보를 직접 저장하지 않아야 한다. |
| NFR-013 | 인증 토큰은 **Supabase Auth JWT** 방식으로 발급되며, Access Token 유효기간은 Supabase 기본 설정(1시간)을 따른다. |
| NFR-014 | 모든 테이블에는 **RLS(Row Level Security)** 정책이 적용되어야 한다. `auth.uid() = user_id::uuid` 조건으로 본인 데이터만 접근 가능하도록 강제해야 한다. 이는 프로젝트 Anon Key 노출 시 발생할 수 있는 데이터 탈취 및 변조 위험을 원천 차단하기 위함이다. |
| NFR-015 | 데이터베이스 컬럼 타입(TEXT)과 인증 식별자(UUID) 간의 불일치로 인한 비교 오류를 방지하기 위해, 모든 RLS 정책 설정 시 명시적 타입 캐스팅(`::uuid`)을 사용하여 무결성을 보장해야 한다. |
| NFR-016 | **웹 접근성(WCAG 2.1 A) 준수**: 모든 입력 폼과 인터랙티브 요소는 명확한 `aria-label` 및 `id-label` 연결을 보장해야 하며, 스크린 리더 사용자를 위한 논리적 탭 순서를 유지해야 한다. |
| NFR-017 | **백엔드 보안 강화 (Helmet)**: 서버 응답 헤더에 Helmet 미들웨어를 적용하여 XSS, Clickjacking 등 일반적인 웹 취약점으로부터 시스템을 보호해야 한다. |

### 4.3 신뢰성 (Reliability)

| ID | 요구사항 |
|---|---|
| NFR-020 | 시스템 가용성은 월 기준 99.0% 이상이어야 한다. |
| NFR-021 | 매매 데이터는 일 1회 이상 자동 백업되어야 하며, 최소 30일 보존해야 한다. |

### 4.4 사용성 (Usability)

| ID | 요구사항 |
|---|---|
| NFR-030 | 매매 1건 입력은 3단계 이내(화면 이동 기준)의 조작으로 완료 가능해야 한다. |
| NFR-031 | **Binance 스타일 고대비 테마**를 지원해야 한다 (Binance Yellow 액센트). |
| NFR-032 | 사용자가 직접 **Light/Dark 모드**를 전환할 수 있는 기능을 제공해야 한다 (themeStore 기반). |
| NFR-033 | 테마 설정은 브라우저의 LocalStorage에 저장되어 재접속 시에도 유지되어야 한다. |

### 4.5 유지보수성 (Maintainability)

| ID | 요구사항 |
|---|---|
| NFR-040 | 커뮤니티 모듈은 메인 서비스와 독립 배포가 가능한 구조로 설계해야 한다. |
| NFR-041 | 분석 집계는 별도 테이블이 아닌 DB View 또는 쿼리 레이어에서 처리해야 한다. |
| NFR-042 | 시스템의 가용성과 유지보수성을 위해 정의되지 않은 모든 API 요청(404)에 대해 서버 로그에 상세 정보를 기록하고, 클라이언트에게 유의미한 JSON 에러 메시지를 반환해야 한다. |

---

## 5. 데이터베이스 설계 요구사항

### 5.1 핵심 테이블 구조

메인 서비스는 4개의 핵심 테이블로 구성된다. 분석·캘린더·통계 데이터는 별도 테이블 없이 trades 및 notes 테이블 집계로 처리한다.

#### 5.1.0 데이터베이스 상세 설계 (SQL DDL)

개발 편의를 위해 핵심 테이블 생성 및 인덱스, RLS 정책용 DDL 코드를 제공한다.

```sql
-- 1. 종목 마스터 (GIN 인덱스 적용)
CREATE TABLE stock_master (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    market VARCHAR(20) NOT NULL
);
CREATE INDEX idx_stock_name_trgm ON stock_master USING gin (name gin_trgm_ops); -- FR-026/5.1.6 대응

-- 2. 매매 기록 테이블 (RLS 정책 포함)
CREATE TABLE trades (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth 연동
    ticker VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('buy', 'sell')) NOT NULL,
    price DECIMAL(18,4) NOT NULL,
    quantity DECIMAL(18,8) NOT NULL,
    pnl DECIMAL(18,4), -- 매도 시 트리거를 통한 PnL 계산 로직 필요
    is_open BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    traded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 계획 매매 및 심리 관리 필드 추가 (v1.9.0)
    target_price     DECIMAL(18,4) NULL, -- 목표가
    stop_loss_price  DECIMAL(18,4) NULL, -- 손절가
    entry_reason     TEXT          NULL, -- 매매 근거
    is_planned       BOOLEAN       DEFAULT FALSE -- 계획 매매 여부
);

-- 3. 일일 매매 루틴 테이블 (v1.9.0 신설)
CREATE TABLE daily_journals (
    id            BIGSERIAL    PRIMARY KEY,
    user_id       UUID         REFERENCES auth.users(id) ON DELETE CASCADE,
    journal_date  DATE         NOT NULL,
    type          VARCHAR(10)  CHECK (type IN ('pre', 'post')) NOT NULL,
    plan_memo     TEXT,           -- 매매 계획 / 복기 메모
    mood_score    SMALLINT,       -- 심리 상태 (1~5)
    today_rule    TEXT,           -- 매매 원칙
    impulse_count SMALLINT,       -- 뇌동매매 횟수
    plan_followed BOOLEAN,        -- 계획 준수 여부
    created_at    TIMESTAMP    DEFAULT NOW(),
    UNIQUE(user_id, journal_date, type)
);

-- 4. 구독 Tier 테이블 (v2.0.0 신규)
CREATE TABLE subscriptions (
    user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tier       TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'premium')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 월별 목표 손익 테이블 (v2.0.0 신규)
CREATE TABLE goals (
    id           BIGSERIAL PRIMARY KEY,
    user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_month VARCHAR(7)    NOT NULL,  -- 'YYYY-MM'
    target_pnl   DECIMAL(18,4) NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, target_month)
);

-- DB Function: 현재 사용자 Tier 반환
CREATE OR REPLACE FUNCTION get_user_tier(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT tier INTO result FROM subscriptions
    WHERE user_id = user_uuid AND (expires_at IS NULL OR expires_at > NOW());
    RETURN COALESCE(result, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS 설정: 본인의 데이터만 조회/수정 가능 (타입 캐스팅 이슈 반영)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own trades" ON trades 
    FOR ALL USING (auth.uid() = (user_id)::uuid);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON public.users 
    FOR ALL USING (auth.uid() = (id)::uuid);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notes" ON notes 
    FOR ALL USING (EXISTS (SELECT 1 FROM trades WHERE trades.id = notes.trade_id AND (trades.user_id)::uuid = auth.uid()));

ALTER TABLE stock_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can search stocks" ON stock_master 
    FOR SELECT TO authenticated USING (true);
```

#### 5.1.1 users

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 사용자 고유 식별자 (커뮤니티 연결 키) |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 이메일 |
| nickname | VARCHAR(50) | NOT NULL | 표시 닉네임 |
| public_profile_enabled | BOOLEAN | DEFAULT FALSE | 커뮤니티 참여 동의 여부 |
| community_joined_at | TIMESTAMP | NULL | 커뮤니티 최초 가입 시점 |
| created_at | TIMESTAMP | DEFAULT NOW() | 계정 생성일시 |

#### 5.1.2 (삭제됨) accounts
*계좌 테이블 비활성화 처리됨 (2026-04-09)*

#### 5.1.3 trades ★ 핵심 테이블

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 매매 고유 ID |
| user_id | UUID | FK → users.id | 등록 유저 식별자 |
| ticker | VARCHAR(20) | NOT NULL | 종목 코드 |
| name | VARCHAR(100) | NOT NULL | 종목명 |
| type | ENUM | buy / sell, NOT NULL | 매수/매도 구분 |
| price | DECIMAL(18,4) | NOT NULL | 체결가 |
| quantity | DECIMAL(18,8) | NOT NULL | 체결 수량 |
| fee | DECIMAL(18,4) | DEFAULT 0 | 수수료 |
| pnl | DECIMAL(18,4) | NULL | 손익 (매도 시 자동 계산, 매수는 NULL) |
| traded_at | TIMESTAMP | NOT NULL | 체결 일시 |
| strategy_tag | VARCHAR(100) | NULL | 전략 태그 |
| emotion_tag | VARCHAR(100) | NULL | 감정 태그 |
| memo | TEXT | NULL | 자유 메모 (최대 1,000자) |
| is_open | BOOLEAN | DEFAULT TRUE | 보유 중 여부 |
| is_public | BOOLEAN | DEFAULT FALSE | 커뮤니티 공개 여부 |
| target_price | DECIMAL(18,4) | NULL | 목표가 |
| stop_loss_price | DECIMAL(18,4) | NULL | 손절가 |
| entry_reason | TEXT | NULL | 매매 근거 |
| is_planned | BOOLEAN | DEFAULT FALSE | 계획 매매 여부 |

#### 5.1.4 notes (오답 노트)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 노트 고유 ID |
| trade_id | BIGINT | FK → trades.id, UNIQUE | 연결 매매 건 (1:1) |
| mistake_type | VARCHAR(100) | NULL | 실수 유형 |
| content | TEXT | NULL | 복기 내용 |
| created_at | TIMESTAMP | DEFAULT NOW() | 작성일시 |

#### 5.1.5 tags (사용자 정의 태그)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 태그 고유 ID |
| user_id | UUID | FK → users.id | 태그 소유 사용자 |
| name | VARCHAR(50) | NOT NULL | 태그명 |
| type | VARCHAR(20) | strategy / emotion | 태그 유형 |

#### 5.1.7 daily_journals (일일 매매 루틴 - 미구현)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | BIGSERIAL | PK | 저널 ID |
| user_id | UUID | FK -> users.id | 사용자 ID |
| journal_date | DATE | NOT NULL | 활동 날짜 |
| type | VARCHAR(10) | CHECK (pre/post) | 장 전/후 구분 |
| plan_memo | TEXT | NULL | 매매 계획/복기 메모 |
| mood_score | SMALLINT | 1~5 | 심리 점수 |
| today_rule | TEXT | NULL | 오늘의 원칙 |
| impulse_count | SMALLINT | DEFAULT 0 | 뇌동매매 횟수 |
| plan_followed | BOOLEAN | NULL | 계획 준수 여부 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성 시각 |

#### 5.1.8 subscriptions (구독 Tier 관리 - 미구현)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| user_id | UUID | PK, FK -> auth.users.id | 사용자 고유 ID |
| tier | TEXT | free / basic / premium | 구독 등급 |
| expires_at | TIMESTAMPTZ | NULL 허용 | 만료 시각 (NULL 시 무제한) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 최초 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 마지막 수정일시 |

#### 5.1.9 goals (월별 목표 관리 - 미구현)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | BIGSERIAL | PK | 목표 고유 ID |
| user_id | UUID | FK -> auth.users.id | 사용자 ID |
| target_month | VARCHAR(7) | YYYY-MM, UNIQUE | 대상 월 |
| target_pnl | DECIMAL(18,4) | NOT NULL | 목표 손익 금액 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |
| name | VARCHAR(50) | NOT NULL | 태그명 |
| type | ENUM | strategy / emotion, NOT NULL | 태그 유형 |

#### 5.1.6 stock_master (종목 마스터 DB)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | 고유 식별자 |
| ticker | VARCHAR(20) | NOT NULL, UNIQUE | 종목 코드 (KRX는 6자리 0패딩) |
| name | VARCHAR(100) | NOT NULL | 종목명 |
| market | VARCHAR(20) | NOT NULL | 시장 구분 (KOSPI 등) |

#### 5.1.7 daily_journals (일일 매매 루틴)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 저널 고유 ID |
| user_id | UUID | FK → users.id | 등록 유저 식별자 |
| journal_date | DATE | NOT NULL | 대상 날짜 |
| type | VARCHAR(10) | pre / post | 장 전/후 구분 |
| plan_memo | TEXT | NULL | 매매 계획 또는 복기 서술 |
| mood_score | SMALLINT | CHECK (1~5) | 심리 상태 자가 진단 |
| today_rule | TEXT | NULL | 오늘의 매매 원칙 |
| impulse_count| SMALLINT | DEFAULT 0 | 뇌동매매 횟수 |
| plan_followed| BOOLEAN | NULL | 계획 준수 여부 |
| created_at | TIMESTAMP | DEFAULT NOW() | 작성일시 |

> **검색 인덱스 구조**: 초고속 검색 자동완성을 위해 `ticker`에는 UNIQUE(B-Tree) 인덱스를, `name` 컬럼에는 `pg_trgm` 모듈 기반의 **GIN 인덱스(`gin_trgm_ops`)**를 부여하여 ILIKE 부분 일치 검색 처리 속도를 보장한다.

### 5.2 보안 및 RLS(Row Level Security) 정책

Supabase의 핵심 보안 모델로서 RLS 정책을 명시한다.
- 모든 테이블은 `auth.uid() = user_id` 정책을 적용하여 본인의 데이터만 접근 가능하도록 제한한다.

### 5.3 커뮤니티 DB 분리 원칙

| 원칙 | 상세 내용 |
|---|---|
| 단일 연결 키 | community_profiles 테이블은 user_id(UUID)만 저장하며, 개인정보는 직접 저장하지 않는다. |
| FK 제약 없음 | posts.trade_id는 외래 키 제약 없이 참조 전용으로 저장한다. 메인 DB 삭제에 독립적으로 운영된다. |
| 공개 여부 제어 | is_public = FALSE인 trades는 커뮤니티 서비스가 API 호출로도 접근할 수 없어야 한다. |
| 단방향 의존성 | 커뮤니티 서비스는 메인 서비스에 의존하나, 메인 서비스는 커뮤니티 서비스를 참조하지 않는다. |

---

## 6. 외부 인터페이스 요구사항

### 6.1 사용자 인터페이스 (User Interface)

- 매매 기록 입력 폼(**TradeModal**)은 필수 항목(종목코드, 유형, 가격, 수량, 일시)과 선택 항목(태그, 메모)을 구분하여 표시해야 한다.
- 수익 캘린더(**CalendarPage**)는 월 단위 달력 뷰를 기본으로 제공하며, 날짜별 PnL 색상 코딩을 적용해야 한다.
- 대시보드의 수익금 추이 차트는 **AreaChart(recharts)**를 기본으로 사용한다.
- PC 환경: 사이드 **NavBar** 컴포넌트를 표시하고, 모바일 환경: 하단 **BottomNav** 컴포넌트를 표시한다. 전환 기준은 `layoutStore.isMobileMode` 에서 관리한다.
- 페이지별 라우팅: `/dashboard`, `/calendar`, `/history`, `/holdings`, `/analysis` 5개 주요 라우트를 제공한다.
- 인증 라우팅: `/login`, `/register`, `/reset-password` 를 제공하며, **AuthLayout**이 인증 상태에 따라 자동 리다이렉트를 처리한다.

### 6.2 API 인터페이스 (API Interface)

현재 구현에서 프론트엔드는 **Supabase JS SDK**를 통해 직접 데이터베이스에 접근한다. 중간 백엔드 REST API 레이어는 운영되지 않는다.

#### 프론트엔드 → Supabase SDK 주요 인터페이스

| 작업 | SDK 호출 | 테이블 |
|---|---|---|
| 세션 조회 | `supabase.auth.getSession()` | auth.users |
| 인증 상태 구독 | `supabase.auth.onAuthStateChange()` | auth.users |
| 매매 목록 조회 | `supabase.from('trades').select('*').order('traded_at', { ascending: false })` | trades |
| 매매 기록 저장 | `supabase.from('trades').insert({...})` | trades |

#### 커뮤니티 서비스 전용 REST API (향후 구현)

| 메서드 | 엔드포인트 | 설명 | 인증 |
|---|---|---|
| GET | /api/users/{uuid}/public-profile | 공개 프로필 정보 반환 | Service Token |
| GET | /api/trades/{trade_id}/public | is_public=TRUE인 매매 요약 반환 | Service Token |

### 6.3 하드웨어 인터페이스 (Hardware Interface)

- 모바일: iOS 15+ / Android 10+ 기기의 화면 해상도에 반응형으로 적응해야 한다.
- 웹: 최소 해상도 1280×720 이상의 데스크톱 브라우저를 지원해야 한다.

### 6.4 소프트웨어 인터페이스 (Software Interface)

- **데이터베이스**: Supabase (PostgreSQL 15+)
- **인증**: Supabase Auth — JWT 기반, `onAuthStateChange` 이벤트로 세션 동기화
- **프론트엔드 SDK**: `@supabase/supabase-js` (브라우저 클라이언트)
- **상태 관리**: Zustand (`authStore`, `tradeStore`, `layoutStore`)
- **차트**: recharts (`AreaChart`, `XAxis`, `YAxis`, `Tooltip`)
- **라우팅**: React Router v6 (`BrowserRouter`, `Routes`, `Route`, `Outlet`)
- **날짜 처리**: date-fns (`format`, `subDays`, `addDays`)
- **배포**: Vercel (프론트엔드), Supabase (DB + Auth)

---

## 7. 부록

### 7.1 요구사항 추적 매트릭스 (Requirements Traceability Matrix)

| 요구사항 ID | 기능 모듈 | 테이블/컴포넌트 | 우선순위 |
|---|---|---|---|
| FR-001~004 | 사용자 계정 | users | P1/P2 |
| FR-020~025 | 매매 기록 | trades | P1/P2 |
| FR-030~032 | 대시보드 | trades (집계) | P1 |
| FR-040~042 | 수익 캘린더 | trades (집계) | P1 |
| FR-050~053 | 매매 히스토리 | trades + tags | P1 |
| FR-060~063 | 매매 복기/분석 | trades + notes + tags | P2 |
| FR-070~072 | 태그 관리 | tags | P1/P2 |
| FR-085 | 사용자 탈퇴 | DeleteAccountPage | 공통 | P1 |
| **FR-110~114** | **구독 Tier 관리** | **subscriptions, TierGate** | **공통** | **P1** |
| **FR-120~123** | **다크/라이트 테마** | **themeStore, CSS 변수** | **Free 이상** | **P2** |
| **FR-130~132** | **매매내역 내보내기** | **trades, xlsx 라이브러리** | **Basic 이상** | **P2** |
| **FR-140~141** | **손익분기점 계산기** | **CalculatorView (클라이언트)** | **Premium** | **P2** |
| **FR-150~151** | **목표 수익 역산 계산기** | **CalculatorView (클라이언트)** | **Premium** | **P2** |
| **FR-160~161** | **감정 × 수익 상관 분석** | **trades, recharts BarChart** | **Premium** | **P2** |
| **FR-170~171** | **목표 손익 설정+트래킹** | **goals, Dashboard 카드** | **Premium** | **P2** |
| **FR-200~214** | **매매 루틴 및 심리 관리** | **daily_journals, Pre/PostJournalPage** | **공통** | **P1/P2** |

### 7.2 우선순위 정의

| 구분 | 정의 |
|---|---|
| P1 (MVP) | 초기 출시에 필수. 해당 기능 없이 서비스 불가. |
| P2 | 출시 직후 1~2개월 내 구현. 핵심 사용자 경험 향상. |
| P3 | 중장기 로드맵. MVP와 독립적으로 구현 및 배포 가능. |

### 7.3 미결 사항 (Open Issues)

| # | 내용 | 담당 | 목표 해결일 |
|---|---|---|---|
| OI-001 | 전략 태그를 trades에 VARCHAR로 직접 저장할지, tags 테이블 FK로 정규화할지 결정 필요 | — | TBD |
| OI-002 | 커뮤니티 서비스의 별도 SRS 작성 및 DB 스키마 확정 | — | TBD |
| OI-003 | 외부 증권사 API 자동 연동 기능의 로드맵 검토 | — | TBD |
| OI-004 | 루틴 페이지 진입점 결정: 독립 페이지 vs 대시보드 인라인 카드 | 전용 페이지 우선 구현 후 검토 | TBD |
| OI-005 | 자가 보고 데이터의 신뢰성 보정 및 입력 유도 방안 검토 | — | TBD |
| OI-006 | 냉각기 경보 시 기록 하드 블로킹 여부 결정 (현재 소프트 경고) | — | TBD |
| OI-007 | Expo Notifications 웹 호환성 및 Web Push 도입 기술 검토 | — | TBD |
