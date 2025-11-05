# 報價系統 (Quote System) MVP

一個使用 Next.js 14、PostgreSQL 和 Docker 建構的現代化報價系統,為廠商提供完整的商品管理和報價單生成功能。

## 技術棧

- **前端 + 後端**: Next.js 16 (App Router)
- **UI 框架**: Tailwind CSS v4 + shadcn/ui
- **認證**: NextAuth.js 5 (beta)
- **資料庫**: PostgreSQL 16 (Docker)
- **密碼加密**: bcryptjs
- **容器化**: Docker + Docker Compose
- **套件管理**: pnpm

## 功能概覽

### 核心功能

- 👤 廠商帳戶認證與管理
- 🛍️ 商品資訊管理(新增、編輯、刪除)
- 📋 報價單管理與編輯
- 📊 報價單項目管理
- 💾 資料持久化存儲

### 資料庫結構

```plaintext
vendors (廠商)
├─ id, name, email, password_hash, created_at

products (商品)
├─ id, vendor_id, name, price, description, created_at

quotes (報價單)
├─ id, vendor_id, customer_name, total_amount, created_at

quote_items (報價單項目)
├─ id, quote_id, product_id, quantity, unit_price, subtotal
```

## 快速開始

### 前置需求

- Docker 和 Docker Compose
- Node.js 20+ (本地開發)
- pnpm 10+

### 安裝與啟動

#### 方式 1: 使用 Docker (推薦)

```bash
# 啟動 Docker 服務 (PostgreSQL + Next.js 應用)
pnpm docker:up

# 應用將在 http://localhost:3000 啟動
# 資料庫在 http://localhost:5432
```

#### 方式 2: 本地開發

```bash
# 安裝依賴
pnpm install

# 確保 Docker 資料庫已啟動
pnpm docker:up

# 啟動開發伺服器
pnpm dev

# 開啟 http://localhost:3000
```

## 可用指令

### 開發相關

```bash
# 啟動開發伺服器
pnpm dev

# 建置生產版本
pnpm build

# 運行生產版本
pnpm start

# 執行 ESLint 檢查
pnpm lint
```

### Docker 相關

```bash
# 啟動 Docker 環境 (背景執行)
pnpm docker:up

# 停止 Docker 服務
pnpm docker:down

# 查看即時日誌
pnpm docker:logs

# 重新建置並啟動 Docker 環境
pnpm docker:rebuild

# 完全清除 Docker 環境(包含資料庫資料)
pnpm docker:clean
```

### 資料庫相關

```bash
# 列出所有資料表
docker exec quote_db psql -U postgres -d quote_system -c "\dt"

# 進入資料庫互動介面
docker exec -it quote_db psql -U postgres -d quote_system
```

## 專案結構

```plaintext
.
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── auth/                # 認證相關 API
│   │   ├── products/            # 商品 API
│   │   └── quotes/              # 報價單 API
│   ├── (auth)/                  # 認證頁面群組
│   │   ├── login/               # 登入頁面
│   │   └── register/            # 註冊頁面
│   ├── dashboard/               # 主要功能頁面
│   │   ├── products/            # 商品管理頁面
│   │   └── quotes/              # 報價管理頁面
│   ├── globals.css              # 全域樣式
│   ├── layout.tsx               # 根佈局
│   └── page.tsx                 # 首頁
├── components/                  # React 元件
│   ├── ui/                      # shadcn/ui 元件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── table.tsx
│   └── features/                # 業務邏輯元件
├── lib/                         # 工具函式
│   ├── db.ts                    # 資料庫連線 (待建立)
│   ├── auth.ts                  # 認證設定 (待建立)
│   └── utils.ts                 # 通用工具函式
├── types/                       # TypeScript 類型定義
├── docker-compose.yml           # Docker Compose 設定
├── Dockerfile                   # Docker 映像檔設定
├── init.sql                     # 資料庫初始化腳本
├── .env.example                 # 環境變數範例
├── .env.local                   # 本地環境變數 (不提交)
├── next.config.ts               # Next.js 配置
├── tailwind.config.ts           # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 專案依賴與腳本
```

## 環境變數設定

複製 `.env.example` 到 `.env.local` 並修改相應值:

```env
# 資料庫連線字符串
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/quote_system

# NextAuth 設定
NEXTAUTH_SECRET=change-this-to-a-random-secret
NEXTAUTH_URL=http://localhost:3000
```

**注意**: 生產環境中請修改資料庫密碼和 `NEXTAUTH_SECRET`。

## 開發指南

### 驗證安裝

1. 啟動 Docker 服務:

   ```bash
   pnpm docker:up
   ```

2. 檢查服務狀態:

   ```bash
   docker compose ps
   ```

3. 驗證資料庫:

   ```bash
   docker exec quote_db psql -U postgres -d quote_system -c "\dt"
   ```

4. 訪問應用:
   開啟瀏覽器訪問 `http://localhost:3000`

### 下一步

本專案目前已完成基礎架構設置,接下來需要開發:

1. **資料庫模組** (`lib/db.ts`)
   - PostgreSQL 連線設定
   - 資料庫操作工具函式

2. **認證系統** (`lib/auth.ts`)
   - NextAuth.js 配置
   - 登入/註冊邏輯
   - Session 管理

3. **API 路由**
   - `app/api/auth/*` - 認證端點
   - `app/api/products/*` - 商品管理端點
   - `app/api/quotes/*` - 報價單管理端點

4. **前端頁面與元件**
   - 認證頁面 (登入/註冊)
   - 儀表板佈局
   - 商品管理頁面
   - 報價單管理頁面

## 常見問題

### Docker 容器無法啟動?

檢查 5432 和 3000 連接埠是否被占用:

```bash
# macOS/Linux
lsof -i :5432
lsof -i :3000

# Windows
netstat -ano | findstr :5432
```

### 資料庫連線失敗?

確保 PostgreSQL 容器已啟動並健康:

```bash
docker compose logs postgres
```

### 需要重置資料庫?

```bash
pnpm docker:clean
pnpm docker:up
```

## 部署

### 使用 Docker 部署

```bash
# 生產環境建置
pnpm docker:rebuild

# 檢查容器狀態
docker compose ps

# 查看應用日誌
pnpm docker:logs
```

### 使用 Vercel 部署

參考 [Next.js 部署文件](https://nextjs.org/docs/app/building-your-applications/deploying)

## 貢獻指南

1. 建立功能分支: `git checkout -b feature/your-feature`
2. 提交變更: `git commit -am 'Add new feature'`
3. 推送到遠端: `git push origin feature/your-feature`
4. 提交 Pull Request

## 授權

MIT License

## 聯絡方式

如有任何問題或建議,歡迎提交 Issue 或 PR。

---

**開發狀態**: MVP 初始化階段 ✨

最後更新: 2025-11-04
