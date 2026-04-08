# 소프트웨어 설계 명세서
**Software Design Description**

| 항목 | 내용 |
|---|---|
| 제품명 | 매매일지 앱 (개미의 집) |
| 문서 버전 | 1.0.0 |
| 적용 표준 | IEEE 1016-2009 |
| 작성일 | 2026-04-08 |
| 문서 상태 | 초안 (Draft) |
| 참조 SRS | SRS_매매일지앱_v1.0 (IEEE 830-1998) |
| 설계 언어 | UML 2.x (텍스트 표현), SQL DDL, REST API |

---

## 개정 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|---|---|---|---|
| 1.0.0 | 2026-04-08 | — | 최초 작성 — IEEE 1016-2009 기반 초안 |

---

## 목차

1. [소개](#1-소개)
2. [설계 이해관계자 및 관심사](#2-설계-이해관계자-및-관심사)
3. [설계 관점 개요](#3-설계-관점-개요)
4. [맥락 설계 관점 (Context Viewpoint)](#4-맥락-설계-관점-context-viewpoint)
5. [구성 설계 관점 (Composition Viewpoint)](#5-구성-설계-관점-composition-viewpoint)
6. [논리 설계 관점 (Logical Viewpoint)](#6-논리-설계-관점-logical-viewpoint)
7. [데이터 설계 관점 (Data Viewpoint)](#7-데이터-설계-관점-data-viewpoint)
8. [인터페이스 설계 관점 (Interface Viewpoint)](#8-인터페이스-설계-관점-interface-viewpoint)
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

매매일지 앱은 "메인 서비스"와 "커뮤니티 서비스" 두 개의 독립 시스템으로 구성된다. 두 시스템은 REST API를 통해서만 통신하며, 데이터베이스를 공유하지 않는다.

| 외부 행위자 | 유형 | 상호작용 방향 | 데이터/프로토콜 |
|---|---|---|---|
| 개인 투자자 (사용자) | 인간 행위자 | 양방향 | HTTPS / JSON |
| 모바일 앱 클라이언트 | 시스템 | → 메인 서비스 | REST API over HTTPS |
| 웹 브라우저 클라이언트 | 시스템 | → 메인 서비스 | REST API over HTTPS |
| 커뮤니티 서비스 | 외부 시스템 | → 메인 서비스 | Service Token 인증 REST API (읽기 전용) |
| 이메일 서비스 (SMTP) | 외부 시스템 | ← 메인 서비스 | SMTP — 회원가입 인증 |
| 소셜 로그인 공급자 | 외부 시스템 | 양방향 | OAuth 2.0 — Google, Kakao |

### 4.2 시스템 맥락도 (System Context Diagram)

```
┌─────────────────────────────────────────────────────────┐
│                    외부 행위자                           │
│  [사용자]         [소셜 로그인]      [이메일 서비스]    │
│     │ HTTPS           │ OAuth2.0          │ SMTP         │
└─────┼─────────────────┼───────────────────┼─────────────┘
      │                 │                   │
  ┌───▼─────────────────▼───────────────────▼───────────┐
  │              메인 서비스 (Main Service)               │
  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
  │  │ Auth API │  │Trade API │  │  Analysis API     │  │
  │  └──────────┘  └──────────┘  └───────────────────┘  │
  │                  │ (메인 DB)                          │
  │          ┌───────▼────────┐                          │
  │          │  PostgreSQL    │                          │
  │          │  (메인 DB)     │                          │
  │          └────────────────┘                          │
  └───────────────────────────────┬───────────────────────┘
                                   │ Service Token REST
                           ┌───────▼────────────────┐
                           │  커뮤니티 서비스        │
                           │  (Community Service)   │
                           │  ┌──────────────────┐  │
                           │  │  커뮤니티 DB     │  │
                           │  └──────────────────┘  │
                           └────────────────────────┘
```

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
| 이해관계자 | 백엔드 개발팀, QA |

### 5.1 전체 레이어 구조

메인 서비스는 4-Tier Layered Architecture를 적용한다. 각 레이어는 하위 레이어에만 의존하며 상위 레이어를 참조하지 않는다.

```
┌───────────────────────────────────────────────────────┐
│  Presentation Layer  (Controller / Router)            │
│  ● HTTP 요청 수신, 인증 필터, 요청/응답 직렬화        │
├───────────────────────────────────────────────────────┤
│  Application Layer   (Service / Use Case)             │
│  ● 비즈니스 유스케이스 조율, 트랜잭션 경계 관리       │
├───────────────────────────────────────────────────────┤
│  Domain Layer        (Domain Model / Business Rule)   │
│  ● 핵심 도메인 객체, 비즈니스 규칙 (PnL 계산 등)     │
├───────────────────────────────────────────────────────┤
│  Infrastructure Layer (Repository / DB / External)    │
│  ● DB 접근(ORM), 외부 서비스 어댑터, 캐시            │
└───────────────────────────────────────────────────────┘
```

### 5.2 메인 서비스 컴포넌트 분해

| 컴포넌트 | 레이어 | 책임 | 주요 의존 |
|---|---|---|---|
| AuthController | Presentation | JWT 발급·갱신, 소셜 로그인 리다이렉트 처리 | AuthService |
| TradeController | Presentation | 매매 CRUD HTTP 엔드포인트 | TradeService |
| AnalysisController | Presentation | 전략별 승률·PnL 집계 요청 처리 | AnalysisService |
| CommunityGateway | Presentation | 커뮤니티 전용 API 엔드포인트 (공개 데이터만) | TradeService, UserService |
| AuthService | Application | 회원가입, 로그인, 토큰 관리 | UserRepository, JwtProvider |
| TradeService | Application | 매매 저장, PnL 계산, 보유 여부 갱신 | TradeRepository, AccountRepository |
| AnalysisService | Application | 태그별 집계, 오답 노트 CRUD | TradeRepository, NoteRepository |
| TagService | Application | 사용자 정의 태그 관리 | TagRepository |
| Trade (Domain) | Domain | PnL 계산 비즈니스 규칙, is_open 상태 전이 | 없음 (순수 도메인) |
| UserRepository | Infrastructure | users 테이블 CRUD | DB Connection |
| TradeRepository | Infrastructure | trades 테이블 CRUD + 집계 쿼리 | DB Connection |
| AccountRepository | Infrastructure | accounts 테이블 CRUD | DB Connection |
| NoteRepository | Infrastructure | notes 테이블 CRUD | DB Connection |
| TagRepository | Infrastructure | tags 테이블 CRUD | DB Connection |
| JwtProvider | Infrastructure | JWT 생성·검증 | 없음 |

### 5.3 커뮤니티 서비스 컴포넌트

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
┌──────────┐        ┌──────────┐       ┌──────────┐
│  User    │1      N│ Account  │1     N│  Trade   │
│──────────│────────│──────────│───────│──────────│
│+id:UUID  │        │+id:Long  │       │+id:Long  │
│+email    │        │+userId   │       │+accountId│
│+nickname │        │+name     │       │+ticker   │
│+pubEnabled│       │+broker   │       │+type     │
│+commAt   │        │+currency │       │+price    │
└──────────┘        └──────────┘       │+quantity │
                                       │+fee      │
     ┌──────────┐                      │+pnl      │
     │   Tag    │  N:M (via tag field) │+tradedAt │
     │──────────│──────────────────────│+strategyTag│
     │+id:Long  │                      │+emotionTag │
     │+userId   │                      │+memo     │
     │+name     │                      │+isOpen   │
     │+type     │                      │+isPublic │
     └──────────┘                      └────┬─────┘
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
| BR-001 | type = SELL인 경우 PnL = (매도가 - 평균매수가) × 수량 - 수수료로 계산한다. | Trade 저장 시 |
| BR-002 | 특정 ticker의 총 보유 수량이 0이 되면 해당 ticker의 모든 OPEN trades의 is_open = FALSE로 일괄 전환한다. | Trade(SELL) 저장 후 |
| BR-003 | type = BUY인 경우 pnl 컬럼은 NULL로 저장한다. | Trade 저장 시 |
| BR-004 | is_public = TRUE 설정은 users.public_profile_enabled = TRUE인 경우에만 허용한다. | Trade 수정 시 |
| BR-005 | account_id가 soft-delete된 계좌를 참조하는 경우 trade 입력을 거부한다. | Trade 저장 전 |

### 6.3 주요 유스케이스 처리 흐름

#### UC-Trade-Create: 매매 기록 입력

```
Client → TradeController: POST /api/trades  {accountId, ticker, type, price, qty, ...}
TradeController → AuthFilter: JWT 검증
AuthFilter → TradeController: user_id 반환
TradeController → TradeService: createTrade(userId, dto)
TradeService → AccountRepository: findById(accountId) → 계좌 소유권 확인
TradeService → Trade(Domain): PnL 계산 (type=SELL인 경우)
TradeService → Trade(Domain): is_open 상태 결정
TradeService → TradeRepository: save(trade)
TradeRepository → DB: INSERT INTO trades ...
TradeService → TradeController: TradeResponse
TradeController → Client: 201 Created { tradeId, pnl, isOpen }
```

#### UC-Calendar-Get: 수익 캘린더 조회

```
Client → TradeController: GET /api/calendar?accountId=&year=&month=
TradeController → TradeService: getCalendar(userId, accountId, year, month)
TradeService → TradeRepository: sumPnlByDay(accountId, year, month)
  → SQL: SELECT DATE(traded_at), SUM(pnl) FROM trades
         WHERE account_id=? AND traded_at BETWEEN ? AND ?
         AND type='sell' GROUP BY DATE(traded_at)
TradeRepository → TradeService: List<{date, totalPnl}>
TradeService → TradeController: CalendarResponse
TradeController → Client: 200 OK { days: [{date, pnl, sign}] }
```

#### UC-Analysis-Strategy: 전략별 승률 분석

```
Client → AnalysisController: GET /api/analysis/strategy?accountId=
AnalysisController → AnalysisService: getStrategyStats(userId, accountId)
AnalysisService → TradeRepository: groupByStrategyTag(accountId)
  → SQL: SELECT strategy_tag,
           COUNT(*) AS total,
           SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) AS wins,
           AVG(pnl) AS avg_pnl
         FROM trades
         WHERE account_id=? AND type='sell'
         GROUP BY strategy_tag
AnalysisService → AnalysisController: List<StrategyStatDto>
AnalysisController → Client: 200 OK { strategies: [...] }
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
| DBMS | PostgreSQL 14+ | JSON 컬럼, 윈도우 함수, 전문 집계 함수 지원. 오픈소스 라이선스. |
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
    created_at             TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### accounts

```sql
CREATE TABLE accounts (
    id          BIGSERIAL     PRIMARY KEY,
    user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100)  NOT NULL,
    broker      VARCHAR(100)  NULL,
    currency    VARCHAR(10)   NOT NULL DEFAULT 'KRW',
    is_deleted  BOOLEAN       NOT NULL DEFAULT FALSE,  -- Soft Delete
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
```

#### trades ★ 핵심 테이블

```sql
CREATE TYPE trade_type AS ENUM ('buy', 'sell');

CREATE TABLE trades (
    id            BIGSERIAL       PRIMARY KEY,
    account_id    BIGINT          NOT NULL REFERENCES accounts(id),
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
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 조회·집계 성능을 위한 인덱스
CREATE INDEX idx_trades_account_id     ON trades(account_id);
CREATE INDEX idx_trades_traded_at      ON trades(traded_at DESC);
CREATE INDEX idx_trades_ticker         ON trades(ticker);
CREATE INDEX idx_trades_strategy_tag   ON trades(strategy_tag);
CREATE INDEX idx_trades_is_open        ON trades(is_open) WHERE is_open = TRUE;
CREATE INDEX idx_trades_is_public      ON trades(is_public) WHERE is_public = TRUE;
```

#### notes (오답 노트)

```sql
CREATE TABLE notes (
    id            BIGSERIAL    PRIMARY KEY,
    trade_id      BIGINT       NOT NULL UNIQUE REFERENCES trades(id) ON DELETE CASCADE,
    mistake_type  VARCHAR(100) NULL,
    content       TEXT         NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_trade_id ON notes(trade_id);
```

#### tags (사용자 정의 태그)

```sql
CREATE TYPE tag_type AS ENUM ('strategy', 'emotion');

CREATE TABLE tags (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(50)  NOT NULL,
    type        tag_type     NOT NULL,
    UNIQUE (user_id, name, type)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);
```

#### 분석용 DB View

```sql
-- 전략별 통계 뷰 (별도 테이블 없이 실시간 집계)
CREATE VIEW v_strategy_stats AS
SELECT
    t.account_id,
    t.strategy_tag,
    COUNT(*)                                              AS total_trades,
    SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END)          AS win_count,
    ROUND(SUM(CASE WHEN t.pnl > 0 THEN 1.0 ELSE 0 END)
          / NULLIF(COUNT(*), 0) * 100, 2)                AS win_rate_pct,
    ROUND(AVG(t.pnl), 2)                                 AS avg_pnl
FROM trades t
WHERE t.type = 'sell'
GROUP BY t.account_id, t.strategy_tag;

-- 날짜별 PnL 캘린더 뷰
CREATE VIEW v_daily_pnl AS
SELECT
    account_id,
    DATE(traded_at)  AS trade_date,
    SUM(pnl)         AS daily_pnl
FROM trades
WHERE type = 'sell'
GROUP BY account_id, DATE(traded_at);
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
| 설계 언어 | REST API 명세 (OpenAPI 스타일 텍스트 기술) |
| 관심사 | API 엔드포인트, 요청/응답 구조, 오류 처리, 인증 방식 |
| 이해관계자 | 프론트엔드 개발팀, 커뮤니티 서비스 개발팀, QA |

### 8.1 공통 규약

| 항목 | 규약 |
|---|---|
| Base URL | https://api.tradingjournal.example.com/v1 |
| 인증 | Authorization: Bearer {access_token}  (JWT, 만료 1시간) |
| Content-Type | application/json (요청·응답 모두) |
| 날짜 형식 | ISO 8601 — 예: 2025-04-08T09:30:00Z |
| 오류 응답 형식 | `{ "code": "ERR_CODE", "message": "설명", "details": {} }` |
| 페이지네이션 | GET 목록 조회: ?page=0&size=20 (0-indexed) |

### 8.2 인증 API

#### POST /auth/register — 회원가입

| 항목 | 내용 |
|---|---|
| 요청 Body | `{ "email": "string", "password": "string", "nickname": "string" }` |
| 응답 201 | `{ "userId": "uuid", "accessToken": "jwt", "refreshToken": "jwt" }` |
| 오류 409 | ERR_EMAIL_DUPLICATE — 이메일 중복 |

#### POST /auth/login — 로그인

| 항목 | 내용 |
|---|---|
| 요청 Body | `{ "email": "string", "password": "string" }` |
| 응답 200 | `{ "accessToken": "jwt", "refreshToken": "jwt", "expiresIn": 3600 }` |
| 오류 401 | ERR_INVALID_CREDENTIALS — 인증 실패 |

### 8.3 계좌 API

| 메서드 | 경로 | 설명 | 응답 |
|---|---|---|---|
| POST | /accounts | 계좌 생성 | 201 `{ accountId, name, broker, currency }` |
| GET | /accounts | 내 계좌 목록 조회 | 200 `{ accounts: [...] }` |
| PATCH | /accounts/{id} | 계좌 수정 | 200 `{ accountId, name }` |
| DELETE | /accounts/{id} | 계좌 삭제 (soft) | 204 No Content |

### 8.4 매매 API

#### POST /trades — 매매 기록 생성

| 항목 | 내용 |
|---|---|
| 요청 Body | `{ "accountId": Long, "ticker": "string", "name": "string", "type": "buy\|sell", "price": Decimal, "quantity": Decimal, "fee": Decimal, "tradedAt": DateTime, "strategyTag": "string?", "emotionTag": "string?", "memo": "string?", "isPublic": Boolean }` |
| 응답 201 | `{ "tradeId": Long, "pnl": Decimal\|null, "isOpen": Boolean }` |
| 오류 400 | ERR_INVALID_ACCOUNT — 계좌 미보유 또는 삭제됨 |
| 오류 403 | ERR_PUBLIC_NOT_ALLOWED — public_profile_enabled = FALSE인데 isPublic = TRUE 시도 |

#### GET /trades — 매매 히스토리 목록

| 항목 | 내용 |
|---|---|
| 쿼리 파라미터 | accountId, ticker, strategyTag, emotionTag, isOpen, dateFrom, dateTo, keyword, page, size |
| 응답 200 | `{ "total": Int, "page": Int, "trades": [{ tradeId, ticker, name, type, price, quantity, pnl, tradedAt, strategyTag, emotionTag, isOpen }] }` |

#### GET /calendar — 수익 캘린더

| 항목 | 내용 |
|---|---|
| 쿼리 파라미터 | accountId (필수), year (YYYY), month (1~12) |
| 응답 200 | `{ "year": Int, "month": Int, "days": [{ "date": "YYYY-MM-DD", "pnl": Decimal, "sign": "profit\|loss\|zero" }] }` |

### 8.5 분석 API

| 메서드 | 경로 | 설명 | 응답 요약 |
|---|---|---|---|
| GET | /analysis/strategy | 전략 태그별 승률·평균 PnL | `{ strategies: [{ tag, total, winRate, avgPnl }] }` |
| GET | /analysis/emotion | 감정 태그별 평균 PnL | `{ emotions: [{ tag, total, avgPnl }] }` |
| GET | /analysis/mistakes | 실수 유형별 집계 | `{ mistakes: [{ type, count }] }` |

### 8.6 오답 노트 API

| 메서드 | 경로 | 설명 | 응답 |
|---|---|---|---|
| POST | /trades/{id}/note | 오답 노트 생성 | 201 `{ noteId, mistakeType, content }` |
| GET | /trades/{id}/note | 오답 노트 조회 | 200 `{ noteId, mistakeType, content, createdAt }` |
| PATCH | /trades/{id}/note | 오답 노트 수정 | 200 `{ noteId }` |
| DELETE | /trades/{id}/note | 오답 노트 삭제 | 204 No Content |

### 8.7 커뮤니티 게이트웨이 API (메인 서비스 → 커뮤니티 서비스 제공)

> 아래 API는 커뮤니티 서비스가 Service Token으로 호출하는 전용 엔드포인트이다. 일반 사용자 JWT로는 접근 불가하다.

| 메서드 | 경로 | 설명 | 응답 요약 |
|---|---|---|---|
| GET | /community/users/{uuid}/profile | 공개 프로필 반환 | `{ uuid, nickname, createdAt }` |
| GET | /community/trades/{tradeId}/public | is_public=TRUE인 거래 요약 반환 | `{ tradeId, ticker, type, pnl, tradedAt, strategyTag }` |

---

## 9. 설계 결정 및 근거

IEEE 1016-2009는 주요 설계 결정과 그 근거를 명시하도록 요구한다.

| 결정 ID | 설계 결정 | 대안 | 선택 근거 |
|---|---|---|---|
| DD-001 | 분석·캘린더는 별도 집계 테이블 없이 DB View로 처리 | 별도 materialized table 사전 집계 | MVP 규모에서 실시간 집계 성능 충분. 테이블 수 최소화로 유지보수성 향상. 트래픽 증가 시 Materialized View로 전환 용이. |
| DD-002 | 커뮤니티 DB와 메인 DB 간 FK 제약 미설정 (Loose Coupling) | Cross-DB FK (일부 DBMS 지원) | 서비스 독립 배포·장애 격리 보장. 메인 DB 스키마 변경이 커뮤니티 DB를 깨지 않음. |
| DD-003 | MVP 단계 strategy_tag를 trades VARCHAR 컬럼에 직접 저장 | tags 테이블 FK 정규화 | 초기 개발 속도 우선. 고도화 단계에서 FK 마이그레이션 예정 (OI-001). |
| DD-004 | PK 전략: trades는 BIGSERIAL, users는 UUID | 전체 UUID PK | trades는 고빈도 INSERT — 순차 BIGSERIAL이 UUID 대비 인덱스 분산 최소화. users는 커뮤니티 연결 키이므로 UUID 필요. |
| DD-005 | 4-Tier Layered Architecture 적용 | Hexagonal (Ports & Adapters) | Hexagonal 대비 학습 곡선 낮고 소규모 팀에 적합. 레이어 경계로 테스트 가능성 충분히 확보 가능. |

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
