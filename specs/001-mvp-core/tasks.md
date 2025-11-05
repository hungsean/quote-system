# Implementation Tasks: MVP Core - 登入、註冊與估價系統

**Phase 2 Output** | **Date**: 2025-11-05 | **Status**: MVP Core Implementation In Progress

---

## Overview

This document provides a detailed, executable task breakdown for implementing the Quote System MVP Core. Tasks are organized by phase and user story, with each task following a strict checklist format to enable independent execution.

**Total Tasks**: 90 | **Completed**: 49 | **Remaining**: 41

**Setup & Foundation (Phase 1-2)**: 22/22 ✓ COMPLETE
**User Story 1 (Registration - P1)**: 10/13 (77%)
**User Story 2 (Login - P1)**: 9/12 (75%)
**User Story 3 (Product Management - P1)**: 12/15 (80%)
**User Story 4 (Quotation - P2)**: 2/12 (17%)
**User Story 5 (Quote History - P2)**: 0/5 (0%)
**Polish & Integration**: 0/11 (0%)

---

## Implementation Strategy

### Scope Management

**MVP Scope (Recommended)**: Complete User Stories 1-3
- User registration (US1)
- User login (US2)
- Product management (US3)
- **Time Estimate**: 3-5 weeks

**Extended Scope**: Add User Stories 4-5
- Quotation system (US4)
- Quote history (US5)

### Development Workflow

1. **Complete Phase 1-2 sequentially** (setup, one-time only)
2. **Per user story**: Implement after Phase 2 foundation is complete

---

## Phase 1: Project Setup & Dependencies

---

### Setup Tasks

- [x] T001 Initialize Next.js 16 project with TypeScript, App Router, Tailwind CSS v4, ESLint configuration in project root

- [x] T002 Create PostgreSQL Docker Compose configuration in `docker-compose.yml` with PostgreSQL 16 service, initialization volume, and port mapping

- [x] T003 Create database migration SQL in `migrations/001_init_schema.sql` with UUID extension, users, products, quotes tables, foreign keys, and indexes

- [x] T004 Create environment variable template in `.env.example` with DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, NODE_ENV variables

- [x] T005 Configure TypeScript in `tsconfig.json` with strict mode enabled, path alias `@/*` pointing to app root, module resolution options

- [x] T006 [P] Install core npm dependencies: next-auth@5, bcryptjs, pg, zod, @tailwindcss/postcss, shadcn/ui in package.json

- [x] T007 [P] Create `.gitignore` to exclude `.env.local`, `.next/`, `node_modules/`, `dist/`, `.env`

- [x] T008 Create directory structure: `app/`, `lib/`, `components/`, `tests/`, `migrations/`, `public/` per plan.md structure

---

## Phase 2: Foundational Infrastructure (Blocking Prerequisites)

Core systems that all user stories depend on.

### Database & Connection

- [x] T009 Implement PostgreSQL connection pool in `lib/db.ts` using pg Pool with error handling, graceful shutdown, timeout configuration

- [x] T010 Create database health check function in `lib/db.ts` to verify connection on startup

### Authentication Setup

- [x] T011 Implement password hashing utilities in `lib/password.ts`: hashPassword(password) and verifyPassword(password, hash) using bcryptjs with cost factor 10

- [x] T012 Configure NextAuth.js in `lib/auth.ts` with CredentialsProvider, JWT session strategy, 30-day expiry, handleAuth export

- [x] T013 Create NextAuth.js API route in `app/api/auth/[...nextauth]/route.ts` with handlers export from lib/auth.ts

### Types & Validations

- [x] T014 [P] Define TypeScript interfaces in `lib/types.ts` for User, Product, Quote entities matching data-model.md

- [x] T015 [P] Create Zod validation schemas in `lib/validations/auth.ts` for registerSchema and loginSchema with email/password rules

- [x] T016 [P] Create Zod validation schemas in `lib/validations/product.ts` for createProductSchema with name, description, category, unit_price validation rules

### Database Query Layer

- [x] T017 [P] Implement User query functions in `lib/queries/users.ts`: getByEmail(email), create(email, passwordHash), verify(email, password)

- [x] T018 [P] Implement Product query functions in `lib/queries/products.ts`: getByUser(userId), create(data), getById(id, userId), delete(id, userId)

- [x] T019 [P] Implement Quote query functions in `lib/queries/quotes.ts`: getByUser(userId), create(data), getById(id, userId)

### Root Layout & Navigation

- [x] T020 Create root layout in `app/layout.tsx` with global Tailwind styles, font imports, metadata, html/body structure

- [x] T021 [P] Create navigation component in `components/shared/Navigation.tsx` with auth-aware links: login, register, dashboard, logout

- [x] T022 Create home page in `app/page.tsx` that redirects: authenticated users → /dashboard, non-authenticated → /login

---

## Phase 3: User Story 1 - User Registration (13 tasks)

Enable new users to create accounts with email and password validation.

**Story Goal**: New users can register accounts with validated credentials

**Independent Test Criteria**:
- Fill registration form (email, password) → system creates account
- Duplicate email → 409 error displayed
- Weak password → validation error displayed
- Successful registration → can login with new credentials

### Database & Services

- [x] T023 [US1] Implement user creation logic in `lib/queries/users.ts`: createUser(email, passwordHash) inserts to database with UUID, created_at

### API Routes

- [x] T024 [US1] Implement POST /api/auth/register in `app/api/auth/register/route.ts`:
  - Validate input with registerSchema from validations/auth.ts
  - Check email uniqueness (query users table)
  - Hash password with hashPassword()
  - Insert user via createUser()
  - Return 201 with {id, email} or 400/409 errors

### UI Components

- [x] T025 [P] [US1] Create RegisterForm component in `components/auth/RegisterForm.tsx`:
  - Email input with type="email"
  - Password input with strength indicator
  - Confirm password input
  - Submit button with loading state
  - Field-level error messages
  - Link to login page

- [x] T026 [P] [US1] Create auth layout in `app/(auth)/layout.tsx` with centered container, no auth requirement, navigation link to login

### Pages

- [x] T027 [US1] Create registration page in `app/(auth)/register/page.tsx`:
  - RegisterForm component
  - Link to login page
  - Success/error message display
  - Redirect to login after successful registration

### Form Validation

- [x] T028 [US1] Implement client-side email validation in RegisterForm using HTML5 type="email" + regex pattern for RFC 5322

- [x] T029 [US1] Implement password strength validator in RegisterForm showing requirements: 8+ chars, uppercase, lowercase, digit

- [x] T030 [US1] Implement server-side duplicate email check in POST /api/auth/register endpoint (query users WHERE email = ?)

- [x] T031 [US1] Implement password hashing verification: ensure password_hash in database never contains plain text

- [x] T032 [US1] Add error message display for: duplicate email (409), weak password, validation errors

- [ ] T033 [US1] Test registration happy path: fill form → submit → redirect to login → can login with new account

- [ ] T034 [US1] Test duplicate email rejection: try registering with existing email → show "email already registered" error

- [ ] T035 [US1] Test password validation: try registering with weak password → show specific validation error for each requirement

---

## Phase 4: User Story 2 - User Login (12 tasks)

Enable registered users to log in and maintain sessions.

**Story Goal**: Registered users can log in and maintain authenticated sessions across page navigations

**Independent Test Criteria**:
- Valid credentials → login succeeds, redirect to dashboard
- Invalid password → 401 error with "invalid email or password"
- Session persists across page refresh
- Logout clears session, redirects to login

### Services

- [x] T036 [US2] Implement login authentication in `lib/password.ts`: verifyPassword(password, hash) compares bcryptjs hashes

- [x] T037 [P] [US2] Implement NextAuth.js session configuration in `lib/auth.ts`:
  - CredentialsProvider with email/password verification
  - JWT session strategy with 30-day expiry
  - Callback to include user.id in token

### API Routes

- [x] T038 [US2] Implement POST /api/auth/login in `app/api/auth/login/route.ts`:
  - Validate credentials schema
  - Query user by email
  - Verify password with verifyPassword()
  - Create session (NextAuth handles this)
  - Return 200 with {user: {id, email}} or 401 errors

### UI Components

- [x] T039 [P] [US2] Create LoginForm component in `components/auth/LoginForm.tsx`:
  - Email input
  - Password input
  - Submit button
  - Error message display
  - Loading state during submission
  - Link to register page

### Pages & Layout

- [x] T040 [US2] Create login page in `app/(auth)/login/page.tsx`:
  - LoginForm component
  - Link to register page
  - Error message display
  - Redirect to dashboard after successful login

- [x] T041 [P] [US2] Create protected app layout in `app/(dashboard)/layout.tsx`:
  - Check for active session
  - Redirect unauthenticated users to /login
  - Navigation header with logout button
  - Sidebar/menu for dashboard routes

- [x] T042 [P] [US2] Create dashboard home page in `app/(dashboard)/page.tsx`:
  - Welcome message with user email
  - Quick links to products, quotes, history
  - Basic dashboard statistics (optional)

### Session Management

- [x] T043 [US2] Create logout route in `app/api/auth/logout/route.ts` that:
  - Clears NextAuth session
  - Redirects to /login

- [ ] T044 [US2] Test session persistence: login → refresh page → session still active, no need to re-login

- [ ] T045 [US2] Test logout: logout → redirected to login → cannot access /dashboard without logging in again

- [ ] T046 [US2] Verify unauthenticated access blocked: try accessing /dashboard without session → redirect to /login

- [ ] T047 [US2] Test invalid credentials: wrong password → 401 error displayed to user

---

## Phase 5: User Story 3 - Product Management (15 tasks)

Enable users to add products and view their catalog.

**Story Goal**: Authenticated users can create products and view their product list

**Independent Test Criteria**:
- Authenticated user creates product (name, description, category, unit_price) → product saved to database
- Product appears in product list
- User can only see their own products
- Product list sorted by creation date (newest first)

### Database & Services

- [x] T048 [P] [US3] Implement product creation in `lib/queries/products.ts`: createProduct(userId, data) inserts to products table with all required fields

- [x] T049 [US3] Implement product validation in `lib/validations/product.ts`:
  - Name: 1-255 characters
  - Description: 1-2000 characters
  - Category: 1-100 characters, required
  - Unit price: > 0, stored as DECIMAL(10, 2)

### API Routes

- [x] T050 [US3] Implement GET /api/products in `app/api/products/route.ts`:
  - Verify session exists
  - Query products WHERE user_id = session.user.id ORDER BY created_at DESC
  - Return 200 with products array or 401 if unauthorized

- [x] T051 [US3] Implement POST /api/products in `app/api/products/route.ts`:
  - Verify session exists
  - Validate body with createProductSchema
  - Insert product with user_id from session
  - Return 201 with new product or 400/401 errors

- [x] T052 [P] [US3] Implement GET /api/products/[id] in `app/api/products/[id]/route.ts`:
  - Verify session exists
  - Query product WHERE id = [id] AND user_id = session.user.id
  - Return 200 with product or 404/401 errors

### UI Components

- [x] T053 [P] [US3] Create ProductForm component in `components/products/ProductForm.tsx`:
  - Name input field (text, max 255)
  - Description textarea (max 2000)
  - Category select dropdown
  - Unit price input (decimal, positive)
  - Submit button
  - Form validation feedback
  - Error message display

- [x] T054 [P] [US3] Create ProductList component in `components/products/ProductList.tsx`:
  - Display products in grid or list view
  - Show: name, category, unit_price per product
  - Link to product detail or delete
  - Empty state message if no products

- [x] T055 [P] [US3] Create CategorySelect component in `components/products/CategorySelect.tsx`:
  - Dropdown with predefined categories: Furniture, Electronics, Office Supplies, etc.

### Pages

- [x] T056 [US3] Create products list page in `app/(dashboard)/products/page.tsx`:
  - Fetch products from GET /api/products
  - Display ProductList component
  - "Add Product" button linking to /dashboard/products/add
  - Loading state while fetching

- [x] T057 [US3] Create add product page in `app/(dashboard)/products/add/page.tsx`:
  - ProductForm component
  - Submit to POST /api/products
  - Success: show confirmation, redirect to products list
  - Error: display error message

- [x] T058 [P] [US3] Create product detail page in `app/(dashboard)/products/[id]/page.tsx`:
  - Fetch product from GET /api/products/[id]
  - Display product name, description, category, unit_price
  - Delete button (optional for MVP)
  - Back button to products list

### Testing & Validation

- [ ] T059 [US3] Test product creation: fill form with all required fields → submit → product appears in list

- [ ] T060 [US3] Test form validation: submit empty name → show "name is required" error

- [ ] T061 [US3] Test unit price validation: submit negative price → show "price must be positive" error

- [ ] T062 [US3] Test authorization: User A tries to access User B's products → 404 or cannot view

---

## Phase 6: User Story 4 - Quotation System (12 tasks)

Enable users to generate price quotes for products.

**Story Goal**: Authenticated users can create quotes for products and view calculated results

**Independent Test Criteria**:
- User selects product and enters quantity → system calculates quote_value (unit_price × quantity)
- Quote displayed in NT$ format (e.g., NT$50,000)
- Quote saved to database with immutable value
- User can view quote detail

### Database & Services

- [x] T063 [P] [US4] Implement quote creation in `lib/queries/quotes.ts`: createQuote(userId, productId, quantity) calculates quote_value = product.unit_price × quantity

- [x] T064 [US4] Implement quote calculation logic in `lib/quotes.ts` or similar:
  - Function: calculateQuoteValue(unitPrice: Decimal, quantity: number): Decimal
  - Formula: unitPrice × quantity
  - Return DECIMAL(10, 2) precision

### API Routes

- [x] T065 [US4] Implement POST /api/quotes in `app/api/quotes/route.ts`:
  - Verify session exists
  - Validate product_id and quantity
  - Verify product exists and belongs to user
  - Calculate quote_value = product.unit_price × quantity
  - Insert quote with user_id from session
  - Return 201 with new quote or 400/404/401 errors

- [x] T066 [US4] Implement GET /api/quotes in `app/api/quotes/route.ts`:
  - Verify session exists
  - Query quotes WITH product details WHERE user_id = session.user.id ORDER BY created_at DESC
  - Return 200 with quotes array or 401 if unauthorized

- [x] T067 [P] [US4] Implement GET /api/quotes/[id] in `app/api/quotes/[id]/route.ts`:
  - Verify session exists
  - Query quote WITH product details WHERE id = [id] AND user_id = session.user.id
  - Return 200 with quote or 404/401 errors

### UI Components

- [x] T068 [P] [US4] Create QuoteForm component in `components/quotes/QuoteForm.tsx`:
  - Product select (populated from GET /api/products)
  - Display selected product: name, category, unit_price
  - Quantity input (integer, min 1)
  - Real-time calculation display: unit_price × quantity = quote_value
  - Submit button

- [x] T069 [P] [US4] Create currency formatter in `lib/currency.ts`:
  - Function: formatTWD(amount: number): string returning "NT$X,XXX" format

- [x] T070 [P] [US4] Create QuoteResult component in `components/quotes/QuoteResult.tsx`:
  - Display quote details: product name, quantity, unit_price
  - Show calculation: unit_price × quantity = quote_value (in NT$ format)

### Pages

- [x] T071 [US4] Create quote creation page in `app/(dashboard)/quote/page.tsx`:
  - QuoteForm component
  - Submit to POST /api/quotes
  - Success: show QuoteResult component, option to create another
  - Error: display validation or product not found error

### Testing & Validation

- [ ] T072 [US4] Test quote calculation: 100 units × NT$500 = NT$50,000

- [ ] T073 [US4] Test quantity validation: quantity 0 → show "quantity must be at least 1" error

- [ ] T074 [US4] Test product not found: attempt to quote non-existent product → 404 error

- [ ] T075 [US4] Verify quote_value stored in database matches calculation

---

## Phase 7: User Story 5 - Quote History (5 tasks)

Enable users to browse and review past quotes.

**Story Goal**: Users can view all past quotes in a sortable, filterable history

**Independent Test Criteria**:
- Multiple quotes created → history displays all quotes
- Quotes sorted by creation date (newest first)
- User can click quote to view detail
- Empty state message when no quotes

### API Routes

- [x] T076 [P] [US5] Update GET /api/quotes to support pagination:
  - Accept limit and offset query parameters
  - Return paginated results with total count

### UI Components

- [x] T077 [P] [US5] Create QuoteList component in `components/quotes/QuoteList.tsx`:
  - Display quotes in table or list format
  - Columns: Date, Product Name, Quantity, Quote Value (NT$)
  - Link to quote detail
  - Pagination controls (optional)
  - Empty state: "No quotes yet" message

### Pages

- [x] T078 [US5] Create quote history page in `app/(dashboard)/history/page.tsx`:
  - Fetch quotes from GET /api/quotes (with pagination if implemented)
  - Display QuoteList component
  - Show "No quotes yet" if empty

- [x] T079 [P] [US5] Create quote detail page in `app/(dashboard)/quote/[id]/page.tsx`:
  - Fetch quote from GET /api/quotes/[id]
  - Display full quote with product details
  - Show calculation: unit_price × quantity = quote_value
  - Back button to history

### Testing & Validation

- [ ] T080 [US5] Test history display: create multiple quotes → see all in list ordered by date

- [ ] T081 [US5] Test empty state: no quotes created → show empty message

---

## Phase 8: Polish & Cross-Cutting Concerns (11 tasks)

Final refinements, error handling, and deployment readiness.

### Error Handling

- [ ] T082 Implement global error boundary in `app/layout.tsx` with user-friendly error messages

- [ ] T083 Add form error display in all forms: inline field errors + submission error alerts

- [ ] T084 Create error handler in `lib/api-error.ts` for consistent error responses across API routes

### Performance & Security

- [ ] T085 Implement rate limiting in `lib/rate-limit.ts` for login/register endpoints: 5 requests per minute per IP

- [ ] T086 Verify data isolation: user cannot access other users' products/quotes via direct API calls

- [ ] T087 Implement CSRF protection by verifying NextAuth.js CSRF token in all form submissions

- [ ] T088 Add loading states in all API calls: disable submit button, show spinners

### Responsive Design

- [ ] T089 [P] Implement responsive layouts for all pages using Tailwind CSS responsive classes (sm:, md:, lg:)

- [ ] T090 [P] Test on mobile devices: forms, navigation, product/quote displays work correctly

### Deployment

- [ ] T091 Create Dockerfile with multi-stage build for Next.js application

- [ ] T092 Create docker-compose.yml with Next.js app + PostgreSQL services for local development

---

## Dependency Graph

```
Phase 1-2: Setup (MUST complete first)
├─ Phase 3 (US1: Registration) ──→ Phase 4 (US2: Login) ──→ Phase 5 (US3: Products)
└─ Phase 4 (US2: Login) ──→ Phase 6 (US4: Quotation) ──→ Phase 7 (US5: History)
```

**Critical Path**:
1. Phase 1-2: Infrastructure (T001-T022)
2. Phase 3: Registration (T023-T035)
3. Phase 4: Login (T036-T047)
4. Phase 5: Products (T048-T062)

**Parallel Opportunities**:
- Phase 3 & 4 can start in parallel after Phase 2
- Within each phase: [P] tasks can run in parallel

---

## Recommended MVP Delivery

**MVP Scope**: Phase 1-5 (first 62 tasks)
- Complete registration, login, product management
- **Time estimate**: 3-5 weeks with 1 developer
- **Value delivered**: Users can manage products and generate quotes

**Post-MVP Additions**: Phase 6-8
- Quote history, polish, error handling
- Can be delivered in subsequent iterations

---

**Tasks Ready for Development**: All 90 tasks defined and ready to execute. Follow execution order for optimal workflow.