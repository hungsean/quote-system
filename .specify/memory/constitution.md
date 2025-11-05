<!--
SYNC IMPACT REPORT
===================
Version change: (initial) → 1.0.0
Added sections:
  - All 5 core principles for MVP development
  - Development Workflow (refactor-friendly)
  - Technology Stack constraints
Ratified: 2025-11-05
Last Amended: 2025-11-05
Files updated: constitution.md
Deferred items: None
-->

# Quote System Constitution

A high-velocity MVP governance document for the Quote System (報價系統) project. This constitution prioritizes **functional viability** and **iterative refinement** over backward compatibility. Refactoring is expected and encouraged at any time.

## Core Principles

### I. Function-First Development

Every feature MUST be implemented with immediate functionality as the primary goal. Simplicity, code aesthetics, and backward compatibility are secondary considerations. When in doubt, prioritize getting the feature working over architectural perfection. This MVP prioritizes **velocity over stability**.

### II. Aggressive Refactoring Culture

Refactoring MUST be treated as a first-class activity. Code is expected to evolve frequently without regard to maintaining prior interfaces or structures. Breaking changes are acceptable and do not require deprecation periods. All team members MUST embrace churn as a sign of healthy iteration.

### III. Minimal Testing Required (MVP Phase)

Unit tests and integration tests are OPTIONAL but encouraged if they accelerate development. Critical paths (auth, data persistence) benefit from basic smoke tests. Test-Driven Development is NOT mandated. Priority: Does it work? → Test if needed → Refactor.

### IV. Pragmatic Architecture

Architecture decisions MUST be justified by current needs, not future-proofing. Patterns like microservices, complex abstractions, or over-engineered generics are avoided unless solving an immediate problem. Monolithic Next.js app is the default; split only when necessary for deployment or team scaling.

### V. Rapid Iteration Over Perfection

Commit and deploy frequently (daily or more). Incomplete features are acceptable in feature branches. Code review focuses on functional correctness and safety, not style. Tech debt is documented but not blocked; velocity takes precedence.

## Technology Stack

**Mandatory** (locked):

- **Backend & Frontend**: Next.js 16+ (App Router)
- **Database**: PostgreSQL 16+
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js 5
- **Runtime**: Node.js 20+
- **Package Manager**: pnpm
- **Containerization**: Docker + Docker Compose

**Optional but recommended**:

- UI components: shadcn/ui (minimal, copy-paste only)
- Database client: `pg` (Node.js PostgreSQL driver)
- Password hashing: bcryptjs

Do not introduce competing tools (e.g., Prisma vs. raw SQL, next/link vs. router) without explicit constitutional amendment.

## Development Workflow

1. **Feature Branches**: All work MUST be on a non-main branch (e.g., `feature/*, fix/*, refactor/*`).
2. **Frequent Commits**: Commit at least daily; atomic commits encouraged.
3. **Code Review**: PRs MUST pass CI (if applicable) and demonstrate functional correctness. Style discussions should be minimal.
4. **No Deprecation Period**: Breaking changes do not require a deprecation phase. Update callers immediately in the same PR or follow-up.
5. **Documentation**: Update README.md and `.specify/` artifacts after significant changes. Inline code comments OPTIONAL.
6. **Testing Gate**: If a feature has existing tests, new code MUST not regress them. New features MAY add tests if beneficial; none required by default.
7. **Deployment**: Merge to `main` → auto-deploy (Docker) or manual deploy on demand. Fast iteration is valued; hotfixes acceptable.

## Governance

**Amendment Process**:

- Amendments to this constitution MUST be made via PR and approved by maintainers.
- Minor clarifications (typos, wording) use PATCH versions.
- New principles or changed behavior use MINOR or MAJOR versions.
- Retroactive compliance enforcement is NOT required; this constitution applies going forward.

**Compliance Review**:

- Constitution principles are checked during code review. Obvious violations (e.g., ignoring the tech stack) SHOULD be flagged.
- Pragmatism takes precedence: if a violation enables the feature to ship faster, document it and proceed.

**Tooling Guidance**:

- `.specify/` artifacts (spec.md, tasks.md, plan.md) MUST reference this constitution when defining scope or task priorities.
- Use `pnpm run <script>` for development tasks (see `package.json`).
- Docker Compose is the standard local dev environment (`pnpm docker:up`).

**Version Policy**:

- Version format: MAJOR.MINOR.PATCH (semantic versioning).
- MAJOR: Backward-incompatible principle redefinition or tech stack removal.
- MINOR: New principle, new mandatory tool, or materially expanded guidance.
- PATCH: Clarifications, wording, non-semantic refinements.

---

**Version**: 1.0.0 | **Ratified**: 2025-11-05 | **Last Amended**: 2025-11-05
