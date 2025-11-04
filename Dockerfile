FROM node:20-alpine

# 安裝 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 複製 package 文件
COPY package.json pnpm-lock.yaml* ./

# 安裝依賴
RUN pnpm install

# 複製所有檔案
COPY . .

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 開發模式啟動
CMD ["pnpm", "dev"]
