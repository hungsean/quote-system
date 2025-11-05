# Tasks: MVP Core - 登入、註冊與估價系統

**Feature**: 001-mvp-core
**Generated**: 2025-11-05
**Status**: Ready for Implementation
**Branch**: `001-mvp-core`

## Overview

本文件包含 MVP 核心功能的完整任務分解，組織如下：
- **Phase 1**: 專案初始化與基礎設置
- **Phase 2**: 基礎/阻塞性先決條件
- **Phase 3**: 用戶故事 1 - 用戶註冊與帳戶建立 (P1)
- **Phase 4**: 用戶故事 2 - 用戶登入與身份驗證 (P1)
- **Phase 5**: 用戶故事 3 - 新增商品到估價系統 (P1)
- **Phase 6**: 用戶故事 4 - 進行商品估價 (P2)
- **Phase 7**: 用戶故事 5 - 瀏覽估價歷史 (P2)
- **Phase 8**: 完善與交叉功能優化

## Implementation Strategy

**MVP 範圍**: 用戶故事 1-3 (P1)，構成可運行的最小化產品
**漸進式交付**: 用戶故事 4-5 (P2) 可在後續迭代中添加
**依賴管理**: Phase 1-2 必須完全完成，然後用戶故事可並行開發

---

## Phase 1: 專案初始化與基礎設置

**目標**: 建立 Next.js 16 專案結構、TypeScript 配置、資料庫連接

### 不依賴用戶故事的基礎任務

- [ ] T001 初始化 Next.js 16 專案，安裝所有主要依賴（Next.js 16, React 19, TypeScript, Tailwind CSS v4）在 `package.json`
- [ ] T002 配置 TypeScript 編譯器選項，創建 `tsconfig.json`，確保嚴格模式啟用
- [ ] T003 [P] 配置 Tailwind CSS v4 並建立全局樣式文件 `src/styles/globals.css`
- [ ] T004 [P] 創建專案目錄結構，包括 `src/app`、`src/components`、`src/lib`、`src/types`、`tests` 目錄
- [ ] T005 配置 Next.js 根 layout `src/app/layout.tsx`，設定基礎 HTML 結構和元數據

---

## Phase 2: 基礎/阻塞性先決條件

**目標**: 建立資料庫連接、認證基礎設施、驗證工具

### 資料庫與連接

- [ ] T006 建立 PostgreSQL 連接模組 `src/lib/db.ts`，使用 `pg` 客戶端，實現連接池和錯誤處理
- [ ] T007 [P] 建立資料庫遷移腳本，創建 `User`、`Product`、`Quote` 表及其關係 `scripts/init-db.sql`

### 認證基礎設施

- [ ] T008 安裝並配置 NextAuth.js 5，創建 `src/lib/auth.ts`，設定 PostgreSQL 適配器
- [ ] T009 [P] 建立密碼雜湊工具，創建 `src/lib/password.ts`，使用 bcryptjs 進行安全密碼處理
- [ ] T010 建立驗證工具函數，創建 `src/lib/validation.ts`，實現電子郵件、密碼、商品信息驗證

### 共用類型與工具

- [ ] T011 [P] 建立 TypeScript 類型定義，創建 `src/types/user.ts`、`src/types/product.ts`、`src/types/quote.ts`
- [ ] T012 [P] 建立估價引擎，創建 `src/lib/quote-engine.ts`，實現簡單計算公式
- [ ] T013 建立環境變數配置，創建 `.env.local` 模板並記錄所需變數（DATABASE_URL, NEXTAUTH_SECRET 等）

---

## Phase 3: 用戶故事 1 - 用戶註冊與帳戶建立 (P1)

**故事目標**: 新用戶能夠建立帳戶並完成註冊流程

**獨立測試標準**: 新用戶成功填寫註冊表單，系統建立帳戶，用戶可查看確認訊息和自動登入

### 資料模型與服務

- [ ] T014 [US1] 建立用戶註冊服務，創建 `src/services/auth-service.ts`，實現 `registerUser` 函數（驗證、雜湊密碼、儲存到資料庫）
- [ ] T015 [P] [US1] 建立用戶驗證功能，在 `src/lib/validation.ts` 中實現電子郵件唯一性檢查和密碼複雜性驗證

### API 端點

- [ ] T016 [US1] 建立註冊 API 端點 `src/app/api/auth/register/route.ts`，實現 POST /api/auth/register，返回 userId 和 email，處理錯誤情況
- [ ] T017 [P] [US1] 建立登出 API 端點 `src/app/api/auth/logout/route.ts`，實現 GET /api/auth/logout

### UI 元件與頁面

- [ ] T018 [US1] 建立註冊表單元件，創建 `src/components/auth/RegisterForm.tsx`，包含電子郵件、密碼、確認密碼欄位及錯誤提示
- [ ] T019 [P] [US1] 建立通用表單工具元件，創建 `src/components/common/FormField.tsx`、`src/components/common/FormError.tsx`
- [ ] T020 [US1] 建立註冊頁面，創建 `src/app/(auth)/register/page.tsx`，集成註冊表單
- [ ] T021 [P] [US1] 建立認證頁面布局，創建 `src/app/(auth)/layout.tsx`，設定不需要認證的路由群組

### 測試（可選但推薦）

- [ ] T022 [US1] 建立註冊流程測試，創建 `tests/integration/auth-register.test.ts`，測試成功註冊、重複電子郵件、無效密碼等場景

---

## Phase 4: 用戶故事 2 - 用戶登入與身份驗證 (P1)

**故事目標**: 已註冊用戶能夠安全登入系統並維持會話

**獨立測試標準**: 用戶輸入有效憑證成功登入，系統驗證並維持會話，頁面刷新後仍保持登入狀態

### 服務與認證邏輯

- [ ] T023 [US2] 建立用戶登入服務，創建 `src/services/auth-service.ts` 擴展，實現 `loginUser` 函數（驗證憑證、檢查密碼雜湊）
- [ ] T024 [P] [US2] 配置 NextAuth.js 會話管理，在 `src/lib/auth.ts` 中設定會話策略和 JWT 選項

### API 端點

- [ ] T025 [US2] 建立登入 API 端點 `src/app/api/auth/login/route.ts`，實現 POST /api/auth/login，返回 userId 和 email

### UI 元件與頁面

- [ ] T026 [US2] 建立登入表單元件，創建 `src/components/auth/LoginForm.tsx`，包含電子郵件、密碼欄位及錯誤提示
- [ ] T027 [US2] 建立登入頁面，創建 `src/app/(auth)/login/page.tsx`，集成登入表單和註冊連結
- [ ] T028 [P] [US2] 建立首頁重定向邏輯，更新 `src/app/page.tsx`，根據會話狀態重定向到 dashboard 或 login

### 受保護的路由與導航

- [ ] T029 [US2] 建立受保護應用布局，創建 `src/app/(app)/layout.tsx`，實現會話檢查和登出功能
- [ ] T030 [P] [US2] 建立導航元件，創建 `src/components/common/Navigation.tsx`，顯示登出按鈕
- [ ] T031 [US2] 建立應用首頁/dashboard，創建 `src/app/(app)/dashboard/page.tsx`，顯示已登入用戶的歡迎訊息

### 測試（可選但推薦）

- [ ] T032 [US2] 建立登入流程測試，創建 `tests/integration/auth-login.test.ts`，測試成功登入、無效憑證、會話持久化等場景

---

## Phase 5: 用戶故事 3 - 新增商品到估價系統 (P1)

**故事目標**: 已登入用戶能夠新增商品到系統中，準備進行估價

**獨立測試標準**: 用戶填寫商品信息（名稱、描述、類別）並提交，系統保存商品，用戶可在商品列表中看到新商品

### 資料模型與服務

- [ ] T033 [US3] 建立商品服務，創建 `src/services/product-service.ts`，實現 `createProduct` 和 `getProductsByUserId` 函數
- [ ] T034 [P] [US3] 建立商品驗證，在 `src/lib/validation.ts` 中實現商品信息驗證（名稱、描述、類別非空檢查）

### API 端點

- [ ] T035 [US3] 建立商品列表 API 端點 `src/app/api/products/route.ts`，實現 GET（列出用戶商品）和 POST（建立商品）
- [ ] T036 [P] [US3] 建立商品詳情 API 端點 `src/app/api/products/[id]/route.ts`，實現 GET（取得商品詳情）

### UI 元件與頁面

- [ ] T037 [US3] 建立商品表單元件，創建 `src/components/products/ProductForm.tsx`，包含名稱、描述、類別欄位
- [ ] T038 [US3] 建立商品列表元件，創建 `src/components/products/ProductList.tsx`，顯示商品卡片及操作按鈕
- [ ] T039 [P] [US3] 建立商品分類選擇器，創建 `src/components/products/CategorySelect.tsx`，列出可用的商品類別
- [ ] T040 [US3] 建立商品頁面，創建 `src/app/(app)/products/page.tsx`，集成商品列表和新增按鈕
- [ ] T041 [US3] 建立商品詳情頁面，創建 `src/app/(app)/products/[id]/page.tsx`，顯示單一商品信息

### 測試（可選但推薦）

- [ ] T042 [US3] 建立商品管理測試，創建 `tests/integration/products.test.ts`，測試建立商品、列出商品、驗證等場景

---

## Phase 6: 用戶故事 4 - 進行商品估價 (P2)

**故事目標**: 用戶能夠為已新增的商品進行估價並獲得結果

**獨立測試標準**: 用戶選擇商品進行估價，系統計算並顯示估價結果（新台幣格式），估價記錄被保存

### 服務與計算邏輯

- [ ] T043 [US4] 建立估價服務，創建 `src/services/quote-service.ts`，實現 `createQuote` 和 `getQuotesByUserId` 函數
- [ ] T044 [P] [US4] 驗證和改進估價引擎，更新 `src/lib/quote-engine.ts`，確保公式正確實現並返回整數值（分）

### API 端點

- [ ] T045 [US4] 建立估價 API 端點 `src/app/api/quotes/route.ts`，實現 GET（列出估價）和 POST（建立估價）
- [ ] T046 [P] [US4] 建立估價詳情 API 端點 `src/app/api/quotes/[id]/route.ts`，實現 GET（取得估價詳情含商品信息）

### UI 元件與頁面

- [ ] T047 [US4] 建立估價表單元件，創建 `src/components/quotes/QuoteForm.tsx`，選擇商品並觸發估價計算
- [ ] T048 [US4] 建立估價結果顯示元件，創建 `src/components/quotes/QuoteResult.tsx`，顯示估價結果（新台幣格式）
- [ ] T049 [P] [US4] 建立貨幣格式化工具，創建 `src/lib/currency.ts`，實現新台幣價格格式化（NT$）
- [ ] T050 [US4] 建立估價頁面，創建 `src/app/(app)/quotes/page.tsx`，集成估價表單和結果顯示

### 測試（可選但推薦）

- [ ] T051 [US4] 建立估價計算測試，創建 `tests/unit/quote-engine.test.ts`，測試估價公式正確性
- [ ] T052 [US4] 建立估價端點測試，創建 `tests/integration/quotes.test.ts`，測試估價建立和檢索

---

## Phase 7: 用戶故事 5 - 瀏覽估價歷史 (P2)

**故事目標**: 用戶能夠查看所有過往估價記錄及詳情

**獨立測試標準**: 用戶瀏覽估價歷史列表，系統按日期降序顯示所有估價，用戶可點擊查看詳情

### 服務

- [ ] T053 [US5] 在估價服務中擴展分頁功能，更新 `src/services/quote-service.ts`，實現 `getQuotesByUserId` 的分頁支持

### API 端點

- [ ] T054 [US5] 更新估價列表端點支持分頁，更新 `src/app/api/quotes/route.ts`，支持 limit 和 offset 查詢參數

### UI 元件與頁面

- [ ] T055 [US5] 建立估價列表元件，創建 `src/components/quotes/QuoteList.tsx`，顯示估價卡片及分頁控制
- [ ] T056 [US5] 建立估價歷史頁面，創建 `src/app/(app)/quotes/history/page.tsx`，集成估價列表
- [ ] T057 [P] [US5] 建立估價詳情頁面，創建 `src/app/(app)/quotes/[id]/page.tsx`，顯示完整的估價詳情及相關商品信息
- [ ] T058 [US5] 建立空狀態提示，更新 `src/components/quotes/QuoteList.tsx`，當無估價時顯示提示訊息

### 測試（可選但推薦）

- [ ] T059 [US5] 建立估價歷史測試，創建 `tests/integration/quote-history.test.ts`，測試分頁、排序、詳情查詢

---

## Phase 8: 完善與交叉功能優化

**目標**: 改進用戶體驗、錯誤處理、性能優化

### 通用改進

- [ ] T060 [P] 建立通用錯誤頁面，創建 `src/app/error.tsx` 和 `src/app/not-found.tsx`，改進用戶錯誤提示
- [ ] T061 [P] 建立載入狀態元件，創建 `src/components/common/LoadingSpinner.tsx`、`src/components/common/Skeleton.tsx`
- [ ] T062 建立通用 API 錯誤處理，創建 `src/lib/api-error.ts`，統一 API 錯誤回應格式

### UI 改進

- [ ] T063 [P] 改進表單驗證反饋，更新所有表單元件以提供實時驗證提示
- [ ] T064 [P] 建立頁面轉換過渡效果，更新所有頁面，添加平滑過渡和載入狀態
- [ ] T065 建立數據刷新機制，實現樂觀更新和重驗證策略

### 性能與安全

- [ ] T066 [P] 實現 CSRF 保護，更新 NextAuth.js 配置以啟用 CSRF 防護
- [ ] T067 [P] 實現速率限制，創建 `src/lib/rate-limit.ts`，為登入和註冊 API 添加速率限制
- [ ] T068 建立環境變數驗證，創建 `src/lib/env.ts`，驗證所有必需的環境變數在應用啟動時存在

### 文檔與部署

- [ ] T069 建立 Docker 容器化，創建 `Dockerfile` 和 `docker-compose.yml`，定義本地開發和生產構建
- [ ] T070 建立部署文檔，創建 `DEPLOYMENT.md`，記錄部署步驟和環境配置
- [ ] T071 [P] 建立開發指南，創建 `DEVELOPMENT.md`，記錄本地開發設置和常用命令

---

## Dependency Graph: 用戶故事完成順序

```
Phase 1-2 (Setup & Foundation) → All User Stories can proceed in parallel
├── Phase 3 (US1: Registration) → Phase 4 (US2: Login) → Phase 5 (US3: Add Product)
└── Phase 4 (US2: Login) → Phase 6 (US4: Quote) → Phase 7 (US5: History)
```

**關鍵依賴**:
- US1 和 US2 可並行開發（都依賴 Phase 2）
- US3 必須在 US1 和 US2 後完成（需要認證用戶）
- US4 必須在 US3 後完成（需要商品存在）
- US5 必須在 US4 後完成（需要估價存在）

---

## Parallel Execution Opportunities

### 初始化階段並行 (Phase 1-2)

```
Task Batch 1 (T001-T005): 專案結構與 Next.js 配置
Task Batch 2 (T006-T009): 資料庫與認證基礎設施
Task Batch 3 (T011-T013): 類型與共用工具
```

### 用戶故事並行（Phase 3-5）

在 Phase 2 完成後，以下可並行開發：

```
Phase 3 (US1): T014-T022 - 同時開發 API 和 UI
Phase 4 (US2): T023-T032 - 同時開發服務和頁面
Phase 5 (US3): T033-T042 - 同時開發商品服務和 UI
```

**並行規則**: 標記為 `[P]` 的任務可與其他 `[P]` 任務並行執行，只要它們無相同的檔案依賴。

---

## Summary

| 指標 | 數值 |
|------|------|
| 總任務數 | 71 |
| 可並行任務 (標記 [P]) | 28 |
| MVP 範圍任務 (P1 故事) | 48 |
| P2 範圍任務 (P2 故事) | 14 |
| 可選測試任務 | 6 |
| 完善與優化任務 | 9 |

**建議 MVP 範圍**: 完成 Phase 1-5（包括所有 P1 用戶故事），共 48 個任務，提供完整的註冊、登入和商品管理功能。

**後續迭代**: Phase 6-7（P2 用戶故事）和 Phase 8（完善）可在 MVP 1.0 發佈後進行。

---

**生成日期**: 2025-11-05
**生成命令**: `/speckit.tasks`
**狀態**: 準備好開始實現 ✓
