# Moongate

> 推开月之门，进入一个由代码构筑的探索空间。

[![Website](https://img.shields.io/badge/🌙-moongate.top-0284c7?style=flat-square)](https://moongate.top)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&style=flat-square)](https://nuxt.com)
[![License](https://img.shields.io/badge/License-MIT-3b82f6?style=flat-square)](LICENSE)

## ✨ 特性

- 🚀 **Nuxt 4** —— 基于最新版 Nuxt 构建
- 🌐 **国际化** —— 支持简体中文、English、日本語
- 🎨 **主题切换** —— 跟随系统 / 亮色 / 暗色
- ⚙️ **用户偏好** —— 主题、语言、默认视图持久化
- 🔍 **文档搜索** —— 实时搜索过滤
- 💻 **代码高亮** —— Shiki 服务端渲染，多主题支持
- 📱 **响应式** —— 桌面端与移动端适配

## 🛠️ 技术栈

| 类别     | 技术                                                       |
| -------- | ---------------------------------------------------------- |
| 框架     | Nuxt 4                                                     |
| 语言     | TypeScript                                                 |
| 样式     | UnoCSS                                                     |
| 内容     | Go API                                                     |
| 国际化   | Nuxt i18n                                                  |
| 状态管理 | Pinia                                                      |
| 组件库   | [moongate-vue](https://www.npmjs.com/package/moongate-vue) |
| 测试     | Vitest + @vue/test-utils + happy-dom                       |

## 🚀 快速开始

### 环境要求

- **Node.js** 22+
- **pnpm** 10+
- **后端 API** （[moongate-api](https://github.com/yuelinghuashu/moongate-api)）本地运行或线上地址

### 安装与运行

```bash
# 1. 安装依赖
pnpm install

# 2. 创建环境变量文件
cp .env.example .env

# 3. 启动开发服务器
pnpm dev
```

访问 `http://localhost:3000`

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `NUXT_PUBLIC_SITE_URL` | 站点公开 URL | `http://localhost:3000` |
| `NUXT_PUBLIC_API_URL` | 后端 API 地址 | `http://localhost:8080` |

## 🧪 测试

项目包含 59 个 Vitest 单元测试，覆盖核心 utils、composables 和业务逻辑。

```bash
pnpm test          # 运行全部测试
pnpm test:watch    # 监听模式运行测试
pnpm lint          # ESLint 代码检查
pnpm typecheck     # TypeScript 类型检查
```

## 📁 项目结构

```text
├── app/
│   ├── components/    # Vue 组件
│   ├── composables/   # 可复用逻辑（useDocs、useOutline 等）
│   ├── layouts/       # 布局组件
│   ├── pages/         # 页面路由
│   ├── stores/        # Pinia 状态管理
│   └── utils/         # 工具函数（XML、Markdown、sanitize）
├── i18n/
│   └── locales/       # 国际化语言文件（zh_cn / en / ja）
├── public/            # 静态资源
├── server/
│   ├── routes/        # 服务端路由（RSS / Atom / sitemap）
│   └── utils/         # 服务端工具
├── nuxt.config.ts     # Nuxt 配置
└── uno.config.ts      # UnoCSS 配置
```

## 🚀 自动化部署

- **CI/CD**：GitHub Actions，推送自动构建 + 自动测试
- **服务器**：Caddy（自动 HTTPS + www 重定向）

## 📄 SEO

- RSS Feed（`/feed.xml`、`/feed.atom`、`/feed.json`）
- robots.txt
- sitemap.xml（已提交 Google Search Console）

---

## 许可证

[MIT](./LICENSE)
