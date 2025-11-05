# Implementation Plan: MVP Core - 登入、註冊與估價系統

**Branch**: `001-mvp-core` | **Date**: 2025-11-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mvp-core/spec.md`

**Note**: This plan is filled in by the `/speckit.plan` command.

## Summary

實現一個最低限度的 MVP 報價系統，包括用戶認證（註冊/登入）、商品管理和基於簡單公式的估價功能。系統使用 Next.js 16 + PostgreSQL + NextAuth.js 5，採用單一 monolithic 應用架構。估價邏輯基於商品屬性（名稱、描述、類別），結果以新台幣（NT$）顯示。

## Technical Context

**Language/Version**: TypeScript + Node.js 20+ (Next.js 16 App Router)
**Primary Dependencies**:
  - Next.js 16+ (unified frontend + backend)
  - NextAuth.js 5 (authentication)
  - PostgreSQL 16+ (database)
  - Tailwind CSS v4 (styling)
  - shadcn/ui (optional UI components)
  - bcryptjs (password hashing)
  - pg (PostgreSQL client)

**Storage**: PostgreSQL 16+ (relational database for Users, Products, Quotes)
**Testing**: Jest + React Testing Library (optional but recommended for critical paths like auth)
**Target Platform**: Web (browser-based, modern Chrome/Firefox/Safari/Edge)
**Project Type**: Web application (monolithic Next.js 16, no frontend/backend split for MVP)
**Performance Goals**:
  - Response time ≤ 2 seconds for all user interactions (SC-005)
  - Support 100 concurrent users without degradation (SC-007)
  - Page load < 3 seconds

**Constraints**:
  - MVP phase: Function-first, minimal testing required (per Constitution)
  - Single deployment artifact (Docker container)
  - Local dev via Docker Compose
  - No mobile app (web only)

**Scale/Scope**:
  - 100 concurrent users (MVP phase)
  - ~5 main UI pages (login, register, product list, quote form, quote history)
  - 3 main data entities: User, Product, Quote
  - ~14 API endpoints (REST)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **PASS**: All decisions aligned with Quote System Constitution v1.0.0

| Principle | Status | Notes |
|-----------|--------|-------|
| Function-First Development | ✅ PASS | 優先 MVP 功能實現，後續可優化 |
| Aggressive Refactoring Culture | ✅ PASS | 預期代碼會隨迭代演進 |
| Minimal Testing (MVP Phase) | ✅ PASS | 關鍵路徑（認證、持久化）可新增基礎測試，非強制 |
| Pragmatic Architecture | ✅ PASS | Monolithic Next.js，無微服務，無過度工程 |
| Rapid Iteration | ✅ PASS | 日常提交，不阻止未完成功能 |
| Technology Stack Compliance | ✅ PASS | 使用：Next.js 16+ (✓), PostgreSQL (✓), NextAuth.js 5 (✓), Tailwind v4 (✓), Node.js 20+ (✓), pnpm (✓) |

**No violations. Plan proceeds to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js 16 Monolithic Web App
src/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                   # Auth route group (login, register)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (app)/                    # Protected routes (authenticated users)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Product list + quote form
│   │   ├── products/
│   │   │   ├── page.tsx          # List products
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Product detail
│   │   ├── quotes/
│   │   │   ├── page.tsx          # Quote history
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Quote detail
│   │   ├── layout.tsx            # Protected layout (session check)
│   │   └── loading.tsx
│   ├── api/                      # API routes (server actions + endpoints)
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── products/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   └── [id]/route.ts     # GET (detail)
│   │   └── quotes/
│   │       ├── route.ts          # GET (list), POST (create)
│   │       └── [id]/route.ts     # GET (detail)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home (redirect to login or dashboard)
│
├── components/                   # Reusable UI components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── products/
│   │   ├── ProductForm.tsx
│   │   └── ProductList.tsx
│   ├── quotes/
│   │   ├── QuoteForm.tsx
│   │   └── QuoteList.tsx
│   └── common/
│       ├── Header.tsx
│       └── Navigation.tsx
│
├── lib/                          # Utilities
│   ├── db.ts                     # PostgreSQL connection (pg)
│   ├── auth.ts                   # NextAuth.js config
│   ├── quote-engine.ts           # Quote calculation logic
│   └── validation.ts             # Form validation helpers
│
├── types/                        # TypeScript types
│   ├── user.ts
│   ├── product.ts
│   └── quote.ts
│
└── styles/                       # Global styles
    └── globals.css               # Tailwind imports

tests/
├── unit/
│   ├── quote-engine.test.ts
│   └── validation.test.ts
├── integration/
│   ├── auth.test.ts
│   └── products.test.ts
└── e2e/
    └── user-flows.test.ts

# Configuration files
.env.local                        # Database URL, auth secrets (git-ignored)
docker-compose.yml                # PostgreSQL + app
Dockerfile                        # Container image
package.json                      # pnpm scripts
tsconfig.json                     # TypeScript config
next.config.js                    # Next.js config
tailwind.config.js                # Tailwind config
```

**Structure Decision**: Single monolithic Next.js 16 application (App Router) with co-located backend API routes and frontend components. No frontend/backend separation for MVP. Database: PostgreSQL via `pg` client. Authentication: NextAuth.js 5 with email+password provider.

## Complexity Tracking

✅ No violations to justify. Constitution fully satisfied.

---

# Phase 0: Research & Analysis

## Overview

Phase 0 解決技術上的不確定性，通過研究最佳實踐並驗證設計決策。

## Known Issues to Research

Currently all major decisions are defined by Constitution and Clarifications. However, we need research on:

1. **Quote Calculation Algorithm**: Implement simple formula based on product attributes (name, description, category)
2. **NextAuth.js 5 Integration with PostgreSQL**: Verify session + adapter setup
3. **Tailwind CSS v4 Best Practices**: CSS structure for Next.js 16
4. **Testing Strategy for MVP**: Minimal tests for critical paths

## Phase 0 Deliverables

- `research.md` (generated after Phase 0)
- Technology decisions confirmed
- Architectural risks mitigated

---

# Phase 1: Design & Contracts

## 1. Data Model (data-model.md)

**Entities**:

### User
- id (UUID, primary key)
- email (VARCHAR, unique, required)
- passwordHash (VARCHAR, required)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)

### Product
- id (UUID, primary key)
- userId (UUID, foreign key → User)
- name (VARCHAR, required)
- description (TEXT, required)
- category (VARCHAR, required)  # e.g., "電子產品", "傢俱", "衣物"
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)

### Quote
- id (UUID, primary key)
- productId (UUID, foreign key → Product)
- userId (UUID, foreign key → User)
- quoteValue (INTEGER, in cents for NT$)  # e.g., 9999 = NT$99.99
- calculatedAt (TIMESTAMP)
- createdAt (TIMESTAMP)

**Relationships**:
- User → Products (1:N)
- User → Quotes (1:N)
- Product → Quotes (1:N)

## 2. API Contracts

**Authentication Endpoints**:

### POST /api/auth/register
```json
Request: { email, password }
Response: { userId, email, sessionToken? }
Errors: 400 (email exists), 422 (invalid password)
```

### POST /api/auth/login
```json
Request: { email, password }
Response: { userId, email, sessionToken? }
Errors: 401 (invalid credentials), 404 (user not found)
```

### GET /api/auth/logout
```
Response: 204 No Content
```

**Product Endpoints**:

### GET /api/products
```json
Response: [ { id, name, description, category, createdAt } ]
Query: limit, offset (pagination)
Auth: Required
```

### POST /api/products
```json
Request: { name, description, category }
Response: { id, name, description, category, createdAt }
Errors: 400 (missing fields), 422 (invalid data)
Auth: Required
```

### GET /api/products/[id]
```json
Response: { id, name, description, category, createdAt }
Errors: 404 (product not found)
Auth: Required
```

**Quote Endpoints**:

### GET /api/quotes
```json
Response: [ { id, productId, quoteValue, calculatedAt, createdAt } ]
Query: limit, offset
Auth: Required
```

### POST /api/quotes
```json
Request: { productId }
Response: { id, productId, quoteValue, calculatedAt }
Errors: 404 (product not found), 422 (calculation error)
Auth: Required
Logic: Calculate quoteValue = simple_formula(product attributes)
```

### GET /api/quotes/[id]
```json
Response: { id, productId, quoteValue, product: { ... }, calculatedAt }
Errors: 404
Auth: Required
```

## 3. Quote Calculation Algorithm

**Simple Formula** (based on Clarification Q1):

```
basePrice = 100 (NT$1.00 = 100 cents)
categoryMultiplier = { "電子產品": 3.0, "傢俱": 1.5, "衣物": 0.8, default: 1.0 }
nameLength = length(name)
descLength = length(description)

quoteValue = basePrice * categoryMultiplier * (1 + (nameLength + descLength) / 100)
roundUp to nearest 10 cents
```

Example:
- Product: name="手機", description="二手iPhone 13", category="電子產品"
- Calculation: 100 * 3.0 * (1 + (4+15)/100) = 300 * 1.19 = 357 cents = NT$3.57

## 4. Quickstart Guide (quickstart.md)

Generated in Phase 1 output.

## 5. Update Agent Context

Run `.specify/scripts/bash/update-agent-context.sh claude` to register:
- Tech stack (Next.js 16, PostgreSQL, NextAuth.js 5)
- Project structure
- Quote calculation logic
- Database schema

---

# Phase 2: Task Decomposition

**Note**: Phase 2 is executed by `/speckit.tasks` command, NOT `/speckit.plan`.

Phase 2 will:
1. Break down Phase 1 design into actionable tasks
2. Define dependencies and parallelization opportunities
3. Output `tasks.md` with numbered, prioritized tasks
4. Assign story points or time estimates

---

# Summary of Outputs

| Phase | Output | Status |
|-------|--------|--------|
| 0 | research.md | Pending (Phase 0 workflow) |
| 1 | data-model.md | Pending (Phase 1 workflow) |
| 1 | contracts/*.md | Pending (Phase 1 workflow) |
| 1 | quickstart.md | Pending (Phase 1 workflow) |
| 1 | agent-context update | Pending (Phase 1 workflow) |
| 2 | tasks.md | Pending (/speckit.tasks) |

**Next Step**: Execute Phase 0 research by running agents to resolve unknowns, then proceed to Phase 1 design.
