# 소프트웨어 설계 명세서
**Software Design Description**

| 항목 | 내용 |
|---|---|
| 제품명 | 매매일지 앱 (개미의 집) |
| 문서 버전 | 2.2.0 |
| 적용 표준 | IEEE 1016-2009 |
| 작성일 | 2026-04-08 |
| 최종 수정일 | 2026-04-16 |
| 문서 상태 | 진행 중 (In Progress) |
| 적용 범위 | 매매일지 앱 전체 시스템 (MVP + Premium Tier 범위) |
| 참조 SRS | SRS_매매일지앱_v2.4 (IEEE 830-1998) |
| 설계 언어 | UML 2.x (텍스트 표현), SQL DDL, Supabase SDK |

---

## 개정 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|---|---|---|---|
| 1.0.0 | 2026-04-08 | — | 최초 작성 — IEEE 1016-2009 기반 초안 |
| 1.1.0 | 2026-04-09 | — | 계좌 개념 제거 및 유저 중심의 매매 구조로 설계 변경 |
| 1.2.0 | 2026-04-10 | — | 종목 검색 자동완성, 매매 유형(Buy/Sell) 동적 태그 지원, 매매 복기 대시보드 리팩토링 및 오답노트 작성·연동 API 설계 반영 |
| 1.3.0 | 2026-04-11 | — | DB 기반 빠른 종목 검색을 위해 pg_trgm GIN 인덱스를 적용한 `stock_master` 개체 추가 및 프론트엔드 모바일 UI 통합 반영 |
| 1.4.0 | 2026-04-11 | — | 종목 검색 자동완성을 백엔드 DB 통신에서 프론트엔드 내장 CSV 로컬 파싱 방식으로 롤백 (네트워크 지연/연결 실패 대응) |
| 1.5.0 | 2026-04-15 | — | 종목 검색 드롭다운 UI 입력 필드별 가독성 최적화 로직 적용 및 백엔드 404 Catch-all 예외 처리 아키텍처 반영 |
| 1.6.0 | 2026-04-15 | — | 인프라 구조를 Supabase 단독으로 변경, DDL 및 RLS 정책 추가 |
| 1.7.0 | 2026-04-15 | — | **아키텍처 확정**: Express 백엔드 제거 및 Supabase SDK 직접 통신 방식으로 전환. 프론트엔드 컴포넌트/페이지/스토어 구조 전면 반영. 비즈니스 로직(PnL, is_open) 위치를 Zustand tradeStore로 명시. UC 흐름 및 인터페이스 명세 SDK 기준으로 재작성. HoldingsPage, ErrorBoundary, IsometricTown 신규 컴포넌트 추가. |
| 1.8.0 | 2026-04-16 | — | **심리 관리 및 매매 루틴 설계 반영**: daily_journals 테이블 및 분석용 View 설계 추가, PreJournalPage/PostJournalPage 페이지 구조 설계, 장 전/후 루틴 Supabase SDK 인터페이스 명세 추가 및 관련 설계 결정(DD-009) 반영 (구현 상태: 미구현) |
| 1.9.0 | 2026-04-16 | — | **구독 Tier 기반 접근 제어 및 Premium 기능 설계 반영**: subscriptions·goals 테이블 DDL, get_user_tier 함수, tierStore·themeStore 설계 및 TierGate 컴포넌트 구조 추가 (미구현 상태) |
| 1.10.0 | 2026-04-16 | — | **데이터베이스 보안 강화 반영**: Supabase RLS 전수 적용, TEXT/UUID 타입 캐스팅 이슈(`::uuid`) 해결을 위한 정책 고도화 명세 추가 |
| 2.0.0 | 2026-04-16 | — | **고급 매매 도구 및 정합성 로직 반영**: 손익분기점(BEP) 계산기, CSV 내보내기, KST 시간대 처리(DD-012), 공매도 방지 정책(BR-003, DD-013), 단순 차익 계산(BR-001, DD-014), 동적 태그 관리(tagStore) 설계 추가 및 구현 완료 상태 업데이트 |
| 2.1.0 | 2026-04-16 | — | **전체 설계 구현 완료 및 배포 반영**: CalculatorPage, tagStore, exportUtils 실제 구현 상세 반영 및 Vercel 배포 완료 |
| 2.2.0 | 2026-04-16 | — | **설계 개편 및 롤백**: 손익분기점(BEP) 제거 및 물타기 시뮬레이터 단일화, 고정 태그 시스템(매수/매도 분리)으로의 롤백 설계 반영 |
| 2.3.0 | 2026-04-16 | — | **롤백 및 안정화**: Apple 디자인 설계 철회 및 이전 인디고 테마 복구 설계 반영 |
| 2.4.0 | 2026-04-16 | — | **Binance 디자인 시스템 및 다크 모드 통합 설계**: Binance Yellow 포인트 테마, themeStore 기반 가변 테마 전환 아키텍처 반영 |
| 2.5.0 | 2026-04-16 | — | **보안 및 접근성 설계 강화**: Backend Helmet 미들웨어 도입 설계, WCAG 2.1 A 기반 폼 접근성(Gold Standard) 설계 및 aria-label 명세 추가 |
| 2.6.0 | 2026-04-16 | — | **UI 설계 고도화**: 매매 내역 그리드 시스템 설계, 라이트 모드 가독성(WCAG AA 준수)을 위한 색상 변수 보강, 모바일 풀스크린 반응형 레이아웃 설계 반영 |
| 2.7.0 | 2026-04-17 | — | **신규 투자 시뮬레이터 4종 설계 반영**: 탭 전환 방식의 시뮬레이터 구성, 보유 종목 연동 인터페이스 및 클라이언트 사이드 시뮬레이션 엔진 설계 추가 |
| 2.8.0 | 2026-04-18 | — | **디자인 시스템 전면 개편 및 가독성 설계 고도화**: Indigo/Blue 프라이머리 컬러 시스템 도입, 심리스 카드 레이아웃 고도화, TradeModal 모바일 반응형 1열 그리드 설계 반영 |
| 2.9.0 | 2026-04-18 | — | **디자인 컨텍스트 수립 및 동기화**: .impeccable.md 기반 디자인 원칙(Smart, Secure, Serene) 정립 및 전체 UI/UX 전수 점검·배포 완료 |
| 2.9.1 | 2026-04-18 | — | **레이아웃 정합성 패치**: 대시보드 카드 겹침 해결, CSS 변수 맵핑 오류 수정을 통한 버튼 시인성 복구 및 여백 체계 최적화 |

---

## 목차

1. [소개](#1-소개)
2. [설계 이해관계자 및 관심사](#2-설계-이해관계자-및-관심사)
3. [설계 관점 개요](#3-설계-관점-개요)
4. [맥락 설계 관점 (Context Viewpoint)](#4-맥락-설계-관점-context-viewpoint)
5. [구성 설계 관점 (Composition Viewpoint)](#5-구성-설계-관점-composition-viewpoint)
6. [논리 설계 관점 (Logical Viewpoint)](#6-논리-설계-관점-logical-viewpoint)
7. [데이터 설계 관점 (Data Viewpoint)](#7-데이터-설계-관점-data-viewpoint)
8. [인터페이스 설계 관점 (Interface Viewpoint)](#8-인터페이스-설계-관점-인터페이스-viewpoint)
9. [설계 결정 및 근거](#9-설계-결정-및-근거)
10. [부록](#10-부록)

---

## 1. 소개

### 1.1 목적 (Purpose)

본 문서는 매매일지 앱 "개미의 집"에 대한 소프트웨어 설계 명세서(SDD)로서 IEEE 1016-2009 표준을 준수한다. SDD는 SRS(IEEE 830-1998)에서 정의된 기능·비기능 요구사항을 실현하기 위한 구체적인 설계 결정, 아키텍처 구조, 데이터베이스 스키마, 인터페이스 명세를 기술한다. 본 문서의 독자는 개발팀(백엔드·프론트엔드·DBA), 아키텍트, 품질보증 담당자이다.

### 1.2 범위 (Scope)

본 SDD는 MVP 범위에 해당하는 다섯 가지 설계 관점(Viewpoint)을 다룬다.

- 맥락 설계 관점 (Context Viewpoint) — 시스템 외부 경계 및 이해관계자 상호작용
- 구성 설계 관점 (Composition Viewpoint) — 서비스·컴포넌트 분해 구조
- 논리 설계 관점 (Logical Viewpoint) — 도메인 모델 및 클래스 관계
- 데이터 설계 관점 (Data Viewpoint) — DB 스키마 및 커뮤니티 분리 전략
- 인터페이스 설계 관점 (Interface Viewpoint) — REST API 명세

### 1.3 정의 및 약어 (Definitions and Abbreviations)

| 용어/약어 | 정의 |
|---|---|
| SDD | Software Design Description — 소프트웨어 설계 명세서 |
| SRS | Software Requirements Specification — 소프트웨어 요구사항 명세서 |
| Viewpoint | IEEE 1016-2009에서 정의하는 설계 관점. 특정 이해관계자 관심사를 다루는 설계 기술 집합 |
| Design View | 특정 Viewpoint에서 바라본 시스템의 설계 표현 |
| PnL | Profit and Loss — 손익 |
| UUID | Universally Unique Identifier — 범용 고유 식별자 (커뮤니티 연결 키로 사용) |
| Loose Coupling | 커뮤니티 DB가 메인 DB의 FK 제약 없이 UUID/정수 참조만 유지하는 설계 원칙 |
| JWT | JSON Web Token — 인증 토큰 형식 |
| DDD | Domain-Driven Design — 도메인 주도 설계 |
| REST | Representational State Transfer — API 설계 스타일 |

### 1.4 참조 문서 (References)

- IEEE 1016-2009, IEEE Standard for Information Technology — Systems Design — Software Design Descriptions
- IEEE 830-1998, IEEE Recommended Practice for Software Requirements Specifications
- SRS_매매일지앱_v1.0.md — 본 SDD의 상위 요구사항 문서
- 내부 설계 협의록: DB 구조 단순화 설계안, 커뮤니티 분리 전략 v1.0

---

## 2. 설계 이해관계자 및 관심사

IEEE 1016-2009는 이해관계자(Stakeholder)와 그들의 관심사(Concern)를 명시하도록 요구한다. 각 관심사는 해당 설계 관점(Viewpoint)에서 해소된다.

| 이해관계자 | 역할 | 주요 관심사 | 해소 관점 |
|---|---|---|---|
| 개발팀 (백엔드) | 서버·DB 구현 | 컴포넌트 책임 분리, API 계약, DB 스키마 | 구성·논리·데이터·인터페이스 |
| 개발팀 (프론트엔드) | UI 구현 | API 응답 구조, 상태 관리, 화면 전환 흐름 | 인터페이스·구성 |
| DBA | DB 설계·운영 | 정규화 수준, 인덱스 전략, 커뮤니티 분리 | 데이터 |
| 기획자 | 요구사항 정의 | 기능 커버리지, 우선순위 반영 여부 | 맥락·구성 |
| 품질보증(QA) | 테스트 계획 | 모듈 경계, 테스트 가능성, 의존성 방향 | 구성·논리 |
| 운영자 | 배포·모니터링 | 서비스 독립 배포, 장애 격리 (커뮤니티 분리) | 맥락·구성 |

---

## 3. 설계 관점 개요

본 SDD는 IEEE 1016-2009 Section 5에 정의된 설계 관점 유형 중 아래 다섯 가지를 적용한다.

| 절 | 설계 관점 | 설계 언어 / 표기법 | 주요 산출물 |
|---|---|---|---|
| 4절 | Context Viewpoint | 다이어그램 (텍스트 표현), 산문 | 시스템 맥락도, 이해관계자 상호작용 |
| 5절 | Composition Viewpoint | 계층형 컴포넌트 다이어그램 (텍스트) | 서비스·레이어 분해도, 모듈 책임표 |
| 6절 | Logical Viewpoint | 도메인 클래스 모델, 시퀀스 흐름 | 클래스 관계, 핵심 유스케이스 흐름 |
| 7절 | Data Viewpoint | ERD (텍스트), SQL DDL | DB 스키마, 인덱스, 커뮤니티 분리 |
| 8절 | Interface Viewpoint | REST API 명세 (OpenAPI 스타일) | API 엔드포인트, 요청/응답 구조 |

---

## 4. 맥락 설계 관점 (Context Viewpoint)

| 항목 | 내용 |
|---|---|
| 관점 명칭 | Context Viewpoint |
| 설계 언어 | 산문 + 텍스트 맥락도 |
| 관심사 | 시스템 경계, 외부 행위자, 시스템 간 데이터 흐름 |
| 이해관계자 | 기획자, 운영자, 개발팀 전체 |

### 4.1 시스템 경계 및 외부 행위자

매매일지 앱은 **프론트엔드(Vercel)** + **Supabase(DB + Auth)** 의 2-티어 서버리스 구조로 운영된다. 별도의 중간 백엔드 서버는 존재하지 않으며, 프론트엔드가 Supabase SDK를 통해 DB에 직접 접근한다. 커뮤니티 서비스는 미래 확장을 위한 분리 모듈로 설계된다.

| 외부 행위자 | 유형 | 상호작용 방향 | 데이터/프로토콜 |
|---|---|---|---|
| 개인 투자자 (사용자) | 인간 행위자 | 양방향 | HTTPS / JSON |
| 웹 브라우저 (Vercel SPA) | 시스템 | → Supabase | Supabase JS SDK over HTTPS |
| Supabase Auth | 외부 시스템 | ↔ 브라우저 | JWT 기반 세션 관리 |
| Supabase PostgreSQL | 외부 시스템 | ↔ 브라우저 | RLS 정책 적용 CRUD |
| 이메일 서비스 (Supabase SMTP) | 외부 시스템 | ← Supabase Auth | SMTP — 이메일 인증/비밀번호 재설정 |
| 보안 미들웨어 (Helmet) | 내부 계층 | → 응답 헤더 | HTTP 보안 헤더(XSS, CSP, HSTS 등) 자동 설정 |
| 커뮤니티 서비스 (미래 확장) | 외부 시스템 | → 메인 API | Service Token 인증 REST API (읽기 전용) |

### 4.2 시스템 맥락도 (System Context Diagram)

```
┌──────────────────────────────────────────────────────────────┐
│                        외부 행위자                            │
│   [사용자]                                [Supabase SMTP]   │
│      │ HTTPS                                    │            │
└──────┼──────────────────────────────────────────┼────────────┘
       │                                           │
  ┌────▼──────────────────────────────────────────▼──────────┐
  │           React SPA (Vercel 배포)                         │
  │                                                           │
  │  ┌─────────────────────────────────────────────────────┐  │
  │  │                  Zustand Store Layer                │  │
  │  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐  │  │
  │  │  │  authStore  │ │ tradeStore  │ │ layoutStore  │  │  │
  │  │  │ (세션 관리) │ │(매매/PnL)   │ │(PC/모바일)   │  │  │
  │  │  └─────────────┘ └─────────────┘ └──────────────┘  │  │
  │  └─────────────────────────────────────────────────────┘  │
  │                          │ Supabase JS SDK                 │
  └──────────────────────────┼────────────────────────────────┘
                             │ HTTPS
  ┌──────────────────────────▼────────────────────────────────┐
  │                  Supabase Platform                        │
  │  ┌─────────────────┐          ┌──────────────────────┐   │
  │  │  Supabase Auth  │          │  PostgreSQL DB       │   │
  │  │  (JWT 발급)     │◀────────▶│  (trades, notes,     │   │
  │  │  (이메일 인증)  │          │   tags, stock_master)│   │
  │  └─────────────────┘          │  + RLS 정책 적용     │   │
  │                               └──────────────────────┘   │
  └───────────────────────────────────────────────────────────┘
                             │ Service Token REST (미래)
  ┌──────────────────────────▼────────────────────────────────┐
  │          커뮤니티 서비스 (Community Service) — 미구현     │
  │          ┌──────────────────────────────────┐             │
  │          │  커뮤니티 DB (독립 인스턴스)     │             │
  │          └──────────────────────────────────┘             │
  └───────────────────────────────────────────────────────────┘
```

> **설계 확정 사항**: Node.js Express 백엔드 서버는 초기 설계에 존재했으나 Supabase SDK 직접 통신 방식으로 완전 전환되었다. `backend/` 디렉터리 내 코드는 향후 Edge Function 또는 커뮤니티 서비스 게이트웨이 참조용으로만 보존된다.

### 4.3 커뮤니티 서비스 분리 원칙

| 원칙 | 구현 방식 |
|---|---|
| 단방향 의존 | 커뮤니티 → 메인(API 호출). 메인은 커뮤니티를 호출하지 않는다. |
| DB 비공유 | 각 서비스는 독립 DB 인스턴스를 보유한다. |
| 개인정보 격리 | 커뮤니티 DB는 이메일·전화번호 등 PII를 저장하지 않고 UUID만 참조한다. |
| FK 미설정 | 커뮤니티 DB의 trade_id는 FK 제약 없이 정수값만 저장하여 메인 DB 삭제에 독립적으로 운영된다. |
| 공개 제어권 | 메인 서비스의 is_public = FALSE 거래는 커뮤니티 API 응답에서 제외된다. |

---

## 5. 구성 설계 관점 (Composition Viewpoint)

| 항목 | 내용 |
|---|---|
| 관점 명칭 | Composition Viewpoint |
| 설계 언어 | 계층형 컴포넌트 기술 (텍스트 표현) |
| 관심사 | 서비스·레이어 분해, 모듈 책임, 의존 방향 |
| 이해관계자 | 프론트엔드 개발팀, QA |

### 5.1 전체 레이어 구조

현재 구현은 별도 백엔드 없이 **프론트엔드 단일 계층** + **Supabase 플랫폼** 구조로 운영된다. 프론트엔드 내부는 책임에 따라 Pages / Components / Store / API 레이어로 분리된다.

```
┌──────────────────────────────────────────────────────────────┐
│  Pages Layer  (라우팅 단위 화면)                              │
│  ● DashboardPage, CalendarPage, HistoryPage, HoldingsPage    │
│  ● AnalysisPage, LoginPage, RegisterPage, ResetPasswordPage   │
├──────────────────────────────────────────────────────────────┤
│  Components Layer  (재사용 UI 컴포넌트)                       │
│  ● TradeModal, NavBar, BottomNav, ErrorBoundary, TierGate    │
│  ● MetricCard, TagChip, NoteModal, IsometricTown             │
│  ● DesktopHistoryView (7-Column Grid Layout), MobileHistoryView  │
├──────────────────────────────────────────────────────────────┤
│  Store Layer  (Zustand 전역 상태 + 비즈니스 로직)             │
│   ├── authStore        (인증 세션 관리)
│   ├── tradeStore       (매매/PnL 로직)
│   ├── layoutStore      (반응형 레이아웃 관리)
│   ├── analysisStore    (태그별 집계 로직)
│   ├── tagStore         (동적 태그 CRUD 및 최대 10개 제한 로직)
│   ├── tierStore        (구독 등급 및 기능 권한 제어)
│   └── themeStore       (다크/라이트 테마 관리)
├──────────────────────────────────────────────────────────────┤
│  API Layer  (Supabase SDK 래퍼)                              │
│  ● supabase.ts — createClient 초기화 및 export               │
└──────────────────────────────────────────────────────────────┘
                          │ Supabase JS SDK
┌──────────────────────────────────────────────────────────────┐
│  Supabase Platform                                           │
│  ● Auth (JWT 발급, 이메일 인증)                              │
│  ● PostgreSQL DB (trades, notes, tags, stock_master)         │
│  ● RLS 정책 (auth.uid() = user_id 자동 적용)                 │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 프론트엔드 컴포넌트 분해

#### 5.2.1 Pages (라우팅 단위 화면)

| 컴포넌트 | 경로 | 책임 | 주요 의존 |
|---|---|---|---|
| DashboardPage | /dashboard | 누적 PnL MetricCard 3개, 7일 AreaChart, AnalysisPage 임베딩 | tradeStore, recharts, AnalysisPage |
| CalendarPage | /calendar | 월별 PnL 캘린더, 날짜 클릭 시 매매 목록 표시, 월간 요약 4카드 | tradeStore |
| HistoryPage | /history | PC/모바일 뷰 분기, 전체 매매 역시간순 목록 | tradeStore, DesktopHistoryView, MobileHistoryView |
| HoldingsPage | /holdings | is_open=TRUE 종목 목록, 보유 비중 계산 | tradeStore |
| AnalysisPage | /analysis | 전략/감정 태그별 승률·손익 집계, 오답노트 | tradeStore |
| LoginPage | /login | 이메일 로그인, Supabase Auth 연동 | supabase.auth |
| RegisterPage | /register | 회원가입, 이메일 인증 발송 | supabase.auth |
| ResetPasswordPage | /reset-password | 비밀번호 재설정 | supabase.auth |
| PreJournalPage (미구현) | /journal/pre | 장 전 매매 계획 및 심리 상태 입력 | tradeStore, daily_journals |
| PostJournalPage (미구현) | /journal/post | 장 후 매매 복기 및 뇌동매매 자가 보고 | tradeStore, daily_journals |
| CalculatorPage | /calculator | 투자 시뮬레이터 4종 (복리, 배당, 적정주가, 리스크 비율) 통합 탭 뷰 | ✅ 완료 |
| GoalSettingPage (미구현) | /goals | 월별 목표 손익 설정 및 현황 | goals |

#### 5.2.2 Components (재사용 UI)

| 컴포넌트 | 책임 | 주요 의존 |
|---|---|---|
| TradeModal | 매매 기록 입력 모달 (매수/매도, 종목 자동완성, 태그) | tradeStore, all_stock_master.csv |
| CompoundCalculator | 초기 투자금 및 월 적립금 기반 연복리 시뮬레이션 및 차트 시각화 | recharts |
| DividendCalculator | 세후 배당 성과 및 재투자 복리 효과 시뮬레이션 | useHoldingsSelector |
| ValuationCalculator | PER/PBR/PEG 기반 적정 주가 산출 및 괴리율 게이지 시각화 | useHoldingsSelector |
| RiskRewardCalculator | 진입/손절/목표가 기반 R:R 비율 및 손익분기 승률 분석 | useHoldingsSelector |
| NavBar | PC용 사이드 네비게이션 바, 로그아웃 | authStore, layoutStore |
| BottomNav | 모바일용 하단 탭 네비게이션, 로그아웃 | authStore, layoutStore |
| ErrorBoundary | 런타임 오류 캐치, 폴백 UI 표시 | React.Component |
| TierGate | 구독 등급에 따른 기능 접근 제어 (Premium 기능 보호) | tierStore |
| MetricCard | 단일 지표 카드 (제목, 값, 추이) | - |
| TagChip | 태그 선택 칩 버튼 UI | - |
| NoteModal | 오답 노트 작성/수정 모달 | supabase (notes 테이블) |
| IsometricTown | 매매 저장 횟수 기반 아이소메트릭 타운 시각화 | tradeStore |
| DesktopHistoryView | 매매 히스토리 PC 뷰 | tradeStore |
| MobileHistoryView | 매매 히스토리 모바일 뷰 | tradeStore |

### 5.3 라우팅 구조

React Router v6 기반. 인증 상태에 따라 자동 리다이렉트를 처리하는 레이아웃 컴포넌트로 분기한다.

```
App
├── AuthLayout (미인증 사용자 전용)
│   ├── /login          → LoginPage
│   ├── /register       → RegisterPage
│   └── /reset-password → ResetPasswordPage
└── ProtectedLayout (인증 사용자 전용, NavBar/BottomNav 포함)
    ├── /              → redirect /dashboard
    ├── /dashboard     → DashboardPage
    ├── /calendar      → CalendarPage
    ├── /history       → HistoryPage
    ├── /holdings      → HoldingsPage
    ├── /analysis      → AnalysisPage
    ├── /journal/pre   → PreJournalPage (미구현)
    ├── /journal/post  → PostJournalPage (미구현)
    ├── /calculator    → CalculatorPage
    └── /goals         → GoalSettingPage (미구현)
```

### 5.4 커뮤니티 서비스 컴포넌트 (미래 확장)

| 컴포넌트 | 책임 | 메인 서비스 의존 |
|---|---|---|
| ProfileController | 개미의 집 프로필 조회/수정 | MainAPI: GET /users/{uuid}/public-profile |
| PostController | 게시글 작성·조회·삭제 | MainAPI: GET /trades/{id}/public |
| ProfileService | 레벨·경험치·스킨 비즈니스 로직 | CommunityProfileRepository |
| PostService | 게시글 생성, 공개 거래 참조 검증 | PostRepository, MainApiClient |
| MainApiClient | 메인 서비스 API 호출 어댑터 | Service Token 인증 |
| CommunityProfileRepository | community_profiles 테이블 CRUD | Community DB |
| PostRepository | posts 테이블 CRUD | Community DB |

---

## 6. 논리 설계 관점 (Logical Viewpoint)

| 항목 | 내용 |
|---|---|
| 관점 명칭 | Logical Viewpoint |
| 설계 언어 | 도메인 클래스 모델 (텍스트 UML 표현), 시퀀스 흐름 기술 |
| 관심사 | 핵심 도메인 객체, 클래스 관계, 상태 전이, 주요 유스케이스 처리 흐름 |
| 이해관계자 | 백엔드 개발팀, 아키텍트 |

### 6.1 핵심 도메인 클래스 모델

```
┌──────────┐                     ┌──────────┐
│  User    │1                   N│  Trade   │
│──────────│─────────────────────│──────────│
│+id:UUID  │                     │+id:Long  │
│+email    │                     │+userId   │
│+nickname │                     │+ticker   │
│+pubEnabled│                    │+type     │
│+commAt   │                     │+price    │
└──────────┘                     │+quantity │
                                 │+fee      │
     ┌──────────┐                │+pnl      │
     │   Tag    │      N:M       │+tradedAt │
     │──────────│────────────────│+strategyTag│
     │+id:Long  │                │+emotionTag│
     │+userId   │                │+memo     │
     │+name     │                │+isOpen   │
     │+type     │                │+isPublic │
     └──────────┘                └────┬─────┘
                                      │ 1
                                 ┌────▼─────┐
                                 │   Note   │
                                 │──────────│
                                 │+id:Long  │
                                 │+tradeId  │
                                 │+mistakeType│
                                 │+content  │
                                 └──────────┘
```

### 6.2 Trade 도메인 비즈니스 규칙

| 규칙 ID | 규칙 내용 | 적용 시점 |
|---|---|---|
| BR-001 | type = SELL인 경우 PnL = (매도가 - 평균매수가) × 수량으로 계산한다. (사용자 요청에 따라 수수료 제외 단순 차익 기준으로 변경) | tradeStore (v2.0.0 수정) |
| BR-002 | 특정 ticker의 총 보유 수량이 0이 되면 해당 ticker의 모든 OPEN trades의 is_open = FALSE로 일괄 전환한다. | DB 트리거 (Trade(SELL) 저장 후) |
| BR-003 | 매도 시 보유 수량이 입력된 매도 수량보다 적을 경우 시스템은 에러를 발생시키고 저장을 차단해야 한다 (공매도 방지). | tradeStore.createTrade |
| BR-003 | type = BUY인 경우 pnl 컬럼은 NULL로 저장한다. | Trade 저장 시 |
| BR-004 | is_public = TRUE 설정은 users.public_profile_enabled = TRUE인 경우에만 허용한다. | Trade 수정 시 |
| BR-005 | (폐기됨) 계좌 개념 삭제 | - |

### 6.3 주요 유스케이스 처리 흐름

> **구현 방식 변경 (v1.7.0)**: 기존 설계의 Express Controller → Service → Repository 흐름은 Supabase SDK 직접 통신 방식으로 대체되었다. 비즈니스 로직은 프론트엔드 Zustand Store에서 처리한다.

#### UC-Trade-Create: 매매 기록 입력 (현재 구현)

```
사용자 → TradeModal: 매수/매도 정보 입력 및 저장 버튼 클릭
TradeModal → tradeStore.createTrade(input)
tradeStore → supabase.auth.getUser(): 현재 로그인 유저 확인
  ※ 미인증 시 '로그인이 필요합니다.' 에러 throw
tradeStore → 보유 수량 검증: totalBuyQty - totalSellQty < input.quantity 이면 '보유 주식이 부족합니다.' 에러 throw
tradeStore → calcPnlForSell(): type=SELL인 경우 이동평균법으로 PnL 계산 (수수료 제외 단순 차익)
  PnL = (매도가 - 평균매수가) × 수량 - 수수료
  평균매수가 = Σ(price × qty) / Σqty (해당 ticker의 기존 BUY 거래)
tradeStore → 잔여수량 계산: totalBuyQty - totalSellQty - 현재매도수량
  잔여수량 > 0.000001 이면 is_open = true, 그 외 false
tradeStore → supabase.from('trades').insert({...}):
  user_id, ticker, name, type, price, quantity, fee,
  pnl, traded_at, strategy_tag, emotion_tag, memo,
  is_open, is_public
  ※ RLS 정책으로 auth.uid() = user_id 자동 검증
tradeStore → fetchTrades(): 목록 새로고침
TradeModal → 모달 닫기 및 UI 업데이트
```

#### UC-Auth-Init: 앱 초기 인증 상태 복원 (현재 구현)

```
App.useEffect → supabase.auth.getSession():
  세션 존재 시 → authStore.setAuth(user, token)
  세션 없음 시 → authStore.setAuth(null, null)
  → authStore.setInitialized(true)
App → supabase.auth.onAuthStateChange(callback):
  인증 상태 변경 이벤트 구독 (로그인/로그아웃 실시간 반영)
  언마운트 시 subscription.unsubscribe() 호출
ProtectedLayout:
  isAuthenticated = false → <Navigate to="/login" />
  isAuthenticated = true → <Outlet /> (보호된 페이지 렌더링)
```

#### UC-Calendar-Get: 수익 캘린더 조회 (현재 구현)

```
CalendarPage.useEffect → tradeStore.fetchTrades()
tradeStore → supabase.from('trades').select('*').order('traded_at', { ascending: false })
  ※ RLS 정책으로 현재 유저 데이터만 반환
CalendarPage → useMemo: 클라이언트 사이드에서 월별 필터링
  selectedMonth 기준 해당 월 trades 필터링
  날짜별 PnL 합산 (일별 pnlMap 생성)
  월간 요약 4대 지표 계산 (총 손익, 수익일, 손실일, 일평균)
CalendarPage(View):
  캘린더 그리드 렌더링
  날짜 셀 클릭 → 해당일 trades 하단 목록 표시
```

#### UC-Analysis-Strategy: 전략별 승률 분석 (현재 구현)

```
AnalysisPage → tradeStore.trades (이미 fetchTrades로 로드된 데이터 사용)
AnalysisPage → useMemo: 클라이언트 사이드 집계
  type='sell' 거래만 필터링
  strategy_tag별 그룹화
  그룹별 total, wins(pnl > 0), winRate, avgPnl 계산
AnalysisPage(View): 전략별 승률 차트/테이블 렌더링
```

---

## 7. 데이터 설계 관점 (Data Viewpoint)

| 항목 | 내용 |
|---|---|
| 관점 명칭 | Data Viewpoint |
| 설계 언어 | ERD (텍스트 표현), SQL DDL, 산문 기술 |
| 관심사 | DB 스키마, 정규화, 인덱스, 커뮤니티 DB 분리 전략 |
| 이해관계자 | DBA, 백엔드 개발팀 |

### 7.1 메인 DB 설계 결정

| 결정 항목 | 선택 | 근거 |
|---|---|---|
| DBMS | Supabase (PostgreSQL 14+) | JSON 컬럼, 윈도우 함수, 전문 집계 함수 지원. RLS 기반 보안 통합. |
| 정규화 수준 | 3NF (제3정규형) | 분석 쿼리의 JOIN 복잡도와 데이터 일관성 균형. |
| PK 전략 | BIGINT AUTO_INCREMENT (trades 등) | 고빈도 INSERT 성능. UUID PK는 users 테이블에만 적용. |
| strategy_tag 저장 | VARCHAR (MVP 단계) | 초기에는 trades 컬럼에 직접 저장. 고도화 시 tags FK로 전환 예정. |
| 분석 집계 | DB View + 런타임 집계 쿼리 | 별도 집계 테이블 미생성. 트래픽 증가 시 Materialized View 전환 고려. |
| 커뮤니티 분리 | Loose Coupling (UUID 참조만) | FK 제약 없음. 메인 DB 변경이 커뮤니티 DB에 영향 없도록 설계. |

### 7.2 SQL DDL — 메인 DB

#### users

```sql
CREATE TABLE users (
    id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    email                  VARCHAR(255)  NOT NULL UNIQUE,
    password_hash          VARCHAR(255)  NULL,          -- 소셜 로그인 시 NULL
    nickname               VARCHAR(50)   NOT NULL,
    public_profile_enabled BOOLEAN       NOT NULL DEFAULT FALSE,
    community_joined_at    TIMESTAMP     NULL,
    reset_token            VARCHAR(255)  NULL,
    reset_token_expires_at TIMESTAMP     NULL,
    created_at             TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### 7.1.2 (삭제됨) accounts

*(계좌 개념 삭제, trades 테이블이 users 테이블을 직접 참조하도록 수정 2026-04-09)*

#### trades ★ 핵심 테이블

```sql
CREATE TYPE trade_type AS ENUM ('buy', 'sell');

CREATE TABLE trades (
    id            BIGSERIAL       PRIMARY KEY,
    user_id       UUID            NOT NULL REFERENCES users(id),
    ticker        VARCHAR(20)     NOT NULL,
    name          VARCHAR(100)    NOT NULL,
    type          trade_type      NOT NULL,
    price         DECIMAL(18,4)   NOT NULL,
    quantity      DECIMAL(18,8)   NOT NULL,
    fee           DECIMAL(18,4)   NOT NULL DEFAULT 0,
    pnl           DECIMAL(18,4)   NULL,       -- SELL 시 자동 계산, BUY는 NULL
    traded_at     TIMESTAMP       NOT NULL,
    strategy_tag  VARCHAR(100)    NULL,
    emotion_tag   VARCHAR(100)    NULL,
    memo          TEXT            NULL,
    is_open       BOOLEAN         NOT NULL DEFAULT TRUE,
    is_public     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- 계획 매매 관련 확장 (v1.8.0)
    target_price     DECIMAL(18,4) NULL, -- 목표가
    stop_loss_price  DECIMAL(18,4) NULL, -- 손절가
    entry_reason     TEXT          NULL, -- 매매 근거
    is_planned       BOOLEAN       DEFAULT FALSE -- 계획 매매 여부
);

-- 조회·집계 성능을 위한 인덱스
CREATE INDEX idx_trades_user_id        ON trades(user_id);
CREATE INDEX idx_trades_traded_at      ON trades(traded_at DESC);
CREATE INDEX idx_trades_ticker         ON trades(ticker);
CREATE INDEX idx_trades_strategy_tag   ON trades(strategy_tag);
CREATE INDEX idx_trades_is_open        ON trades(is_open) WHERE is_open = TRUE;
CREATE INDEX idx_trades_is_public      ON trades(is_public) WHERE is_public = TRUE;

-- RLS 설정: 본인의 데이터만 조회/수정 가능 (명시적 타입 캐스팅 ::uuid 적용)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON public.users 
    FOR ALL USING (auth.uid() = (id)::uuid);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own trades" ON trades
    FOR ALL USING (auth.uid() = (user_id)::uuid);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notes" ON notes
    FOR ALL USING (EXISTS (SELECT 1 FROM trades WHERE trades.id = notes.trade_id AND (trades.user_id)::uuid = auth.uid()));

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tags" ON tags
    FOR ALL USING (auth.uid() = (user_id)::uuid);

ALTER TABLE stock_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can search stocks" ON stock_master 
    FOR SELECT TO authenticated USING (true);
```

#### get_user_tier() 함수 (v1.9.0)

```sql
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
```
```
```

#### stock_master (종목 마스터 DB)

```sql
-- PostgreSQL의 GIN 인덱스와 pg_trgm 확장 기능을 사용하여
-- ILIKE '%keyword%' 형태의 쿼리를 최적화합니다.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE stock_master (
    id            SERIAL         PRIMARY KEY,
    ticker        VARCHAR(20)    NOT NULL UNIQUE,
    name          VARCHAR(100)   NOT NULL,
    market        VARCHAR(20)    NOT NULL
);

CREATE INDEX idx_stock_name ON stock_master USING gin(name gin_trgm_ops);
```
**검색 인덱스 구조**: 초고속 검색 자동완성을 위해 `ticker`에는 UNIQUE(B-Tree) 인덱스를, `name` 컬럼에는 `pg_trgm` 모듈 기반의 **GIN 인덱스(`gin_trgm_ops`)**를 부여하여 ILIKE 부분 일치 검색 처리 속도를 보장한다. (v1.4.0 업데이트: 현재 종목 검색 로직은 네트워크 구조상 한계와 지연을 피하기 위해 최적화된 프론트엔드 로컬 CSV 기반 검색으로 롤백되어 있으며, 해당 테이블과 인덱스는 향후 백엔드 고도화용으로만 보존됨)

#### 분석용 DB View

```sql
-- 전략별 통계 뷰 (별도 테이블 없이 실시간 집계)
CREATE VIEW v_strategy_stats AS
SELECT
    t.user_id,
    t.strategy_tag,
    COUNT(*)                                              AS total_trades,
    SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END)          AS win_count,
    ROUND(SUM(CASE WHEN t.pnl > 0 THEN 1.0 ELSE 0 END)
          / NULLIF(COUNT(*), 0) * 100, 2)                AS win_rate_pct,
    ROUND(AVG(t.pnl), 2)                                 AS avg_pnl
FROM trades t
WHERE t.type = 'sell'
GROUP BY t.user_id, t.strategy_tag;

-- 날짜별 PnL 캘린더 뷰
CREATE VIEW v_daily_pnl AS
SELECT
    user_id,
    DATE(traded_at)  AS trade_date,
    SUM(pnl)         AS daily_pnl
FROM trades
WHERE type = 'sell'
GROUP BY user_id, DATE(traded_at);

-- 심리 점수와 수익률 상관관계 분석 뷰 (v1.8.0 추가)
CREATE VIEW v_mood_pnl_correlation AS
SELECT
    t.user_id,
    j.mood_score,
    AVG(t.pnl) as avg_pnl,
    COUNT(t.id) as trade_count
FROM trades t
JOIN daily_journals j ON t.user_id = j.user_id AND DATE(t.traded_at) = j.journal_date
WHERE t.type = 'sell' AND j.type = 'post'
GROUP BY t.user_id, j.mood_score;
```

### 7.3 커뮤니티 DB 스키마

커뮤니티 DB는 메인 DB와 물리적으로 분리된 독립 인스턴스에서 운영된다. 메인 DB의 user_id(UUID)와 trade_id(BIGINT)를 참조 목적으로만 저장하며, FK 제약을 설정하지 않는다.

```sql
-- 커뮤니티 DB (별도 인스턴스)
CREATE TABLE community_profiles (
    user_id        UUID         PRIMARY KEY,  -- 메인 DB users.id 참조 (FK 없음)
    house_skin     VARCHAR(50)  NOT NULL DEFAULT 'default',
    level          INT          NOT NULL DEFAULT 1,
    exp_points     INT          NOT NULL DEFAULT 0,
    badge_ids      JSONB        NOT NULL DEFAULT '[]',
    last_active_at TIMESTAMP    NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
    id             BIGSERIAL    PRIMARY KEY,
    author_user_id UUID         NOT NULL,    -- 메인 DB users.id 참조 (FK 없음)
    trade_id       BIGINT       NULL,        -- 메인 DB trades.id 참조 (FK 없음, 공유 거래)
    content        TEXT         NOT NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author     ON posts(author_user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

---

## 8. 인터페이스 설계 관점 (Interface Viewpoint)

| 항목 | 내용 |
|---|---|
| 관점 명칭 | Interface Viewpoint |
| 설계 언어 | Supabase SDK 인터페이스 명세 + 커뮤니티 서비스용 REST API |
| 관심사 | SDK 호출 구조, 오류 처리, 인증 방식, 커뮤니티 API 계약 |
| 이해관계자 | 프론트엔드 개발팀, 커뮤니티 서비스 개발팀, QA |

### 8.1 공통 규약

| 항목 | 규약 |
|---|---|
| 통신 방식 | Supabase JS SDK (`@supabase/supabase-js`) |
| 인증 | Supabase Auth JWT — `supabase.auth.getSession()` / `onAuthStateChange()` |
| 보안 | RLS 정책으로 서버 측 자동 user_id 필터링 적용 |
| 날짜 형식 | ISO 8601 — 예: 2026-04-15T09:30:00+09:00 |
| 오류 처리 | Supabase SDK 오류: `{ data, error }` 구조. `error` 존재 시 throw하여 tradeStore의 catch 블록에서 처리 |
| 페이지네이션 | 현재 미적용. 전체 trades `.select('*')` 단건 조회 방식. 데이터 증가 시 `.range()` 적용 예정 |

### 8.2 인증 인터페이스 (Supabase Auth SDK)

#### 회원가입

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.auth.signUp({ email, password, options: { data: { nickname } } })` |
| 성공 | `{ data: { user, session }, error: null }` — 이메일 인증 링크 발송 |
| 실패 | `{ data: null, error: { message } }` — 이메일 중복 등 |

#### 로그인

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.auth.signInWithPassword({ email, password })` |
| 성공 | `{ data: { user, session }, error: null }` |
| 실패 | `{ data: null, error: { message: 'Invalid login credentials' } }` |

#### 비밀번호 재설정 이메일 발송

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.auth.resetPasswordForEmail(email, { redirectTo: '...' })` |
| 성공 | `{ data: {}, error: null }` |

#### 새 비밀번호 설정

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.auth.updateUser({ password: newPassword })` |
| 조건 | 비밀번호 재설정 링크 클릭 후 세션 활성화된 상태에서만 유효 |

#### 로그아웃

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.auth.signOut()` |
| 처리 | authStore.setAuth(null, null) 호출 → ProtectedLayout이 /login으로 리다이렉트 |

### 8.3 (삭제됨) 계좌 API

계좌 개념은 전면 삭제됨 (2026-04-09)

### 8.4 매매 데이터 인터페이스 (Supabase SDK)

#### 매매 목록 조회

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.from('trades').select('*').order('traded_at', { ascending: false })` |
| 반환 타입 | `Trade[]` — `{ id, user_id, ticker, name, type, price, quantity, fee, pnl, traded_at, strategy_tag, emotion_tag, memo, is_open, is_public }` |
| 보안 | RLS 정책에 의해 `auth.uid() = user_id`인 행만 자동 반환 |

#### 매매 기록 저장

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.from('trades').insert({ user_id, ticker, name, type, price, quantity, fee, pnl, traded_at, strategy_tag, emotion_tag, memo, is_open, is_public })` |
| 전처리 | PnL 계산(`calcPnlForSell`), is_open 결정은 tradeStore에서 INSERT 전 수행 |
| 특이 사항 | `ticker` 검색 드롭다운은 티커만, `name` 검색 드롭다운은 종목명만 노출. 선택 시 상호 자동완성. |

### 8.5 분석 인터페이스 (클라이언트 사이드 집계)

분석 데이터는 별도 API 호출 없이 **이미 로드된 `tradeStore.trades`를 클라이언트 사이드에서 집계**한다.

| 분석 항목 | 처리 방식 | 대상 데이터 |
|---|---|---|
| 전략 태그별 승률 | `trades.filter(type='sell').groupBy(strategy_tag)` | tradeStore.trades |
| 감정 태그별 평균 PnL | `trades.filter(type='sell').groupBy(emotion_tag)` | tradeStore.trades |
| 실수 유형 분석 | `trades.filter(pnl < 0).groupBy(strategy_tag)` | tradeStore.trades |
| 보유 종목 비중 | `trades.filter(is_open=true).groupBy(ticker)` | tradeStore.trades |

### 8.6 오답 노트 인터페이스 (Supabase SDK)

| 작업 | SDK 호출 | 비고 |
|---|---|---|
| 노트 작성/수정 (Upsert) | `supabase.from('notes').upsert({ trade_id, mistake_type, content })` | NoteModal 컴포넌트에서 처리 |
| 노트 단건 조회 | `supabase.from('notes').select('*').eq('trade_id', tradeId).single()` | — |

### 8.7 커뮤니티 게이트웨이 API (미래 구현)

> 아래 API는 커뮤니티 서비스가 Service Token으로 호출하는 전용 엔드포인트이다. 현재 미구현 상태이며, 향후 Supabase Edge Function 또는 별도 서버에서 구현할 예정이다.

| 메서드 | 경로 | 설명 | 응답 요약 |
|---|---|---|---|
| GET | /community/users/{uuid}/profile | 공개 프로필 반환 | `{ uuid, nickname, createdAt }` |
| GET | /community/trades/{tradeId}/public | is_public=TRUE인 거래 요약 반환 | `{ tradeId, ticker, type, pnl, tradedAt, strategyTag }` |

---

## 9. 설계 결정 및 근거

IEEE 1016-2009는 주요 설계 결정과 그 근거를 명시하도록 요구한다.

| 결정 ID | 설계 결정 | 대안 | 선택 근거 |
|---|---|---|---|
| DD-001 | 분석·캘린더는 별도 집계 테이블 없이 **클라이언트 사이드 집계**로 처리 | DB View, Materialized Table | MVP 데이터 규모에서 프론트엔드 집계 성능 충분. 네트워크 요청 절감. 데이터 증가 시 DB View 전환 용이. |
| DD-002 | 커뮤니티 DB와 메인 DB 간 FK 제약 미설정 (Loose Coupling) | Cross-DB FK (일부 DBMS 지원) | 서비스 독립 배포·장애 격리 보장. 메인 DB 스키마 변경이 커뮤니티 DB를 깨지 않음. |
| DD-003 | MVP 단계 strategy_tag를 trades VARCHAR 컬럼에 직접 저장 | tags 테이블 FK 정규화 | 초기 개발 속도 우선. 고도화 단계에서 FK 마이그레이션 예정 (OI-001). |
| DD-004 | PK 전략: trades는 BIGSERIAL, users는 UUID | 전체 UUID PK | trades는 고빈도 INSERT — 순차 BIGSERIAL이 UUID 대비 인덱스 분산 최소화. users는 커뮤니티 연결 키이므로 UUID 필요. |
| DD-005 | **별도 백엔드 서버 없이 Supabase SDK 직접 통신** | Express.js 백엔드 서버 (Railway 배포) | 인프라 운영 부담 제거. Supabase RLS로 보안 보장. 서버리스 구조로 운영 비용 최소화. 개발-배포 사이클 단축. |
| DD-006 | **PnL 계산 및 is_open 결정 로직을 프론트엔드 Zustand tradeStore에 배치** | DB 트리거 (PostgreSQL FUNCTION + TRIGGER) | 초기 구현 속도 우선. MVP 단계에서 동시성 충돌 가능성 낮음. 향후 데이터 정합성 강화 필요 시 DB 트리거로 이관 예정. |
| DD-007 | **종목 검색 자동완성을 프론트엔드 내장 CSV 파싱 방식으로 구현** | 백엔드 API + PostgreSQL GIN 인덱스 검색 | 네트워크 지연 완전 제거. 오프라인 동작 가능. 배포 서버 부하 없음. stock_master 갱신 시 CSV 파일 교체만으로 대응 가능. |
| DD-008 | **반응형 레이아웃을 layoutStore.isMobileMode 단일 bool로 전환 제어** | CSS 미디어 쿼리만 사용 | 컴포넌트 수준에서 NavBar/BottomNav를 완전히 교체해야 하는 구조적 분기가 필요하여 JS 레벨 상태 관리가 더 명확함. |
| DD-009 | **심리 관리 및 매매 루틴 명세 반영 (미구현)** | - | 서비스 지향점인 '뇌동매매 방지'를 명문화하고, 이를 위한 데이터 구조(Plan-Do-See 루프)를 선제적으로 설계에 반영함. |
| DD-010 | **구독 Tier 기반 접근 제어 (이중 방어)** | 클라이언트 단독 제어 | 보안 강화를 위해 프론트엔드(`TierGate`)와 DB 레이어(`RLS` + `DB Function`)가 동시에 티어를 검증하는 구조 채택. |
| DD-011 | **매매 데이터 내보내기(CSV/xlsx) 클라이언트 처리** | 서버 사이드 렌더링 | 별도 서버 운영 비용을 최소화하기 위해 Supabase SDK로 데이터를 조회하여 브라우저 Blob 및 `xlsx` 라이브러리로 직접 생성. (한글 깨짐 방지용 UTF-8 BOM 적용) |
| DD-012 | **KST(UTC+09:00) 시간대 우선 정책** | 브라우저 로컬 시간 | 투자 환경의 일관성을 위해 기록 시 초기 일시값을 한국 표준시로 강제 설정하여 시차 혼선을 방지함. |
| DD-013 | **엄격한 공매도 방지 정책(Short-sell Protection)** | 사후 처리 | 데이터 정합성 파괴를 막기 위해 매도 전 실시간 재고 계산을 수행하고, 부족 시 트랜잭션을 원천 차단함. |
| DD-014 | **단순 매매 차익 중심의 손익 산출** | 수수료 포함 순손익 | 세금 및 수수료 체계의 복잡함보다 전략적 성과(매매 타점)에 집중할 수 있도록 수수료를 제외한 단순 차익을 PnL 기준으로 채택함. |
| DD-015 | **RLS 보안 고도화 및 강제 타입 캐스팅(::uuid) 적용** | 기본 연산자 비교 | DB 컬럼(TEXT)과 SDK 식별자(UUID) 간의 타입 불일치 에러를 방지하고, 프로젝트 전역의 데이터 격리 무결성을 보장하기 위해 모든 RLS 정책에 명시적 캐스팅 적용. |
| DD-016 | **백엔드 보안 헤더(Helmet) 적용 강화** | 기본 Express 응답 | 보안 모범 사례에 따라 Helmet을 적용하여 악의적인 헤더 조작 및 일반적인 웹 취약점으로부터 서버를 보호함. |
| DD-017 | **접근성 최우선(Accessibility First) 및 고대비 설계** | 기본 디자인 시스템 | 모든 사용자가 제약 없이 서비스를 이용할 수 있도록 WCAG 2.1 표준을 설계 단계부터 반영하고, 라이트 모드 가시성 강화를 위해 고대비 색상 체계를 구축함. |
| DD-018 | **클라이언트 사이드 시뮬레이션 엔진 설계** | 서버 사이드 연산 | 실시간 반응성이 중요한 복리 및 R:R 계산의 경우, 네트워크 지연을 없애기 위해 모든 수식을 프론트엔드 pure function으로 구현하고 유닛 테스트가 용이한 구조를 채택함. |

### 8.9 구독 및 목표 관리 인터페이스 (Supabase SDK - 미구현)

#### 사용자 구독 정보(Tier) 조회

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.from('subscriptions').select('tier, expires_at').eq('user_id', uid).single()` |
| 비고 | 앱 초기화 시 `tierStore`에서 1회 호출하여 전역 상태로 관리 |

#### 월별 목표 손익 조회 및 저장

| 항목 | 내용 |
|---|---|
| 조회 SDK | `supabase.from('goals').select('*').eq('user_id', uid).eq('target_month', 'YYYY-MM')` |
| 저장 SDK | `supabase.from('goals').upsert({ user_id, target_month, target_pnl })` |
| 비고 | 동일 월에 대해 `target_month` 유니크 제약 조건을 이용하여 덮어쓰기(upsert) 처리 |

### 8.8 매매 루틴 인터페이스 (Supabase SDK - 미구현)

#### 일일 저널(Journal) 저장 (Upsert)

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.from('daily_journals').upsert({ user_id, journal_date, type, plan_memo, mood_score, today_rule, impulse_count, plan_followed })` |
| 비고 | 동일 날짜, 동일 타입(pre/post) 데이터는 덮어쓰기 방식으로 처리 |

#### 계획 매매 데이터 저장

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.from('trades').insert({ ..., target_price, stop_loss_price, entry_reason, is_planned })` |
| 비고 | 매수 시점에 목표가 및 손절가를 선입력하여 계획 기반 매매를 유도 |

---

## 10. 부록

### 10.1 설계 관점 ↔ 요구사항 추적 매트릭스

| SRS 요구사항 ID | 요구사항 요약 | 해소 설계 관점 | SDD 절 |
|---|---|---|---|
| FR-001~004 | 사용자 계정 관리 | Composition, Interface | 5.2, 8.2 |
| FR-010~012 | 계좌 관리 | Logical, Data, Interface | 6.2, 7.2, 8.3 |
| FR-020~025 | 매매 기록 입력·저장 | Logical, Data, Interface | 6.2, 6.3, 7.2, 8.4 |
| FR-030~032 | 대시보드 | Logical, Data | 6.3, 7.2 |
| FR-040~042 | 수익 캘린더 | Logical, Data, Interface | 6.3, 7.2, 8.4 |
| FR-050~053 | 매매 히스토리·필터 | Interface, Data | 7.2, 8.4 |
| FR-060~063 | 매매 복기/분석 | Logical, Data, Interface | 6.3, 7.2, 8.5 |
| FR-070~072 | 태그 관리 | Data | 7.2 |
| FR-080~084 | 커뮤니티 연결 인터페이스 | Context, Data, Interface | 4.3, 7.3, 8.7 |
| NFR-010~013 | 보안 (HTTPS, JWT) | Interface | 8.1, 8.2 |
| NFR-040~041 | 유지보수성·독립 배포 | Context, Composition | 4.3, 5.3 |

### 10.2 미결 설계 사항 (Open Design Issues)

| ID | 내용 | 영향 범위 | 목표 해결 |
|---|---|---|---|
| ODI-001 | strategy_tag FK 마이그레이션 시점 결정 (tags 테이블 정규화) | Data Viewpoint, Interface | P2 단계 |
| ODI-002 | 커뮤니티 서비스 상세 SDD 작성 (posts, likes, 레벨업 로직) | Composition, Data | P3 착수 전 |
| ODI-003 | 분석 집계 Materialized View 전환 기준 TPS 임계값 정의 | Data Viewpoint | P2 성능 테스트 후 |
| ODI-004 | 외부 증권사 API 자동 연동 시 아키텍처 변경 범위 검토 | Context, Composition | 로드맵 검토 시 |
