---
permalink: anRFIMChi09j7Z4IOUsNf
title: GitHub Actions + Docker 全自动容器化部署（Docker篇）
description: 通过容器化技术实现环境一致性，自动构建镜像并分发至私有仓库，用 Docker Compose 编排服务，彻底告别环境依赖。
date: 2026-03-14
tags: [GitHub Actions, Docker, 容器化, 自动化部署]
---

# GitHub Actions + Docker 全自动容器化部署（Docker篇）

## 前言

本教程将带你完成从传统部署到容器化部署的跨越，构建一套基于 **Docker** 的自动化 CI/CD 流水线。你将学会如何使用 GitHub Actions 自动构建 Docker 镜像，推送到阿里云容器镜像服务（ACR），并在服务器上用 Docker Compose 运行容器，实现真正的环境一致性。

> **最终效果**：本地 `git push` → 自动构建镜像 → 推送至私有仓库 → 服务器自动拉取新镜像 → 容器热重启 → 网站即刻更新（HTTPS 由 Caddy 自动管理）。

---

## 🎯 系统架构与核心理念

容器化部署的核心优势在于**环境一致性**和**依赖隔离**。我们通过 Docker 将应用及其依赖打包成镜像，通过镜像仓库分发，确保开发、测试、生产环境完全一致。

```
开发者本地 (Local)
↓ [git push]
GitHub 仓库 (Repository)
↓ [触发]
GitHub Actions (CI/CD 管道)
   ├─ 构建 Docker 镜像
   └─ 推送到阿里云 ACR
阿里云容器镜像服务 (ACR)
↓ [docker pull]
阿里云服务器 (ECS)
   ├─ 运行 Docker Compose
   └─ Caddy 反向代理 + HTTPS
用户访问 (HTTPS Website)
```

---

## 📦 前置准备

1. **一个 GitHub 仓库**（包含你的应用源码）
2. **一台阿里云 ECS 实例**（或任何具有公网 IP 的 Linux 服务器）
   - 推荐系统：Ubuntu 22.04 / 24.04
   - **安全组必须开放**：**SSH(22)**、**HTTP(80)**、**HTTPS(443)** 端口
3. **一个域名**（可选但推荐，用于 HTTPS）
4. **阿里云容器镜像服务（ACR）** 已开通，并创建好命名空间（如 `my-namespace`）
5. **本地安装 Docker**（可选，用于测试构建）

---

## 🚀 第一部分：阿里云 ACR 准备

### 1.1 设置固定密码
1. 登录 [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/)。
2. 进入你的实例（个人版），点击左侧 **访问凭证**。
3. 点击 **设置固定密码**，输入并保存密码（**非阿里云登录密码**，用于 Docker 客户端登录）。

### 1.2 获取 registry 地址
在实例详情页或镜像仓库列表，可以看到类似 `crpi-xxxx.cn-beijing.personal.cr.aliyuncs.com` 的域名，这就是你的 registry 地址。

### 1.3 创建命名空间和镜像仓库（可选）
你可以在控制台预先创建好命名空间和空仓库，也可以让 CI 第一次推送时自动创建（需命名空间已存在）。建议提前创建命名空间（例如 `moongate`），仓库名可后续定义。

---

## 🛠️ 第二部分：本地项目 Docker 化

### 2.1 编写 Dockerfile

在项目根目录创建 `Dockerfile`（以 Node.js 应用为例，其他语言类似）：

```dockerfile
# 构建阶段
FROM node:24-alpine AS builder

# 接收构建参数（用于客户端环境变量）
ARG NUXT_PUBLIC_SITE_URL
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL

WORKDIR /app

# 安装 pnpm（如使用 npm 则无需此行）
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
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

**说明**：
- 使用多阶段构建减小镜像体积。
- 通过 `ARG` 传递构建时环境变量（如 `NUXT_PUBLIC_SITE_URL`）。
- 根据你的包管理器调整 `pnpm` 为 `npm` 或 `yarn`。

### 2.2 编写 .dockerignore（可选）

创建 `.dockerignore` 文件，排除不需要的文件：

```
node_modules
.git
.env
.github
```

---

## 🔐 第三部分：配置 GitHub Secrets

在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 中添加以下 secrets：

| Secret 名称 | 说明 |
|------------|------|
| `ACR_REGISTRY` | ACR registry 域名，如 `crpi-xxxx.cn-beijing.personal.cr.aliyuncs.com` |
| `ACR_USERNAME` | 阿里云账号（邮箱） |
| `ACR_PASSWORD` | 在 ACR 设置的固定密码 |
| `SERVER_HOST` | 服务器公网 IP |
| `SERVER_USER` | 服务器 SSH 登录用户名（如 `root`、`ubuntu`） |
| `SSH_PRIVATE_KEY` | SSH 私钥（与静态/动态文档中生成方式相同） |
| `NUXT_PUBLIC_SITE_URL` | 如有构建时需要的环境变量，一并添加 |

---

## ⚙️ 第四部分：创建 GitHub Actions 工作流

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy with Docker

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    env:
      NUXT_PUBLIC_SITE_URL: ${{ secrets.NUXT_PUBLIC_SITE_URL }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Aliyun ACR
        uses: docker/login-action@v3
        with:
          registry: ${{ secrets.ACR_REGISTRY }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          build-args: |
            NUXT_PUBLIC_SITE_URL=${{ env.NUXT_PUBLIC_SITE_URL }}
          tags: |
            ${{ secrets.ACR_REGISTRY }}/moongate/moongate-blog:latest
            ${{ secrets.ACR_REGISTRY }}/moongate/moongate-blog:${{ github.sha }}

      - name: Deploy to Server via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/my-site
            # 写入环境变量（应用运行时所需）
            cat > .env << EOF
            NUXT_PUBLIC_SITE_URL=${{ secrets.NUXT_PUBLIC_SITE_URL }}
            # 添加其他环境变量
            EOF

            # 登录 ACR（确保服务器能拉取私有镜像）
            echo "${{ secrets.ACR_PASSWORD }}" | docker login ${{ secrets.ACR_REGISTRY }} -u "${{ secrets.ACR_USERNAME }}" --password-stdin

            # 拉取最新镜像
            docker compose pull nuxt-app

            # 重启容器（如果服务定义无变化，仅重启）
            docker compose up -d --no-deps nuxt-app

            # 清理旧镜像
            docker image prune -f
```

**关键说明**：
- 将 `moongate/moongate-blog` 替换为你的命名空间/仓库名。
- 如有多个环境变量，在 `script` 中写入 `.env` 文件。
- 如果服务器未安装 docker-compose 插件，需先安装（见下文）。

---

## 🏗️ 第五部分：服务器环境准备

### 5.1 安装 Docker 和 Docker Compose

通过 SSH 登录服务器，执行以下命令（基于 Ubuntu）：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt install ca-certificates curl

# 添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 添加 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 将当前用户加入 docker 组（避免每次 sudo）
sudo usermod -aG docker $USER
# 重新登录或执行 newgrp docker 使生效
```

验证安装：`docker --version` 和 `docker compose version`。

### 5.2 创建项目目录和 docker-compose.yml

```bash
mkdir -p /var/www/my-site
cd /var/www/my-site
```

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  nuxt-app:
    image: crpi-xxxx.cn-beijing.personal.cr.aliyuncs.com/moongate/moongate-blog:latest   # 替换为你的完整镜像地址
    container_name: nuxt-app
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

> **注意**：`ports` 将容器内 3000 端口映射到宿主机 3000 端口，如果后面使用 Caddy 反向代理，可以去掉 `ports` 并让 Caddy 容器与 app 容器在同一网络内通信。

### 5.3 配置 Caddy 反向代理（可选，推荐）

如果你希望用 Caddy 自动管理 HTTPS，可以在同一台服务器上安装 Caddy 并配置反向代理到 `nuxt-app:3000`（需将 `nuxt-app` 和 Caddy 容器加入同一网络）。具体可参考静态/动态文档中的 Caddy 配置部分，但注意目标地址改为容器服务名。

---

## 🧪 第六部分：首次部署与验证

### 6.1 停用原有服务（如有）
如果之前用 PM2 或其他方式运行应用，请先停止并释放端口：
```bash
pm2 stop moongate
pm2 delete moongate
```

### 6.2 手动测试登录与拉取（可选）
```bash
docker login crpi-xxxx.cn-beijing.personal.cr.aliyuncs.com -u '你的阿里云邮箱'
# 输入固定密码
docker pull crpi-xxxx.cn-beijing.personal.cr.aliyuncs.com/moongate/moongate-blog:latest
```
此时仓库可能为空，登录成功即可。

### 6.3 推送代码触发部署

将本地的 `Dockerfile` 和 `.github/workflows/deploy.yml` 提交并推送到 main 分支：

```bash
git add Dockerfile .github/workflows/deploy.yml
git commit -m "ci: migrate to Docker deployment"
git push origin main
```

### 6.4 监控部署

在 GitHub Actions 页面查看工作流运行情况。成功后，登录服务器检查容器状态：

```bash
cd /var/www/my-site
docker compose ps
docker compose logs nuxt-app
```

访问你的域名（或 IP），确认网站正常运行。

---

## 🔧 第七部分：后续维护与问题排查

### 7.1 常用命令

- 查看日志：`docker compose logs -f nuxt-app`
- 进入容器：`docker compose exec nuxt-app sh`
- 重启服务：`docker compose restart nuxt-app`
- 停止服务：`docker compose down`
- 更新镜像：推送代码后自动执行，或手动 `docker compose pull && docker compose up -d`

### 7.2 关键问题排查清单

| 现象                                  | 可能原因                                                                 | 解决方案                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actions 中登录 ACR 失败**           | 1. 用户名/密码错误 <br>2. 密码含特殊字符被转义                           | 1. 检查 Secrets 中的 `ACR_USERNAME` 和 `ACR_PASSWORD` <br>2. 在本地测试 `echo $密码 | docker login -u 用户名 --password-stdin` 确认                                     |
| **服务器拉取镜像失败**                 | 1. 未登录 ACR <br>2. 镜像地址错误 <br>3. 服务器时间不准                   | 1. 手动执行 `docker login` 测试 <br>2. 核对 `docker-compose.yml` 中的镜像地址 <br>3. 执行 `date` 检查时间，安装 ntpdate 同步                                           |
| **容器启动失败**                       | 1. 端口被占用 <br>2. 环境变量缺失 <br>3. 应用启动命令错误                 | 1. `sudo lsof -i :3000` 查看占用 <br>2. 检查 `.env` 文件 <br>3. 查看容器日志 `docker compose logs nuxt-app`                                                |
| **网站可以 HTTP 访问，但 HTTPS 报错** | 1. 安全组未开放 443 <br>2. Caddy 配置错误 <br>3. 域名解析未生效           | 1. 检查安全组规则 <br>2. `sudo caddy validate` <br>3. `nslookup yourdomain.com`                                                                             |
| **Caddy 返回 502 Bad Gateway**        | 1. 后端容器未运行 <br>2. Caddy 配置中目标地址错误                        | 1. `docker compose ps` 检查容器状态 <br>2. 确认 Caddyfile 中的 `reverse_proxy` 指向正确的容器名和端口（如 `nuxt-app:3000`）                                 |

### 7.3 查看日志

```bash
# 查看 Caddy 日志
sudo journalctl -u caddy -f

# 查看容器日志
docker compose logs -f nuxt-app
```

---

## 📈 总结：容器化部署的核心价值

通过本教程，你已成功搭建了一套**完全容器化、自动化的 CI/CD 流水线**，具备以下优势：

1. **环境一致性**：从开发到生产，镜像保证了运行时环境完全一致。
2. **依赖隔离**：每个应用运行在独立的容器中，互不干扰。
3. **简化运维**：升级只需推送代码，CI 自动构建、分发、重启。
4. **易于扩展**：可轻松在 `docker-compose.yml` 中添加数据库、缓存、反向代理等容器。
5. **可复现性**：镜像版本化，回滚只需指定旧镜像标签。

**至此，你已经完成了从传统部署到容器化部署的进化。结合前两篇的静态和动态部署知识，现在你可以根据项目需求灵活选择最合适的部署方式。**

---

> **下一步**：如果你需要更精细的控制（如服务发现、蓝绿部署），可以进一步探索 Kubernetes（K8s）等容器编排工具。但 Docker Compose 已经足够满足中小型项目的需求。