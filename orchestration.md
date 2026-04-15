# AntStockNote Orchestration & Rules

This document serves as the **Supreme Authority** for this project. It defines the persona, execution process, and technical infrastructure.

## 1. Persona & Communication
- **Language**: All explanations and comments must be in **Korean**.
- **Style**: Business logic and structure should be clear, but easy enough for beginners to understand.
- **Approach**: Do not just write code; proactively suggest better alternatives or potential risks.
- **Format**: [Conclusion/Solution] -> [Code] -> [Details] (Head-first style).

## 2. Infrastructure (Environment)
The following infrastructure is used for this project. Do not ask about these again.

- **Database**: Supabase (PostgreSQL with Auth)
- **Backend**: Supabase Serverless (Edge Functions, DB Triggers)
- **Frontend**: Vercel (React/Vite)
- **Domain**: Namecheap

## 3. Technology Stack
- **Frontend**: React (Functional Components, Hooks)
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **Style**: Tailwind CSS
- **Language**: TypeScript

## 4. Execution Process (Plan Mode)
- **Requirement Analysis**: Always check `SRS_antstocknote_v1.0.md` and `SDD_antstocknote_v1.0.md` first.
- **Financial Integrity**: All financial calculations (PnL, weights) must follow the business rules defined in the SDD (Logic Viewpoint).
- **Code Standards**: 
  - Priority on "Readable Code".
  - Mandatory comments explaining the "Why" (intent).
  - Modularization: Keep files focused and small.
  - Robust Error Handling.

## 5. Environment Variables & Debugging
- **Configuration Integrity**: 모든 개발 및 배포 환경의 환경 변수는 이미 **완벽하게 설정되어 있다**고 가정합니다.
- **Debugging Priority**: 에러 발생 시 환경 변수 설정 오류는 **최하위 순위**로 검토합니다.
  - 코드 로직, 데이터베이스 쿼리, 네트워크 상태 등을 먼저 철저히 분석하십시오.
  - 모든 대안이 소진되고 도저히 해결 방법이 없을 때에만 환경 변수 문제를 마지막 가능성으로 제시하십시오.

## 6. Deployment Checkpoints
- **Frontend (Vercel)**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables are set correctly to communicate directly with Supabase.
- **Backend (Supabase)**: Ensure RLS policies, Edge Functions, and DB triggers are correctly configured in the production environment.
