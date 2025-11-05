# Implementation Plan: MVP Core - 登入、註冊與估價系統

**Branch**: `001-mvp-core` | **Date**: 2025-11-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-mvp-core/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

MVP Core implements the foundational user authentication and product quotation system. Users can register/login, add products with unit prices, and generate quotes (quantity × unit_price). The system stores quote history with user data isolation. Built on Next.js 16+ with PostgreSQL for persistent storage and NextAuth.js for session management.

## Technical Context

**Language/Version**: TypeScript + Node.js 20+, Next.js 16+ (App Router)
**Primary Dependencies**: NextAuth.js 5, Tailwind CSS v4, shadcn/ui (optional), bcryptjs
**Storage**: PostgreSQL 16+, `pg` Node.js driver
**Testing**: Basic smoke tests for critical paths (auth, data persistence); full TDD not required
**Target Platform**: Web (browser), Linux/Docker deployment
**Project Type**: Monolithic Next.js web application (single codebase)
**Performance Goals**: <2s response time for all user interactions (login, add product, quote)
**Constraints**: Support 100 concurrent users without performance degradation
**Scale/Scope**: Initial MVP for ~100 concurrent users; simple 3-entity domain (User, Product, Quote)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**✅ All constitution gates PASSED**:

1. **Technology Stack Compliance**: Next.js 16+, PostgreSQL 16+, NextAuth.js 5, Tailwind CSS v4 — all mandatory per constitution.
2. **Monolithic Architecture**: Single Next.js app (no microservices splitting); justified by "initial MVP" scope.
3. **Testing Pragmatism**: Basic smoke tests only; full TDD not mandated per MVP phase principle.
4. **Rapid Iteration Culture**: Feature branches (001-mvp-core) with atomic commits encouraged; refactoring expected.
5. **Minimal Over-Engineering**: No repository pattern, ORM abstraction, or advanced async patterns; raw `pg` driver for simplicity.

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
# Monolithic Next.js App (Option 2: Web application)

app/                              # Next.js App Router
├── (auth)/
│   ├── login/
│   │   └── page.tsx             # Login form + session handling
│   └── register/
│       └── page.tsx             # Registration form
├── (dashboard)/
│   ├── layout.tsx               # Protected dashboard layout
│   ├── page.tsx                 # Dashboard (products + quotes overview)
│   ├── products/
│   │   ├── page.tsx             # Product list
│   │   └── add/
│   │       └── page.tsx         # Add product form
│   ├── quote/
│   │   ├── page.tsx             # New quote form (select product, enter qty)
│   │   └── [quoteId]/
│   │       └── page.tsx         # Quote detail view
│   └── history/
│       └── page.tsx             # Quote history list
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts         # NextAuth.js config
│   ├── products/
│   │   ├── route.ts             # GET, POST /api/products
│   │   └── [id]/
│   │       └── route.ts         # GET /api/products/[id]
│   ├── quotes/
│   │   ├── route.ts             # GET, POST /api/quotes
│   │   └── [id]/
│   │       └── route.ts         # GET /api/quotes/[id]
│   └── users/
│       └── register/
│           └── route.ts         # POST /api/users/register
├── layout.tsx                   # Root layout
└── page.tsx                     # Home / redirect logic

lib/
├── db.ts                        # PostgreSQL connection pool
├── auth.ts                      # Auth utils (bcrypt, JWT, session)
├── queries/
│   ├── users.ts                 # User CRUD
│   ├── products.ts              # Product CRUD
│   └── quotes.ts                # Quote CRUD
└── types.ts                     # Shared TypeScript types

components/
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── products/
│   ├── ProductForm.tsx
│   └── ProductList.tsx
├── quotes/
│   ├── QuoteForm.tsx
│   └── QuoteHistoryList.tsx
└── shared/
    ├── Navigation.tsx
    └── ...

tests/
├── unit/
│   ├── queries/                 # Database query tests
│   └── lib/                     # Auth, validation tests
├── integration/
│   └── api/                     # API route tests
└── contract/
    └── api-contracts.test.ts    # OpenAPI contract tests

public/                          # Static assets
├── favicon.ico
└── ...

.env.local                       # Environment variables (gitignored)
package.json
tsconfig.json
tailwind.config.js
next.config.js
docker-compose.yml               # Local PostgreSQL + app
Dockerfile
```

**Structure Decision**: Monolithic Next.js App Router with colocated database queries (`lib/queries/`), API routes, and UI components. All auth/products/quotes logic integrated in a single codebase. Tests organized by layer (unit, integration, contract).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
