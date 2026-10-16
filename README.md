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
- **后端 API**

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

| 变量                   | 说明          | 示例                    |
| ---------------------- | ------------- | ----------------------- |
| `NUXT_PUBLIC_SITE_URL` | 站点公开 URL  | `http://localhost:3000` |
| `NUXT_PUBLIC_API_URL`  | 后端 API 地址 | `http://localhost:8080` |

## 🧪 测试与检查

CI 的 `test` job 会依次跑这三条命令（缺一不可）：

```bash
pnpm test          # Vitest 单元测试（75 个）
pnpm typecheck     # 类型检查：API 契约断言（apiContract.test.ts）只在这里才会失败
pnpm lint          # ESLint 代码检查
```

> `pnpm typecheck` 不能省：`expectTypeOf` 在 `vitest run` 下是运行期空操作，
> 只有类型检查才会真正比对 `app/utils/apiTypes.ts` 与后端 DTO 的字段。
> 仅跑 `pnpm test` 时，那份"编译期护栏"是纸面护栏。

## 🔌 与后端 API 的分工

内容来自 Go API，前端**只渲染、不重复判断**：

| 关注点                                   | 归属       | 说明                                                            |
| ---------------------------------------- | ---------- | --------------------------------------------------------------- |
| 语言回退、排序、过滤、分页、系列顺序     | 后端       | 前端不自行排序/过滤，`/api/docs` 的顺序即最终顺序               |
| 正文 HTML 与清洗                         | 后端       | 加载期白名单清洗一次；前端 `v-html` 直接渲染，无运行期清洗      |
| 代码高亮（Shiki）                        | 前端       | 后端只产出 `<pre><code class="language-*">`，前端替换为高亮结果 |
| 站点 SEO 产物（feed / sitemap / robots） | 前端 Nitro | 经 `server/utils/docs.ts` 取数后自行拼装                        |

关键约定：

- **URL 构建只有一处**：`app/utils/docs.ts` 的 `docsApiUrl()` / `docDetailApiUrl()`。
  这套 URL 同时用作 `useAsyncData` 的缓存 key，因此"请求什么"和"缓存什么"不可能不一致。
- **筛选状态只有一个来源**：URL。`app/composables/useDocs.ts` 从 `route.query` 派生筛选条件，
  写入只有 `setFilters()` 一个入口（一次 `router.replace`），因此深链、刷新、
  前进/后退天然正确，也不存在"批量改参数互相覆盖"的问题。
- **`limit` 上限由后端定义**（默认 10、上限 100，并按真实生效值回显）；
  需要全量内容时按响应信封的 `totalPages` 翻页，不要自己假设页大小。
- **`lang` 只认 `en`**：`ja` 等界面语言拿到的是中文正文，`isFallback` 只表示
  "请求了 en 但没有译文"，不能用来判断"当前语言是否有译文"。

## 📁 项目结构

```text
├── app/
│   ├── components/    # Vue 组件（列表/标签筛选的筛选状态由页面经 props 传入）
│   ├── composables/   # 可复用逻辑（useDocs 筛选+取数、useDocDetail、useOutline…）
│   ├── layouts/       # 布局组件
│   ├── pages/         # 页面路由
│   ├── stores/        # Pinia 状态管理（用户偏好 + 阅读界面开关，唯一来源）
│   └── utils/         # 工具函数（API URL/类型、HTML 实体解码、XML、导航）
├── i18n/
│   └── locales/       # 国际化语言文件（zh_cn / en / ja）
├── public/            # 静态资源
├── server/
│   ├── routes/        # 服务端路由（RSS / Atom / sitemap / robots）
│   └── utils/         # 服务端取数与 feed 拼装
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
