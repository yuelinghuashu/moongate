# 构建阶段
FROM node:24-alpine AS builder

# 接收构建参数（用于客户端环境变量）
ARG NUXT_PUBLIC_SITE_URL
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件并安装
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源代码并构建
COPY . .
RUN pnpm run build

# 运行阶段
FROM node:24-alpine

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/.output /app/.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]