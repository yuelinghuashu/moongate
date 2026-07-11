// app/utils/tags.ts
export const ALLOWED_TAGS = [
  // ========== 编程语言 ==========
  'CSS',
  'Go',
  'HTML',
  'JavaScript',
  'Vue',
  'JSON',

  // ========== 框架与工具 ==========
  'Caddy',
  'Docker',
  'Nuxt',
  'PostgreSQL',
  'VSCode',

  // ========== 技术概念 ==========
  'CI/CD',
  'Hydration',
  'i18n',
  'OAuth',
  'ORM',
  'Performance',
  'Security',
  'SEO',
  'State Management',

  // ========== 设计与工程 ==========
  'Design System',
  'Theme',
  'Engineering',      // 研发流程、代码规范、测试策略、CI/CD、配置
];

export const isValidTag = (tag: string) => ALLOWED_TAGS.includes(tag);