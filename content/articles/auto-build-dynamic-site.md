---
date: 2026-01-23
title: 从零到一：GitHub Actions + Caddy 全自动部署动态网站实战
decription: 全自动部署静态网站实战教程，从零到一，一步步搭建自动化部署系统。
tags: [GitHub Actions, Caddy, 动态网站]
---

# 从零到一：GitHub Actions + Caddy 全自动部署动态网站实战

本教程将指导你如何为动态网站搭建一套完整的自动化部署系统，实现 **“代码推送即发布”** 的 DevOps 流程。我们将使用 **Node.js + Express** 作为示例后端，但整体架构与配置方法同样适用于 Python（Django/Flask）、Java（Spring Boot）、PHP（Laravel）等动态网站技术栈。

> **最终效果**：本地 `git push` → 自动测试 → 构建 → 部署至云服务器 → 服务热重启 → 网站即刻更新（HTTPS 自动启用）。

---

## 🎯 系统架构与核心理念

与静态网站不同，动态网站部署不仅需要同步文件，还需要：

1. 安装运行时环境
2. 安装项目依赖
3. 可能需要数据库迁移
4. 重启应用进程（如 PM2、systemd 服务）
5. 配置反向代理（Caddy 作为反向代理到后端端口）

整个流程依然基于 **声明式自动化**，通过 GitHub Actions 实现端到端无人值守部署。

```
text
开发者本地 (Local)
↓ [git push]
GitHub 仓库 (Repository)
↓ [触发]
GitHub Actions (CI/CD 管道)
↓ [构建、测试、同步、远程执行命令]
阿里云服务器 (Alibaba Cloud ECS)
↓ [Caddy 反向代理 + HTTPS]
用户访问 (HTTPS Dynamic Website)
```

---

## 📦 前置准备

1. **一个 GitHub 仓库**（包含你的动态网站源码）
2. **一台云服务器**（阿里云 ECS、腾讯云 CVM 等均可）
   - 推荐系统：Ubuntu 22.04 / Alibaba Cloud Linux 3
   - 安全组开放：**SSH(22)**、**HTTP(80)**、**HTTPS(443)**、**应用端口（如 3000）**
3. **一个域名**（可选但推荐，用于 HTTPS）
4. **安装好 Node.js 运行时**（如果使用其他语言，请提前安装对应环境）

---

## 🚀 第一部分：服务器初始化

### 1.1 登录并安装基础软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js（示例使用 Node 20）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2（进程管理，用于保持应用运行）
sudo npm install -g pm2

# 安装 Caddy（作为反向代理和 HTTPS 终端）
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 1.2 创建应用目录并授权

```bash
# 创建应用目录
sudo mkdir -p /var/www/my-dynamic-app
sudo chown -R $USER:$USER /var/www/my-dynamic-app
sudo chmod -R 755 /var/www/my-dynamic-app
```

### 1.3 配置 Caddy 作为反向代理

假设你的 Node.js 应用运行在 `127.0.0.1:3000`。

```bash
sudo nano /etc/caddy/Caddyfile
```

内容如下（替换 `example.com` 为你的域名）：

```caddy
example.com, www.example.com {
    # 反向代理到本地的 Node.js 应用
    reverse_proxy 127.0.0.1:3000
    # 启用压缩
    encode gzip zstd
}

# HTTP 自动跳转 HTTPS
http://example.com, http://www.example.com {
    redir https://{host}{uri} permanent
}
```

保存并验证配置：

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
sudo systemctl status caddy
```

---

## 🔐 第二部分：配置 SSH 密钥对与 GitHub Secrets

与静态网站相同，我们需要让 GitHub Actions 能通过 SSH 连接到服务器并执行命令。

### 2.1 在本地生成 SSH 密钥对

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_github_actions_dynamic -N ""
```

### 2.2 将公钥部署到服务器

1. 复制公钥：
   ```bash
   cat ~/.ssh/id_github_actions_dynamic.pub
   ```

2. 登录服务器，添加到 `authorized_keys`：
   ```bash
   echo '你的公钥内容' >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   ```

### 2.3 在 GitHub 仓库中添加 Secrets

进入仓库 **Settings → Secrets and variables → Actions**，添加：

- `SERVER_HOST`：服务器公网 IP
- `SERVER_USER`：登录用户名（如 `ubuntu`）
- `SSH_PRIVATE_KEY`：完整的私钥内容

---

## ⚙️ 第三部分：创建 GitHub Actions 工作流

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy Dynamic App to Production

on:
  push:
    branches: [ main ]

jobs:
  ci:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest]
        node: [22]

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Install node
        uses: actions/setup-node@v6
        with:
          node-version: ${{ matrix.node }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm run lint

      - name: Build
        run: pnpm run build

      - name: Deploy to Server via Rsync
        uses: burnett01/rsync-deployments@7.0.1
        with:
          switches: -avz --delete # 递归、压缩、同步删除
          path: .output/ # 👈 Nuxt 的文件输出目录
          remote_path: /var/www/my-site/ # 👈 服务器上的目标目录
          remote_host: ${{ secrets.SERVER_HOST }} # 服务器 IP
          remote_user: ${{ secrets.SERVER_USER }} # 登录用户名
          remote_key: ${{ secrets.SSH_PRIVATE_KEY }} # SSH 私钥

      - name: Start/Reload Node.js service
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            echo "🚀 启动 Node.js SSR 服务..."
            cd /var/www/my-site
            
            # 启动或重启 Nuxt 应用
            if pm2 describe nuxt-app > /dev/null 2>&1; then
              echo "🔄 重启现有应用..."
              pm2 reload nuxt-app
            else
              echo "🚀 启动新应用..."
              pm2 start server/index.mjs --name "nuxt-app" \
                --log /var/log/nuxt-app.log \
                --error /var/log/nuxt-app-error.log \
                --output /var/log/nuxt-app-out.log \
                --time
              
              # 保存 PM2 配置以便开机自启
              pm2 save
            fi
            
            echo "✅ 服务启动完成"
            pm2 status nuxt-app
```

> **说明**：
> - 我们使用 `appleboy/ssh-action` 在服务器上直接执行命令
> - 步骤包括：拉取代码、安装生产依赖、重启 PM2 进程
> - 如果是其他语言，替换 `npm ci` 和 `pm2` 命令即可（如 `pip install -r requirements.txt` + `systemctl restart myapp`）

---

## 🧪 第四部分：触发首次部署与验证

### 4.1 推送代码

```bash
git add .github/workflows/deploy.yml
git commit -m “feat: 添加动态网站自动化部署”
git push origin main
```

### 4.2 监控部署过程

1. 进入 GitHub 仓库的 **Actions** 标签页
2. 查看运行日志，确认每一步是否成功
3. 如果失败，检查日志中的错误信息（常见于依赖安装、权限或进程启动）

### 4.3 验证服务

- 访问 `https://你的域名`
- 或 `http://服务器IP:服务器端口`
- 检查应用是否正常运行，并确认 HTTPS 是否生效

---

## 🔧 第五部分：高级配置与问题排查

### 5.1 环境变量管理

动态网站通常需要环境变量（如数据库连接串、API 密钥）。建议在服务器上创建 `.env` 文件，并在部署流程中保持不变。

```bash
# 在服务器上
cd /var/www/my-dynamic-app
nano .env
# 填入你的环境变量
```

在 PM2 或 systemd 配置中加载该文件。

### 5.2 数据库迁移自动化

如果你的项目使用数据库迁移工具（如 Sequelize、Alembic、Laravel Migrate），可以在部署脚本中加入迁移命令：

```yaml
- name: Deploy to Server via SSH
  uses: appleboy/ssh-action@v1.0.3
  with:
    ...
    script: |
      cd /var/www/my-dynamic-app
      git pull origin main
      npm ci --only=production
      npx sequelize db:migrate  # 迁移数据库
      pm2 restart my-app
```

### 5.3 关键问题排查清单

| 现象                           | 可能原因                                  | 解决方案                                                                                   |
| ---------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| **应用启动失败**                   | 1. 环境变量缺失 <br>2. 端口被占用 <br>3. 依赖安装失败  | 1. 检查 `.env` 文件 <br>2. 使用 `netstat -tlnp` 查看端口占用 <br>3. 查看 `npm ci` 或 `pip install` 日志 |
| **Caddy 返回 502 Bad Gateway** | 1. 后端应用未运行 <br>2. Caddy 配置中端口错误       | 1. 用 `pm2 list` 或 `systemctl status` 检查应用进程 <br>2. 核对 Caddyfile 中的 `reverse_proxy` 端口  |
| **数据库连接失败**                  | 1. 数据库服务未启动 <br>2. 迁移脚本出错 <br>3. 凭证错误 | 1. 重启数据库服务 <br>2. 检查迁移日志 <br>3. 核对连接字符串                                                |
| **部署过程中 SSH 执行失败**           | 1. 脚本权限不足 <br>2. 路径错误 <br>3. 命令不存在    | 1. 使用 `sudo` 或在脚本前加 `cd /正确路径` <br>2. 使用 `which pm2` 确认命令路径                            |

### 5.4 查看日志

```bash
# 查看应用日志（PM2）
pm2 logs my-app

# 查看 Caddy 日志
sudo journalctl -u caddy -f

# 查看系统日志
sudo tail -f /var/log/syslog
```

---

## 📈 总结：动态网站自动化部署的核心价值

通过本教程，你已经搭建了一套**全自动、可监控、易回滚**的动态网站部署系统，具备以下优势：

1. **一键部署**：从代码推送到服务上线，全程自动化
2. **进程守护**：通过 PM2 保持应用持续运行，崩溃自动重启
3. **HTTPS 自动管理**：Caddy 自动处理 SSL 证书申请与续期
4. **环境一致性**：依赖在每次部署时重新安装，避免环境漂移
5. **快速回滚**：如需回滚，只需 `git revert` 并推送，Actions 会自动执行旧版本部署

**从此，你可以专注于业务开发，将构建、测试、部署、运维的复杂性交给自动化系统处理。**

---

如果你使用的是 **Docker**，还可以进一步容器化部署，实现更高程度的环境一致性。欢迎基于本教程继续探索更先进的部署模式。