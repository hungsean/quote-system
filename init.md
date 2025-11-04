# 報價系統 MVP 專案初始化指令

請協助建立一個報價系統的 MVP 專案，使用 Docker 容器化部署。

## 前提條件

- 已手動執行 `pnpm create next-app .` 並完成互動式設定
- 當前目錄就是專案根目錄（不會建立子資料夾）
- 使用 pnpm 作為套件管理工具

## 專案需求

### 技術堆疊

- 前端 + 後端：Next.js 14 (App Router)
- UI 框架：Tailwind CSS + shadcn/ui
- 資料庫：PostgreSQL (Docker)
- 認證：NextAuth.js
- 容器化：Docker + Docker Compose
- 套件管理：pnpm

### 目標目錄結構

```
./                           # 當前專案根目錄
├── app/                     # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── auth/           # 認證相關 API
│   │   ├── products/       # 商品 API
│   │   └── quotes/         # 報價單 API
│   ├── (auth)/             # 認證頁面群組
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/          # 主要功能頁面
│   │   ├── products/       # 商品管理
│   │   └── quotes/         # 報價管理
│   ├── layout.tsx
│   └── page.tsx
├── components/             # React 元件
│   ├── ui/                 # shadcn/ui 元件
│   └── features/           # 業務邏輯元件
├── lib/                    # 工具函式
│   ├── db.ts              # 資料庫連線
│   └── auth.ts            # 認證設定
├── types/                  # TypeScript 類型定義
├── docker-compose.yml
├── Dockerfile
├── init.sql                # 資料庫初始化腳本
├── .env.example
├── .dockerignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 初始化步驟

### 1. 安裝必要套件

```bash
pnpm add pg next-auth@beta bcryptjs
pnpm add -D @types/pg @types/bcryptjs
```

### 2. 初始化 shadcn/ui

執行以下指令並手動選擇選項：

```bash
pnpm dlx shadcn-ui@latest init
```

建議選項：

- Style: Default
- Base color: Slate  
- CSS variables: Yes

### 3. 安裝常用 shadcn/ui 元件

```bash
pnpm dlx shadcn-ui@latest add button input label card select table
```

### 4. 建立目錄結構

```bash
mkdir -p app/api/auth app/api/products app/api/quotes
mkdir -p app/\(auth\)/login app/\(auth\)/register
mkdir -p app/dashboard/products app/dashboard/quotes
mkdir -p components/ui components/features
mkdir -p lib types
```

### 5. 建立 Docker 相關檔案

請在專案根目錄建立以下檔案：

#### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: quote_db
    environment:
      POSTGRES_DB: quote_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: quote_app
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres123@postgres:5432/quote_system
      NEXTAUTH_SECRET: change-this-to-a-random-secret
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:
```

#### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# 安裝 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### .dockerignore

```
node_modules
.next
.git
.env
.env.local
pnpm-debug.log
README.md
.DS_Store
*.log
.pnpm-store
```

#### init.sql

```sql
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
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
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

### 6. 建立環境變數檔案

#### .env.example

```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/quote_system
NEXTAUTH_SECRET=change-this-to-a-random-secret
NEXTAUTH_URL=http://localhost:3000
```

然後複製到 .env.local：

```bash
cp .env.example .env.local
```

### 7. 修改 next.config.js

將內容替換為：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
```

### 8. 更新 package.json scripts

在現有的 `scripts` 區塊中加入以下指令：

```json
{
  "scripts": {
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:rebuild": "docker-compose up -d --build",
    "docker:clean": "docker-compose down -v"
  }
}
```

## 驗證安裝

### 1. 啟動 Docker 服務

```bash
pnpm docker:up
```

### 2. 檢查服務狀態

```bash
docker-compose ps
```

應該看到兩個服務都在運行：

- quote_db (PostgreSQL)
- quote_app (Next.js)

### 3. 測試資料庫連線

```bash
docker exec -it quote_db psql -U postgres -d quote_system -c "\dt"
```

應該看到 4 個資料表：vendors, products, quotes, quote_items

### 4. 訪問應用

開啟瀏覽器訪問：<http://localhost:3000>

### 5. 查看日誌（如有問題）

```bash
pnpm docker:logs
```

## 完成確認清單

- [ ] Next.js 專案已手動初始化
- [ ] 必要套件安裝完成（pg, next-auth, bcryptjs）
- [ ] shadcn/ui 初始化完成
- [ ] shadcn/ui 元件安裝完成
- [ ] 目錄結構建立完成
- [ ] Docker 相關檔案建立完成
- [ ] 資料庫初始化腳本建立完成
- [ ] 環境變數檔案建立完成
- [ ] next.config.js 更新完成
- [ ] package.json scripts 更新完成
- [ ] Docker 服務啟動成功
- [ ] 資料庫連線測試成功
- [ ] Next.js 應用可訪問

## 常用指令

```bash
# 本地開發（不使用 Docker）
pnpm dev

# 啟動 Docker 環境
pnpm docker:up

# 停止 Docker 環境
pnpm docker:down

# 查看日誌
pnpm docker:logs

# 重新建置並啟動
pnpm docker:rebuild

# 完全清除（包含資料）
pnpm docker:clean
```

## 注意事項

1. 確保 Docker Desktop 已安裝並啟動
2. 確保 5432 和 3000 端口未被占用
3. init.sql 檔案必須在首次啟動前建立
4. 資料會持久化在 Docker volume 中
5. 使用 `pnpm docker:clean` 會刪除所有資料庫資料

## 下一步

專案初始化完成後，即可開始進行程式碼開發：

1. 建立資料庫連線模組 (lib/db.ts)
2. 設定 NextAuth.js (lib/auth.ts)
3. 建立 API Routes
4. 開發 UI 元件和頁面
