# 소프트웨어 설계 명세서
**Software Design Description**

| 항목 | 내용 |
|---|---|
| 제품명 | 매매일지 앱 (개미의 집) |
| 문서 버전 | 3.2.1 |
| 적용 표준 | IEEE 1016-2009 |
| 작성일 | 2026-04-09 |
| 최종 수정일 | 2026-04-20 |
| 문서 상태 | Version: v3.2.1 (2026-04-20) - Status: 구현 완료 (프로필 및 계정 관리 시스템) - 업데이트 사항: profiles 테이블 email 추가, 회원 탈퇴 시나리오 명세화(MVP + Premium Tier 범위) |
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
| 3.1.0 | 2026-04-19 | — | **Orchestration v2.0 정렬**: 비즈니스 로직(PnL) 분리, `tierStore` 도입을 통한 기능 게이팅, `TradeLike` 인터페이스 도입으로 순환 참조 해결, `vitest` 도입 |
| 3.2.0 | 2026-04-20 | — | **구독 관리 및 수동 승인 시스템**: `subscriptions`, `profiles` 테이블 도입. `status` 및 `expires_at` 기반 권한 검증 고도화. Admin 관리 UI 추가 |
| 3.2.1 | 2026-04-20 | — | **프로필 및 계정 관리 시스템**: 닉네임 수정 및 회원 탈퇴(Cascade 삭제) 로직 설계 추가 |
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

본 SDD는 MVP 범위에 해당하는 다섯 가지 설계 관점(Viewpoint)을 다려한다.

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
│  ● AdminSubscriptionPage (관리자 전용) [신규]                │
├──────────────────────────────────────────────────────────────┤
│  Components Layer  (재사용 UI 컴포넌트)                       │
│  ● TradeModal, NavBar, BottomNav, ErrorBoundary, TierGate    │
│  ● MetricCard, TagChip, NoteModal, IsometricTown             │
│  ● DesktopHistoryView, MobileHistoryView                     │
├──────────────────────────────────────────────────────────────┤
│  Store Layer  (Zustand 전역 상태 + 비즈니스 로직)             │
│   ├── authStore        (인증 세션 및 역할 관리)
│   ├── tradeStore       (매매/PnL 로직)
│   ├── tierStore        (구독 등급 및 기능 권한 제어)
│   └── layoutStore      (반응형 레이아웃 관리)
├──────────────────────────────────────────────────────────────┤
│  API Layer  (Supabase SDK 래퍼)                              │
│  ● supabase.ts — createClient 초기화 및 export               │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 프론트엔드 컴포넌트 분해

#### 5.2.1 Pages (라우팅 단위 화면)

| 컴포넌트 | 경로 | 책임 | 주요 의존 |
|---|---|---|---|
| DashboardPage | /dashboard | 누적 PnL MetricCard 3개, 7일 AreaChart | tradeStore |
| AdminSubscriptionPage | /admin/subs | 구독 승인 및 관리 | authStore, tierStore |
| ... | ... | ... | ... |

### 5.3 라우팅 구조

React Router v6 기반. 인증 상태 및 역할(Admin)에 따라 자동 리다이렉트를 처리하는 레이아웃 컴포넌트로 분기한다.

---

## 6. 논리 설계 관점 (Logical Viewpoint)

| 항목 | 내용 |
|---|---|
| 관점 명칭 | Logical Viewpoint |
| 설계 언어 | 도메인 클래스 모델 (텍스트 UML 표현), 시퀀스 흐름 기술 |
| 관심사 | 핵심 도메인 객체, 클래스 관계, 상태 전이, 주요 유스케이스 처리 흐름 |
| 이해관계자 | 백엔드 개발팀, 아키텍트 |

### 6.1 핵심 도메인 클래스 모델

*(기존 모델 유지 및 profiles, subscriptions 테이블 추가)*

---

## 7. 데이터 설계 관점 (Data Viewpoint)

| 항목 | 내용 |
|---|---|
| 관점 명칭 | Data Viewpoint |
| 설계 언어 | ERD (텍스트 표현), SQL DDL, 산문 기술 |
| 관심사 | DB 스키마, 정규화, 인덱스, 커뮤니티 DB 분리 전략 |
| 이해관계자 | DBA, 백엔드 개발팀 |

#### 5.1.8 subscriptions (구독 정보)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| user_id | UUID | PK, FK | 유저 식별자 |
| tier | TEXT | free / premium | 구독 등급 |
| status | TEXT | active/pending/.. | 승인 상태 |
| expires_at| TIMESTAMPTZ | NULL | 만료 일시 |

#### 5.1.9 profiles (유저 프로필/역할)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK, FK | 유저 식별자 |
| email | TEXT | - | 유저 이메일 (Auth 연동) |
| nickname | TEXT | - | 표시 명칭 |
| role | TEXT | admin / user | 시스템 권한 |

---

## 8. 인터페이스 설계 관점 (Interface Viewpoint)

| 항목 | 내용 |
|---|---|
| 관점 명칭 | Interface Viewpoint |
| 설계 언어 | Supabase SDK 인터페이스 명세 + 커뮤니티 서비스용 REST API |
| 관심사 | SDK 호출 구조, 오류 처리, 인증 방식, 커뮤니티 API 계약 |
| 이해관계자 | 프론트엔드 개발팀, 커뮤니티 서비스 개발팀, QA |

#### 사용자 구독 정보(Tier) 조회

| 항목 | 내용 |
|---|---|
| SDK 호출 | `supabase.from('subscriptions').select('tier, expires_at').eq('user_id', uid).single()` |
| DD-010 | Tier 기반 기능 게이팅 | `tierStore`에서 `PERMISSIONS` 맵과 현재 유저의 `tier`를 비교하여 UI를 통제하며, `status === 'active'` 및 만료 여부를 추가 검증함 |
| DD-011 | Admin 전용 라우트 | `authStore`의 `isAdmin` 상태를 기반으로 NavBar 메뉴 노출 및 `/admin/*` 경로 보호 |

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
