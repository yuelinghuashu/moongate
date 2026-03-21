// app/utils/tags.ts
export const ALLOWED_TAGS = [
  // 技术栈
  'Nuxt', 'Vue', 'Docker', 'Caddy', 'GitHub Actions', 'Drizzle', 'PostgreSQL', 'VSCode',

  // 领域概念
  'CI/CD', 'ORM', 'OAuth', 'i18n', 'SEO', 'RSS',
  'Design System',       // 设计系统
  'Theme',               // 主题
  'State Management',    // 状态管理
  'Hydration',           // 水合

  // 技术主题
  'Monitoring',          // 监控
  'Umami',               // Umami
  'Deployment',          // 部署
  'Performance',         // 性能
  'Security',            // 安全
  'Content Rendering',   // 内容渲染

  // 工程实践
  'Engineering',         // 工程化
  'Architecture',        // 原架构
  'Modularization',      // 模块化
  'Configuration',       // 配置
];

export const isValidTag = (tag: string) => ALLOWED_TAGS.includes(tag);