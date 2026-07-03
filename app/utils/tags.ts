// app/utils/tags.ts
export const ALLOWED_TAGS = [
  // ========== 编程语言 ==========
  'CSS',
  'Go',
  'HTML',
  'JavaScript',
  'SQL',
  'TypeScript',
  'Vue',
  'JSON',

  // ========== 框架与工具 ==========
  'Caddy',
  'Docker',
  'Gin',
  'GORM',
  'GitHub Actions',
  'Nuxt',
  'PostgreSQL',
  'VSCode',

  // ========== 技术概念 ==========
  'CI/CD',
  'Deployment',
  'Hydration',
  'i18n',
  'Monitoring',
  'OAuth',
  'ORM',
  'Performance',
  'Security',
  'SEO',
  'State Management',

  // ========== 设计相关 ==========
  'Design System',
  'Theme',

  // ========== 工程实践 ==========
  'Architecture',      // 项目结构、分层设计、模块划分、技术选型
  'Engineering',       // 研发流程、CI/CD、代码规范、测试策略
  'Configuration',     // 环境变量、多环境切换、配置管理
];

export const isValidTag = (tag: string) => ALLOWED_TAGS.includes(tag);