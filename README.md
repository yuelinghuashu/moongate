# Moongate

推开月之门，进入一个由代码构筑的探索空间。

👉 [https://moongate.top](https://moongate.top)

---


- 🚀 基于 Nuxt4 构建

- 🌐 多语言支持（中文 / 英文 / 日文）

- 🎨 主题切换（系统 / 亮色 / 暗色）

- ⚙️ 用户偏好设置（主题、语言、默认视图）

- 🔍 文档搜索

- 📱 响应式设计

- 📝 Nuxt Content 驱动

---

## 🛠️ 技术栈

- **框架**: Nuxt4

- **语言**: TypeScript

- **样式**: Tailwind CSS

- **内容**: Nuxt Content

- **国际化**: Nuxt i18n

- **状态管理**: Pinia

---

## 🚀 自动化部署

- **CI/CD**: GitHub Actions（推送即构建）
- **服务器**: Caddy（自动 HTTPS + www 301 重定向）

---

## 📄 SEO

- robots.txt
- sitemap.xml（已提交 Google Search Console）

---

## 📁 项目结构

```text
moongate/
├── .github/               # GitHub Actions 工作流
├── app/                   # 核心应用
│   ├── assets/           # 静态资源
│   ├── components/       # 组件
│   │   ├── article/     # 文档页专属
│   │   ├── error/       # 错误页
│   │   ├── layout/      # 布局框架
│   │   ├── navigation/  # 导航
│   │   └── shared/      # 全局复用
│   ├── composables/     # 组合式函数
│   ├── layouts/         # 页面布局
│   ├── middleware/      # 路由中间件
│   ├── pages/          # 路由页面
│   ├── stores/         # Pinia 状态管理
│   └── app.vue         # 根组件
├── caddy/               # Caddy 配置
│   └── Caddyfile
├── content/             # 内容管理
│   ├── about/          # 关于页面
│   ├── articles/       # 技术文档
│   └── i18n/          # 多语言文件
│       ├── en.json
│       ├── ja.json
│       └── zh_cn.json
├── public/             # 公共静态资源
│   ├── favicon.svg    # 站点图标
│   └── google*.html   # 站长验证文件
├── server/            # 服务端
│   └── routes/       # API 路由
│       ├── robots.txt.ts
│       └── sitemap.xml.ts
├── .env               # 环境变量
├── .gitignore
├── app.config.ts      # 应用配置
├── content.config.ts  # 内容配置
├── eslint.config.mjs  # 代码检查
├── LICENSE           # MIT 协议
├── nuxt.config.ts    # Nuxt 主配置
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── renovate.json     # 依赖更新配置
└── tsconfig.json    # TypeScript 配置
```

---

## 📄 协议

MIT © yuelinghuashu

<details>
<summary>🧪 想本地跑起来？</summary>

```bash
git clone https://github.com/yuelinghuashu/moongate.git
cd moongate
pnpm install
pnpm run dev
```

</details>
