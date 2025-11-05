# Quickstart Guide: MVP Core Development

**Phase 1 Output** | **Date**: 2025-11-05 | **Target Users**: Developers implementing the feature

---

## Overview

This guide provides a quick setup and overview for developers implementing the Quote System MVP Core (authentication, product management, quotation).

**Estimated setup time**: 10-15 minutes
**Prerequisites**: Node.js 20+, Docker, pnpm

---

## Project Setup

### 1. Clone and Install Dependencies

```bash
cd quote-system
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/quote_system

# NextAuth.js Configuration
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET** (if needed):

```bash
openssl rand -base64 32
```

Copy the output and paste into `.env.local`.

### 3. Start PostgreSQL

Using Docker Compose:

```bash
pnpm docker:up
```

This starts PostgreSQL and runs migrations automatically.

**Verify connection**:

```bash
psql postgresql://postgres:postgres123@localhost:5432/quote_system
\dt  # List tables
\q   # Quit
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in browser.

---

## Project Structure Overview

```
quote-system/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, register)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/              # Protected pages (behind auth)
│   │   ├── products/
│   │   │   ├── page.tsx          # List products
│   │   │   └── add/
│   │   │       └── page.tsx      # Add product form
│   │   ├── quotes/
│   │   │   ├── page.tsx          # Create quote
│   │   │   └── [id]/
│   │   │       └── page.tsx      # View quote
│   │   └── history/
│   │       └── page.tsx          # Quote history
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/    # NextAuth handlers
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── quotes/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── products/
│   │   ├── ProductForm.tsx
│   │   └── ProductList.tsx
│   ├── quotes/
│   │   ├── QuoteForm.tsx
│   │   └── QuoteHistoryList.tsx
│   └── ui/                       # shadcn/ui components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── ...
├── lib/                          # Utilities
│   ├── db.ts                     # PostgreSQL pool
│   ├── auth.ts                   # NextAuth config
│   ├── queries/
│   │   ├── users.ts              # User CRUD
│   │   ├── products.ts           # Product CRUD
│   │   └── quotes.ts             # Quote CRUD
│   ├── validations/
│   │   ├── auth.ts               # Auth schemas
│   │   └── product.ts            # Product schemas
│   └── types.ts
├── migrations/
│   └── 001_init_schema.sql       # Database schema
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Environment template
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## Key Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16+ | Full-stack framework |
| TypeScript | 5.x | Type safety |
| PostgreSQL | 16+ | Database |
| NextAuth.js | 5 | Authentication |
| Tailwind CSS | v4 | Styling |
| shadcn/ui | Latest | UI components |
| bcryptjs | Latest | Password hashing |
| pg | Latest | PostgreSQL client |

---

## Database Schema

Three core tables:

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Quotes Table

```sql
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    quote_value DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Core Features Implementation Checklist

### Phase 1: Database & Auth

- [ ] Database connection pool (`lib/db.ts`)
- [ ] NextAuth.js config (`lib/auth.ts`)
- [ ] Password hashing utilities (`lib/password.ts`)
- [ ] User CRUD queries (`lib/queries/users.ts`)
- [ ] Register API route (`app/api/auth/register/route.ts`)
- [ ] Login page (`app/(auth)/login/page.tsx`)
- [ ] Register page (`app/(auth)/register/page.tsx`)

### Phase 2: Product Management

- [ ] Product CRUD queries (`lib/queries/products.ts`)
- [ ] GET /api/products
- [ ] POST /api/products
- [ ] GET /api/products/[id]
- [ ] Product list page (`app/(dashboard)/products/page.tsx`)
- [ ] Product form component (`components/products/ProductForm.tsx`)
- [ ] Add product page (`app/(dashboard)/products/add/page.tsx`)

### Phase 3: Quotation System

- [ ] Quote CRUD queries (`lib/queries/quotes.ts`)
- [ ] GET /api/quotes
- [ ] POST /api/quotes
- [ ] GET /api/quotes/[id]
- [ ] Quote form component (`components/quotes/QuoteForm.tsx`)
- [ ] Quote creation page (`app/(dashboard)/quotes/page.tsx`)
- [ ] Quote detail page (`app/(dashboard)/quotes/[id]/page.tsx`)
- [ ] Quote history page (`app/(dashboard)/history/page.tsx`)
- [ ] Quote history component (`components/quotes/QuoteHistoryList.tsx`)

### Phase 4: UI/UX Polish

- [ ] Responsive layouts
- [ ] Error handling & user feedback
- [ ] Loading states
- [ ] Navigation & routing
- [ ] Dashboard layout

### Phase 5: Testing & Security

- [ ] Basic auth tests
- [ ] API contract tests
- [ ] Input validation tests
- [ ] Rate limiting
- [ ] HTTPS enforcement (production)

---

## Common Development Tasks

### Run Tests

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# All tests
pnpm test
```

### Database Migrations

```bash
# Run migrations (done automatically on docker:up)
pnpm db:migrate

# Reset database (destructive)
pnpm db:reset
```

### Type Checking

```bash
# Check TypeScript errors
pnpm type-check
```

### Linting & Formatting

```bash
# Lint code
pnpm lint

# Format code
pnpm format
```

---

## API Testing with cURL

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Create Product (requires session)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Office Chair",
    "description": "Ergonomic office chair",
    "category": "Furniture",
    "unit_price": 5000.00
  }'
```

### List Products

```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Code Examples

### Writing a Database Query

```typescript
// lib/queries/products.ts
import { pool } from '@/lib/db'
import type { Product } from '@/types'

export async function getProductsByUser(userId: string): Promise<Product[]> {
  const result = await pool.query<Product>(
    'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )
  return result.rows
}
```

### Creating an API Route

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getProductsByUser } from '@/lib/queries/products'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await getProductsByUser(session.user.id)
    return NextResponse.json({ products })
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Creating a Form Component

```typescript
// components/products/ProductForm.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          category: formData.get('category'),
          unit_price: parseFloat(formData.get('unit_price') as string),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create product')
      }

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" required />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea id="description" name="description" required />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" required />
      </div>

      <div>
        <Label htmlFor="unit_price">Unit Price (TWD)</Label>
        <Input
          id="unit_price"
          name="unit_price"
          type="number"
          step="0.01"
          required
        />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </Button>
    </form>
  )
}
```

---

## Debugging Tips

### View Database Logs

```bash
pnpm docker:logs postgres
```

### Check Session Cookie

Open browser DevTools → Application → Cookies → localhost:3000 → Look for `next-auth.session-token`

### Enable Request Logging

Add to `lib/db.ts`:

```typescript
pool.on('query', (query) => {
  console.log('SQL:', query.text, 'Params:', query.values)
})
```

### Test API with Postman

1. Import OpenAPI spec: `specs/001-mvp-core/contracts/openapi.json`
2. Set environment variables for `NEXTAUTH_TOKEN`
3. Test endpoints

---

## Next Steps for Implementers

1. **Read the docs**:
   - `specs/001-mvp-core/spec.md` - Feature requirements
   - `specs/001-mvp-core/data-model.md` - Database schema & entities
   - `specs/001-mvp-core/contracts/api-endpoints.md` - API reference

2. **Follow the implementation plan**:
   - Check `specs/001-mvp-core/tasks.md` for task breakdown and priorities
   - Implement in order: Database → Auth → Products → Quotes

3. **Run tests frequently**:
   - Unit tests for queries and utilities
   - Integration tests for API routes
   - Manual testing in browser

4. **Keep code simple**:
   - Follow Constitution Principle I: Function-First Development
   - Refactor freely as you discover better patterns
   - No over-engineering for MVP

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth.js Docs**: https://authjs.dev/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/

---

**Quickstart Complete**: You're ready to start implementing! Follow the tasks.md file for the detailed breakdown of work.
