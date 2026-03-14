---
permalink: sA2qPU6rJ1do_b-i
title: GitHub Actions + Caddy 全自动部署动态网站（动态篇）
description: 深入后端服务的进程管理、环境变量注入、数据库迁移，结合 Caddy 反向代理，打造完整的动态应用部署流水线。
date: 2026-01-23
tags: [GitHub Actions, Caddy, 动态网站]
---

# GitHub Actions + Caddy 全自动部署动态网站（动态篇）

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
   - **安全组必须开放**：**SSH(22)**、**HTTP(80)**、**HTTPS(443)** 端口（请登录云服务商控制台检查确认）
3. **一个域名**（可选但推荐，用于 HTTPS）
4. **根据你的技术栈安装运行时环境**（本教程以 Node.js 为例，后续步骤会安装）

---

## 🚀 第一部分：服务器初始化

### 1.1 登录并安装基础软件

通过 SSH 登录你的云服务器（假设登录用户名为 `your-user`，后续步骤中请将 `$USER` 替换为实际用户名）。

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装 Node.js（示例使用 Node 24）
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2（进程管理，用于保持应用运行）
sudo npm install -g pm2

# 安装 Caddy（作为反向代理和 HTTPS 终端）
sudo apt install caddy

# 创建应用目录，并将所有权交给当前登录用户（确保后续部署有写入权限）
sudo mkdir -p /var/www/my-dynamic-app
sudo chown -R $USER:$USER /var/www/my-dynamic-app
```

> **💡 提示**：如果你使用其他语言（如 Python），请在此步安装对应的运行时（例如 `python3-pip`、`virtualenv` 等）。

### 1.2 配置 Caddy 作为反向代理

假设你的应用将运行在本地 `127.0.0.1:3000` 端口（请根据你的项目调整端口号）。

```bash
sudo nano /etc/caddy/Caddyfile
```

内容如下（替换 `example.com` 为你的域名，并确认端口与应用端口一致）：

```caddy
example.com, www.example.com {
    # 反向代理到本地的应用进程
    reverse_proxy 127.0.0.1:3000
    # 启用压缩
    encode gzip zstd
}
```

保存并验证配置：

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
sudo systemctl status caddy
```

> **💡 提示**：如果使用域名，Caddy 会在首次访问时自动申请 SSL 证书；如果使用 IP，请将地址改为 `http://你的服务器IP` 并移除 `encode` 等指令（但无法启用 HTTPS）。

---

## 🔐 第二部分：配置 SSH 密钥对与 GitHub Secrets

自动化部署的核心是让 GitHub Actions 能安全地连接到你的服务器并执行命令。

### 2.1 在本地生成 SSH 密钥对

在你的**本地电脑**（而非服务器）上执行：

```bash
# 生成一对新的密钥，专用于自动化部署
ssh-keygen -t ed25519 -f ~/.ssh/id_github_actions_dynamic -N ""
```

这将生成两个文件：
- **私钥** (`~/.ssh/id_github_actions_dynamic`)：**绝密**，相当于你的“钥匙”。
- **公钥** (`~/.ssh/id_github_actions_dynamic.pub`)：可以公开，相当于“锁芯”。

### 2.2 将公钥部署到服务器

1. 复制公钥内容：

   ```bash
   cat ~/.ssh/id_github_actions_dynamic.pub
   ```

2. **登录你的云服务器**，将公钥添加到授权列表：

   ```bash
   # 将上一步复制的公钥内容，粘贴到引号内，然后执行整条命令
   echo '你的公钥内容' >> ~/.ssh/authorized_keys
   # 设置正确的权限（非常重要！）
   chmod 600 ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   ```

### 2.3 将私钥配置为 GitHub Secrets

1. 查看私钥内容：

   ```bash
   cat ~/.ssh/id_github_actions_dynamic
   ```

2. 进入你的 GitHub 仓库，点击 **Settings** → **Secrets and variables** → **Actions**。
3. 点击 **New repository secret**，添加以下三个密钥：
   - **`SERVER_HOST`**：你的云服务器**公网 IP 地址**。
   - **`SERVER_USER`**：用于 SSH 登录的用户名（例如 `root`、`ubuntu` 或你在服务器上使用的用户名）。
   - **`SSH_PRIVATE_KEY`**：粘贴你刚刚复制的**完整私钥内容**（包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----` 行）。

4. **如有构建时需要环境变量**（如数据库连接串、API密钥），请一并添加到 Secrets 中（例如 `DATABASE_URL`、`API_KEY`）。

---

## ⚙️ 第三部分：创建 GitHub Actions 工作流

在项目根目录创建文件：`.github/workflows/deploy.yml`

以下示例以 Node.js 项目为例，并包含构建、依赖安装、进程重启。如果你使用其他技术栈，请替换相应的命令。

```yaml
name: Deploy Dynamic App to Production

on:
  push:
    branches: [ main ]   # 可根据需要调整分支

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # 设置 Node.js 环境（按需调整或替换为其他语言环境）
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'   # 如果使用 pnpm 或 yarn，请相应调整

      # 安装依赖（示例为 npm，可根据项目修改）
      - name: Install dependencies
        run: npm ci

      # 运行测试（可选）
      - name: Run tests
        run: npm test

      # 构建项目（如需环境变量，通过 env 传入）
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          API_KEY: ${{ secrets.API_KEY }}

      # 同步代码到服务器（使用 rsync）
      - name: Deploy to Server via Rsync
        uses: burnett01/rsync-deployments@7.0.1
        with:
          switches: -avz --delete
          path: ./   # 同步整个项目（可以调整为只同步必要目录，如 dist/、node_modules 除外）
          remote_path: /var/www/my-dynamic-app/
          remote_host: ${{ secrets.SERVER_HOST }}
          remote_user: ${{ secrets.SERVER_USER }}
          remote_key: ${{ secrets.SSH_PRIVATE_KEY }}

      # 在服务器上执行远程命令（重启应用、运行迁移等）
      - name: Remote execution
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/my-dynamic-app
            # 安装生产依赖（如需）
            npm ci --only=production
            # 执行数据库迁移（如需要）
            # npm run migrate   # 示例命令，请根据实际调整
            # 重启应用（使用 PM2，如果尚未启动则创建）
            if pm2 describe my-app > /dev/null 2>&1; then
              pm2 reload my-app
            else
              pm2 start npm --name "my-app" -- start
              # 设置 PM2 开机自启（仅首次需要）
              pm2 save
              pm2 startup
            fi
            pm2 save   # 确保进程列表保存
```

**关键配置说明**：

- **`path`**：rsync 的源路径，可以是整个项目目录，也可以是构建后的产物目录（如 `dist/`）。建议根据项目情况调整。
- **`remote_path`**：服务器上存放代码的目录，必须与 Caddy 配置无关（Caddy 只代理到端口，不关心文件位置）。
- **远程脚本**：根据你的项目进行定制，例如安装依赖、运行迁移、重启进程等。示例使用了 PM2，如果使用 systemd 或其他工具，请相应修改。
- **环境变量**：构建时所需变量通过 `env` 传入，并从 GitHub Secrets 读取。如果应用运行时也需要变量，建议在服务器上维护一个 `.env` 文件，或通过 PM2 的 `--env` 参数传递。

---

## 🧪 第四部分：触发首次部署与验证

### 4.1 提交并推送代码

将工作流配置文件添加到 Git 并推送到仓库，触发首次自动化部署。

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: 添加动态网站自动化部署"
git push origin main
```

### 4.2 监控部署过程

1. 进入 GitHub 仓库的 **Actions** 标签页。
2. 你会看到名为 “Deploy Dynamic App to Production” 的工作流正在运行。
3. 点击进入，实时查看每个步骤的日志。
4. 当所有步骤显示绿色对勾（✅），表示部署成功。

### 4.3 验证服务

- 访问 `https://你的域名`（或 `http://服务器IP:应用端口`）。
- 确认网站功能正常。
- 检查服务器上进程状态：`pm2 status`（或其他进程管理工具）。

---

## 🔧 第五部分：高级配置与问题排查

### 5.1 环境变量管理

动态网站通常需要敏感配置。推荐两种方式：

- **方式一**：在服务器上创建 `.env` 文件（位于应用目录），并在部署脚本中保持不变。PM2 或应用框架会自动读取。
- **方式二**：通过 GitHub Secrets 在部署时注入，如在远程脚本中创建 `.env` 文件（注意保密）。

### 5.2 数据库迁移自动化

若项目使用迁移工具，可在远程脚本中加入迁移命令，例如：

```bash
npm run migrate
```

请确保迁移命令幂等（可重复执行安全），或仅在必要时执行。

### 5.3 关键问题排查清单

| 现象                                  | 可能原因                                                                             | 解决方案                                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actions 日志卡在 SSH 连接**         | 1. SSH 密钥格式错误 <br>2. 安全组未开放 22 端口 <br>3. 服务器 `sshd_config` 配置限制 | 1. 检查私钥格式，确保在 GitHub Secrets 中完整、多行 <br>2. 检查阿里云安全组入方向规则 <br>3. 检查服务器 `/etc/ssh/sshd_config` 中的 `PermitRootLogin` 和 `AllowUsers` 设置 |
| **网站可以 HTTP 访问，但 HTTPS 报错** | 1. 域名 DNS 解析未生效或错误 <br>2. 安全组未开放 443 端口                            | 1. 运行 `nslookup yourdomain.com` 检查 DNS 解析 <br>2. 检查安全组 443 端口规则                                                                                             |
| **Caddy 返回 502 Bad Gateway**        | 1. 后端应用未运行 <br>2. Caddy 配置中端口错误 <br>3. 应用绑定地址不是 127.0.0.1     | 1. 检查 `pm2 status` 确认应用运行 <br>2. 核对 Caddyfile 中的端口 <br>3. 确保应用监听 `127.0.0.1` 而非 `0.0.0.0`                                                            |
| **应用启动失败**                      | 1. 依赖未安装 <br>2. 环境变量缺失 <br>3. 端口被占用                                  | 1. 登录服务器手动运行 `npm ci` <br>2. 检查 `.env` 文件 <br>3. 使用 `netstat -tlnp` 查看端口占用                                                                            |
| **数据库连接失败**                    | 1. 数据库服务未启动 <br>2. 连接字符串错误                                            | 1. 检查数据库状态（如 `systemctl status mysql`） <br>2. 核对 `.env` 中的连接串                                                                                            |

### 5.4 查看日志

```bash
# 查看应用日志（PM2）
pm2 logs my-app

# 查看 Caddy 日志
sudo journalctl -u caddy -f

# 查看系统认证日志（SSH问题）
sudo tail -f /var/log/auth.log
```

---

## 📈 总结：动态网站自动化部署的核心价值

通过本教程，你已经搭建了一套**全自动、可监控、易回滚**的动态网站部署系统，具备以下优势：

1. **一键部署**：从代码推送到服务上线，全程自动化。
2. **进程守护**：通过 PM2（或类似工具）保持应用持续运行，崩溃自动重启。
3. **HTTPS 自动管理**：Caddy 自动处理 SSL 证书申请与续期。
4. **环境一致性**：依赖在每次部署时重新安装，避免环境漂移。
5. **快速回滚**：如需回滚，只需 `git revert` 并推送，Actions 会自动执行旧版本部署。

**从此，你可以专注于业务开发，将构建、测试、部署、运维的复杂性交给自动化系统处理。**

---

> **下一步**：如果你希望实现更高级的环境隔离和可重复性，可以考虑将应用容器化（Docker）。基于本教程的自动化基础，你可以轻松扩展为 Docker 部署流程。