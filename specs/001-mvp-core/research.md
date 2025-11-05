# Technical Research: Quote System MVP

**Feature Branch**: `001-mvp-core`
**Date**: 2025-11-05
**Status**: Research Complete
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md)

## Overview

本文檔記錄 Quote System MVP 核心技術研究結果,包含 Next.js 16 + PostgreSQL 技術堆疊的最佳實踐與實作建議。

---

## 1. NextAuth.js 5 + PostgreSQL Integration

### Decision

使用 NextAuth.js (Auth.js) 5.0 搭配 PostgreSQL 資料庫適配器進行會話管理,密碼使用 bcryptjs 進行雜湊處理。

### Rationale

- **Database Session Storage**: NextAuth.js 5 預設使用 JWT 儲存會話,但搭配資料庫適配器時會自動切換為資料庫儲存模式,提供更好的會話控制與安全性
- **PostgreSQL Compatibility**: NextAuth.js 5 對 PostgreSQL 適配器完全相容,且資料庫 schema 與 v4 相比無重大變更
- **bcryptjs Choice**: bcryptjs 是純 JavaScript 實作,不需要原生編譯,相容 Next.js 的無伺服器環境,且自動處理 salt 生成

### Key Implementation Details

#### Session Configuration

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const result = await pool.query(
          'SELECT * FROM vendors WHERE email = $1',
          [credentials.email]
        )

        const user = result.rows[0]
        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: "jwt", // For MVP, JWT is simpler
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
})
```

#### Password Hashing Best Practices

```typescript
// lib/password.ts
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10 // Balance between security and performance

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
```

**Salt Rounds 建議**:

- 使用 10 rounds 作為預設值(平衡安全性與效能)
- 根據經驗,8 rounds 是最低建議值
- 過多 rounds 會顯著增加處理時間,影響使用者體驗

**密碼安全建議**:

- 最少 8 個字元,包含大寫、小寫和數字
- 鼓勵使用者使用較長的密碼(長度比複雜度更重要)
- 絕不以明文儲存密碼
- 所有密碼操作必須在伺服器端進行

#### Session Persistence

```typescript
// middleware.ts
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ['/dashboard/:path*', '/api/products/:path*', '/api/quotes/:path*'],
}
```

### Resources/References

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [NextAuth.js Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [bcryptjs npm Package](https://www.npmjs.com/package/bcryptjs)
- [DigitalOcean bcryptjs Guide](https://www.digitalocean.com/community/tutorials/how-to-handle-passwords-safely-with-bcryptsjs-in-javascript)

---

## 2. Next.js 16 App Router Best Practices

### Decision

採用 Next.js 16 App Router 架構,預設使用 Server Components,僅在需要互動時使用 Client Components。

### Rationale

- **Server Components by Default**: Next.js 16 App Router 預設所有元件為 Server Components,減少客戶端 JavaScript bundle 大小
- **Improved Performance**: Server Components 在伺服器端渲染,減少客戶端 JavaScript,提升首次載入效能
- **Opt-in Caching**: Next.js 16 改為 opt-in 快取策略,所有動態程式碼預設在請求時執行,行為更符合開發者預期

### Key Implementation Details

#### Server Components vs Client Components

**何時使用 Server Components**:

- 資料獲取(Data fetching)
- 直接存取後端資源(資料庫、檔案系統)
- 保護敏感資訊(API keys、tokens)
- 靜態內容渲染
- 減少客戶端 JavaScript

**何時使用 Client Components**:

- 需要互動功能(onClick, onChange, onSubmit)
- 使用 React Hooks(useState, useEffect, useContext)
- 使用瀏覽器 API(localStorage, geolocation)
- 需要即時更新的 UI

**範例結構**:

```typescript
// app/dashboard/products/page.tsx (Server Component)
import { auth } from "@/lib/auth"
import { pool } from "@/lib/db"
import { ProductList } from "@/components/features/ProductList"

export default async function ProductsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const result = await pool.query(
    'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC',
    [session.user.id]
  )

  return (
    <div>
      <h1>我的商品</h1>
      <ProductList products={result.rows} />
    </div>
  )
}
```

```typescript
// components/features/ProductList.tsx (Client Component)
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ProductList({ products }) {
  const [filter, setFilter] = useState('')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="搜尋商品..."
      />
      {filtered.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>NT${product.unit_price}</p>
        </div>
      ))}
    </div>
  )
}
```

#### API Routes (Route Handlers)

Next.js 16 App Router 使用 Route Handlers 取代傳統 API Routes:

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  category: z.string(),
  unit_price: z.number().positive(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(
      'SELECT * FROM products WHERE vendor_id = $1',
      [session.user.id]
    )

    return NextResponse.json({ products: result.rows })
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      )
    }

    const { name, description, category, unit_price } = validation.data

    const result = await pool.query(
      'INSERT INTO products (vendor_id, name, description, category, unit_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [session.user.id, name, description, category, unit_price]
    )

    return NextResponse.json({ product: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('POST /api/products error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

**Route Handler 最佳實踐**:

1. **錯誤處理**: 使用 try-catch 捕捉異常,返回有意義的錯誤訊息
2. **型別安全**: 使用 TypeScript 定義 Request 和 Response 型別
3. **資料驗證**: 使用 Zod 進行伺服器端驗證
4. **可重用中介邏輯**: 建立可重用的函式封裝認證、日誌等邏輯
5. **日誌記錄**: 實作完整的日誌記錄,方便監控和除錯

#### File-based Routing Patterns

```
app/
├── (auth)/                    # Route group (不影響 URL)
│   ├── login/
│   │   └── page.tsx          # /login
│   └── register/
│       └── page.tsx          # /register
├── dashboard/
│   ├── page.tsx              # /dashboard
│   ├── products/
│   │   ├── page.tsx          # /dashboard/products
│   │   ├── [id]/
│   │   │   └── page.tsx      # /dashboard/products/[id]
│   │   └── new/
│   │       └── page.tsx      # /dashboard/products/new
│   └── quotes/
│       ├── page.tsx          # /dashboard/quotes
│       └── [id]/
│           └── page.tsx      # /dashboard/quotes/[id]
├── api/
│   ├── products/
│   │   ├── route.ts          # GET/POST /api/products
│   │   └── [id]/
│   │       └── route.ts      # GET/PUT/DELETE /api/products/[id]
│   └── quotes/
│       └── route.ts          # GET/POST /api/quotes
├── layout.tsx                # Root layout
└── page.tsx                  # Home page (/)
```

### Resources/References

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

## 3. Tailwind CSS v4 with Next.js 16

### Decision

使用 Tailwind CSS v4 搭配 Next.js 16,採用 CSS-first 配置方式,選用 shadcn/ui 作為元件庫。

### Rationale

- **Performance**: Tailwind v4 全量建置速度提升 5 倍,增量建置速度提升 100 倍以上(以微秒計算)
- **Simplified Configuration**: 不再需要 `tailwind.config.js`,所有自訂設定直接寫在 CSS 檔案中
- **Modern CSS**: 使用 `@theme` 指令定義設計 tokens,更接近原生 CSS
- **shadcn/ui**: 提供高品質、可自訂的元件,直接複製到專案中,完全掌控程式碼

### Key Implementation Details

#### Tailwind CSS v4 Setup

專案已使用 Tailwind v4,配置如下:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* 自訂設計 tokens */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;

  /* 自訂斷點 */
  --breakpoint-3xl: 1920px;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... 其他深色主題變數 */
  }
}
```

```typescript
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**重要注意事項**:

- `npx create-next-app@latest --tailwind` 目前仍安裝 Tailwind v3
- 需手動升級到 v4(已在專案中完成)
- 使用 `@tailwindcss/postcss` 取代傳統的 `tailwindcss` plugin

#### shadcn/ui Integration

專案已安裝 shadcn/ui,配置如下:

```json
// components.json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**已安裝的元件**:

- Button
- Input
- Label
- Card
- Select

**安裝新元件**:

```bash
pnpm dlx shadcn@latest add [component-name]
```

**自訂元件範例**:

```typescript
// components/ui/button.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
```

**使用範例**:

```typescript
// app/dashboard/products/page.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">我的商品</h1>
        <Button asChild>
          <Link href="/dashboard/products/new">新增商品</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{product.description}</p>
              <p className="text-2xl font-bold mt-4">NT${product.unit_price}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

#### Component Library Approach

**shadcn/ui 優勢**:

1. **完全掌控**: 元件直接複製到專案中,可以自由修改
2. **無依賴鎖定**: 不是 npm 套件,沒有版本升級問題
3. **Radix UI 基礎**: 基於 Radix UI,提供完整的無障礙支援
4. **Tailwind 整合**: 完美整合 Tailwind CSS v4
5. **React 19 相容**: 支援最新的 React 19 功能

**套件管理注意事項**:

- 使用 npm 時需要 `--legacy-peer-deps` 標記(React 19 peer dependency 問題)
- pnpm、yarn、bun 可以更優雅地處理 peer dependencies

### Resources/References

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS Next.js Guide](https://tailwindcss.com/docs/guides/nextjs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs/installation/next)
- [Radix UI Documentation](https://www.radix-ui.com/)

---

## 4. Data Validation & Security

### Decision

使用 Zod 進行表單驗證,在伺服器端和客戶端共用 schema,搭配基礎的速率限制保護登入與註冊端點。

### Rationale

- **Zod TypeScript-first**: Zod 提供完整的 TypeScript 型別推導,減少重複定義
- **Shared Schema**: 伺服器端和客戶端可以共用同一個驗證 schema,避免重複程式碼
- **Server Actions Integration**: 與 Next.js Server Actions 和 Route Handlers 無縫整合
- **Basic Rate Limiting**: MVP 階段使用簡單的記憶體內速率限制,足以防止基本的暴力攻擊

### Key Implementation Details

#### Form Validation with Zod

**定義共用 Schema**:

```typescript
// lib/validations/auth.ts
import { z } from 'zod'

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, '電子郵件為必填')
    .email('請輸入有效的電子郵件'),
  password: z
    .string()
    .min(8, '密碼至少需要 8 個字元')
    .regex(/[A-Z]/, '密碼必須包含至少一個大寫字母')
    .regex(/[a-z]/, '密碼必須包含至少一個小寫字母')
    .regex(/[0-9]/, '密碼必須包含至少一個數字'),
  name: z.string().min(1, '姓名為必填'),
})

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '電子郵件為必填')
    .email('請輸入有效的電子郵件'),
  password: z.string().min(1, '密碼為必填'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
```

```typescript
// lib/validations/product.ts
import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, '商品名稱為必填').max(255),
  description: z.string().min(1, '商品描述為必填'),
  category: z.string().min(1, '商品類別為必填'),
  unit_price: z
    .number({ required_error: '單價為必填' })
    .positive('單價必須大於 0')
    .finite('單價必須是有效數字'),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
```

**伺服器端驗證(Server Actions)**:

```typescript
// app/actions/auth.ts
'use server'

import { registerSchema } from '@/lib/validations/auth'
import { hashPassword } from '@/lib/password'
import { pool } from '@/lib/db'
import { redirect } from 'next/navigation'

export async function registerAction(prevState: any, formData: FormData) {
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  }

  // 驗證輸入
  const validation = registerSchema.safeParse(data)

  if (!validation.success) {
    return {
      error: '驗證失敗',
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  const { email, password, name } = validation.data

  try {
    // 檢查電子郵件是否已存在
    const existingUser = await pool.query(
      'SELECT id FROM vendors WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return {
        error: '此電子郵件已被使用',
        fieldErrors: { email: ['此電子郵件已被註冊'] },
      }
    }

    // 雜湊密碼並建立用戶
    const passwordHash = await hashPassword(password)
    await pool.query(
      'INSERT INTO vendors (email, password_hash, name) VALUES ($1, $2, $3)',
      [email, passwordHash, name]
    )

    // 註冊成功後重定向到登入頁面
    redirect('/login')
  } catch (error) {
    console.error('Register error:', error)
    return {
      error: '註冊失敗,請稍後再試',
    }
  }
}
```

**客戶端驗證(React Hook Form + Zod)**:

```typescript
// app/(auth)/register/page.tsx
'use client'

import { useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { registerAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  return (
    <div className="container max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">註冊</h1>

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="name">姓名</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="請輸入您的姓名"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">電子郵件</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="password">密碼</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="至少 8 個字元"
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {state?.error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
            {state.error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? '註冊中...' : '註冊'}
        </Button>
      </form>
    </div>
  )
}
```

#### Input Sanitization

**HTML Sanitization**:

```typescript
// lib/sanitize.ts
export function sanitizeHtml(input: string): string {
  // 簡單的 HTML 標籤移除(MVP 階段)
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeInput(input: string): string {
  // 移除前後空白,限制長度
  return input.trim().slice(0, 1000)
}
```

**SQL Injection Prevention**:

```typescript
// 使用參數化查詢(已在所有資料庫操作中使用)
// ✅ 正確:參數化查詢
const result = await pool.query(
  'SELECT * FROM products WHERE vendor_id = $1 AND name = $2',
  [vendorId, productName]
)

// ❌ 錯誤:字串拼接(絕不使用)
// const result = await pool.query(
//   `SELECT * FROM products WHERE vendor_id = '${vendorId}'`
// )
```

#### Rate Limiting for MVP

**簡單的記憶體內速率限制**:

```typescript
// lib/rate-limit.ts
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  interval: number // 時間窗口(毫秒)
  limit: number    // 最大請求數
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, limit: 5 }
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // 清理過期的條目
  if (entry && now > entry.resetAt) {
    rateLimitMap.delete(identifier)
  }

  const current = rateLimitMap.get(identifier)

  if (!current) {
    // 首次請求
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + config.interval,
    })
    return {
      success: true,
      remaining: config.limit - 1,
      reset: now + config.interval,
    }
  }

  if (current.count >= config.limit) {
    // 超過限制
    return {
      success: false,
      remaining: 0,
      reset: current.resetAt,
    }
  }

  // 增加計數
  current.count++
  return {
    success: true,
    remaining: config.limit - current.count,
    reset: current.resetAt,
  }
}

// 定期清理過期條目(每 5 分鐘)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)
```

**應用速率限制**:

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { registerSchema } from '@/lib/validations/auth'
import { hashPassword } from '@/lib/password'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  // 取得客戶端 IP
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown'

  // 速率限制:每分鐘最多 5 次請求
  const rateLimitResult = rateLimit(`register:${ip}`, {
    interval: 60000,
    limit: 5,
  })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: '請求過於頻繁,請稍後再試',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      { status: 429 }
    )
  }

  // 繼續處理註冊邏輯...
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      )
    }

    // 註冊邏輯...
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**安全最佳實踐總結**:

1. **伺服器端驗證優先**: 絕不信任客戶端輸入,所有驗證必須在伺服器端執行
2. **參數化查詢**: 使用參數化查詢防止 SQL Injection
3. **密碼安全**: 使用 bcryptjs 雜湊,絕不儲存明文密碼
4. **速率限制**: 保護認證端點免受暴力攻擊
5. **HTTPS**: 生產環境必須使用 HTTPS 加密傳輸
6. **環境變數**: 敏感資訊儲存在環境變數中,不要提交到版本控制
7. **錯誤訊息**: 避免洩漏敏感資訊(如「密碼錯誤」vs「電子郵件或密碼錯誤」)

### Resources/References

- [Zod Documentation](https://zod.dev/)
- [React Hook Form + Zod Guide](https://react-hook-form.com/get-started#SchemaValidation)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 5. PostgreSQL Schema & Query Patterns

### Decision

使用 `pg` 套件搭配連線池進行資料庫操作,使用交易(Transactions)處理需要多步驟操作的業務邏輯(如建立報價單)。

### Rationale

- **pg Native Client**: `pg` 是 Node.js 生態系中最成熟的 PostgreSQL 客戶端,效能優異
- **Built-in Connection Pooling**: `pg` 內建連線池支援,無需額外套件
- **Transaction Support**: 原生支援 PostgreSQL 交易,確保資料一致性
- **Type Safety**: 搭配 TypeScript 可以定義明確的資料型別

### Key Implementation Details

#### Database Schema

```sql
-- init.sql (已在專案中)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_quotes_vendor ON quotes(vendor_id);
CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
```

**Schema 設計考量**:

- 使用 UUID 作為主鍵,避免 ID 可預測性
- 使用 `ON DELETE CASCADE` 確保資料一致性
- 建立索引提升查詢效能
- 使用 `DECIMAL` 儲存金額,避免浮點數精度問題

#### Connection Pooling

```typescript
// lib/db.ts
import { Pool, PoolConfig } from 'pg'

// 使用單例模式確保全域只有一個連線池
declare global {
  var pgPool: Pool | undefined
}

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10,                      // 最大連線數
  idleTimeoutMillis: 30000,     // 閒置連線超時時間
  connectionTimeoutMillis: 2000, // 連線超時時間
}

export const pool = global.pgPool || new Pool(poolConfig)

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool
}

// 優雅關閉
process.on('SIGTERM', async () => {
  await pool.end()
})

// 資料庫健康檢查
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}
```

**連線池最佳實踐**:

1. **單例模式**: 全域只建立一個連線池實例
2. **連線數設定**: 預設 10 個連線,根據需求調整
3. **超時設定**: 設定適當的超時時間,避免連線卡住
4. **優雅關閉**: 應用程式關閉時正確關閉連線池
5. **錯誤處理**: 捕捉並記錄連線錯誤

**效能優勢**:

- 減少連線建立開銷,延遲降低最多 50%
- 支援並發請求,提升吞吐量
- 自動管理連線生命週期

#### Query Patterns

**基本查詢**:

```typescript
// 查詢單一記錄
export async function getProductById(id: string, vendorId: string) {
  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1 AND vendor_id = $2',
    [id, vendorId]
  )
  return result.rows[0] || null
}

// 查詢多筆記錄
export async function getProductsByVendor(vendorId: string) {
  const result = await pool.query(
    'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC',
    [vendorId]
  )
  return result.rows
}

// 插入記錄
export async function createProduct(data: {
  vendorId: string
  name: string
  description: string
  category: string
  unitPrice: number
}) {
  const result = await pool.query(
    `INSERT INTO products (vendor_id, name, description, category, unit_price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.vendorId, data.name, data.description, data.category, data.unitPrice]
  )
  return result.rows[0]
}

// 更新記錄
export async function updateProduct(
  id: string,
  vendorId: string,
  data: { name?: string; description?: string; unitPrice?: number }
) {
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(data.name)
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`)
    values.push(data.description)
  }
  if (data.unitPrice !== undefined) {
    updates.push(`unit_price = $${paramIndex++}`)
    values.push(data.unitPrice)
  }

  if (updates.length === 0) {
    throw new Error('No fields to update')
  }

  values.push(id, vendorId)

  const result = await pool.query(
    `UPDATE products
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex++} AND vendor_id = $${paramIndex++}
     RETURNING *`,
    values
  )
  return result.rows[0] || null
}

// 刪除記錄
export async function deleteProduct(id: string, vendorId: string) {
  const result = await pool.query(
    'DELETE FROM products WHERE id = $1 AND vendor_id = $2 RETURNING id',
    [id, vendorId]
  )
  return result.rowCount > 0
}
```

#### Transaction Handling

**建立報價單(多步驟操作)**:

```typescript
// lib/db/quotes.ts
import { pool } from '@/lib/db'

interface QuoteItem {
  productId: string
  quantity: number
  unitPrice: number
}

export async function createQuote(
  vendorId: string,
  customerName: string,
  items: QuoteItem[]
) {
  const client = await pool.connect()

  try {
    // 開始交易
    await client.query('BEGIN')

    // 1. 計算總金額
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    )

    // 2. 建立報價單
    const quoteResult = await client.query(
      `INSERT INTO quotes (vendor_id, customer_name, total_amount)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [vendorId, customerName, totalAmount]
    )
    const quote = quoteResult.rows[0]

    // 3. 批量插入報價項目
    const itemsValues = items
      .map((item, index) => {
        const baseIndex = index * 5
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`
      })
      .join(', ')

    const itemsParams = items.flatMap(item => [
      quote.id,
      item.productId,
      item.quantity,
      item.unitPrice,
      item.quantity * item.unitPrice,
    ])

    await client.query(
      `INSERT INTO quote_items (quote_id, product_id, quantity, unit_price, subtotal)
       VALUES ${itemsValues}`,
      itemsParams
    )

    // 提交交易
    await client.query('COMMIT')

    return quote
  } catch (error) {
    // 發生錯誤時回滾
    await client.query('ROLLBACK')
    console.error('Create quote transaction failed:', error)
    throw error
  } finally {
    // 釋放連線回連線池
    client.release()
  }
}

// 查詢報價單(含項目)
export async function getQuoteWithItems(quoteId: string, vendorId: string) {
  const result = await pool.query(
    `SELECT
      q.*,
      json_agg(
        json_build_object(
          'id', qi.id,
          'product_id', qi.product_id,
          'product_name', p.name,
          'quantity', qi.quantity,
          'unit_price', qi.unit_price,
          'subtotal', qi.subtotal
        )
      ) as items
     FROM quotes q
     JOIN quote_items qi ON qi.quote_id = q.id
     JOIN products p ON p.id = qi.product_id
     WHERE q.id = $1 AND q.vendor_id = $2
     GROUP BY q.id`,
    [quoteId, vendorId]
  )
  return result.rows[0] || null
}
```

**交易處理最佳實踐**:

1. **使用 Client 而非 Pool**: 交易期間必須使用同一個連線
2. **BEGIN/COMMIT/ROLLBACK**: 明確控制交易生命週期
3. **錯誤處理**: 使用 try-catch 確保錯誤時回滾
4. **釋放連線**: 使用 finally 確保連線被釋放回連線池
5. **批量操作**: 使用批量 INSERT 提升效能
6. **資料一致性**: 交易確保多步驟操作的原子性

#### Type Safety

```typescript
// types/database.ts
export interface Vendor {
  id: string
  name: string
  email: string
  password_hash: string
  created_at: Date
}

export interface Product {
  id: string
  vendor_id: string
  name: string
  description: string
  category: string
  unit_price: number
  created_at: Date
}

export interface Quote {
  id: string
  vendor_id: string
  customer_name: string
  total_amount: number
  created_at: Date
}

export interface QuoteItem {
  id: string
  quote_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface QuoteWithItems extends Quote {
  items: Array<{
    id: string
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
    subtotal: number
  }>
}
```

**使用型別安全的查詢**:

```typescript
// lib/db/products.ts
import { pool } from '@/lib/db'
import type { Product } from '@/types/database'

export async function getProductById(
  id: string,
  vendorId: string
): Promise<Product | null> {
  const result = await pool.query<Product>(
    'SELECT * FROM products WHERE id = $1 AND vendor_id = $2',
    [id, vendorId]
  )
  return result.rows[0] || null
}

export async function getProductsByVendor(
  vendorId: string
): Promise<Product[]> {
  const result = await pool.query<Product>(
    'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC',
    [vendorId]
  )
  return result.rows
}
```

### Resources/References

- [node-postgres Documentation](https://node-postgres.com/)
- [PostgreSQL Connection Pooling](https://node-postgres.com/features/pooling)
- [PostgreSQL Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [node-postgres Transactions Guide](https://node-postgres.com/features/transactions)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don't_Do_This)

---

## Summary & Next Steps

### Key Technical Decisions

1. **Authentication**: NextAuth.js 5 + PostgreSQL + bcryptjs
2. **Architecture**: Next.js 16 App Router,預設 Server Components
3. **Styling**: Tailwind CSS v4 + shadcn/ui
4. **Validation**: Zod(伺服器端 + 客戶端共用 schema)
5. **Database**: PostgreSQL + pg client + connection pooling
6. **Security**: 參數化查詢、bcryptjs 雜湊、基礎速率限制

### Implementation Priorities

1. **Phase 1**: 建立資料庫連線模組與型別定義
2. **Phase 2**: 實作認證系統(註冊、登入、會話管理)
3. **Phase 3**: 實作商品管理功能
4. **Phase 4**: 實作報價功能(含交易處理)
5. **Phase 5**: 實作報價歷史瀏覽
6. **Phase 6**: UI/UX 優化與錯誤處理
7. **Phase 7**: 安全性加固(速率限制、輸入驗證)
8. **Phase 8**: 測試與性能優化

### Development Environment

```bash
# 本地開發
pnpm dev

# 啟動 Docker 環境
pnpm docker:up

# 查看日誌
pnpm docker:logs

# 停止服務
pnpm docker:down
```

### Environment Variables

```env
# .env.local
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/quote_system
NEXTAUTH_SECRET=change-this-to-a-random-secret
NEXTAUTH_URL=http://localhost:3000
```

---

**研究完成日期**: 2025-11-05
**下一步**: 執行 `/speckit.plan` 命令進入 Phase 1 設計階段
