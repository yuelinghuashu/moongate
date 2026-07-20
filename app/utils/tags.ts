// app/utils/tags.ts
export const ALLOWED_TAGS = [
  // ========== 编程语言 ==========
  'CSS',
  'HTML',
  'JavaScript',
  'Vue',
  'Go',
  'Compiler',
  'JSON',

  // ========== 框架与工具 ==========
  'Caddy',
  'Docker',
  'Nuxt',
  'PostgreSQL',
  'VSCode',

  // ========== 技术概念 ==========
  'CI/CD',
  'DSL',
  'Hydration',
  'i18n',
  'LLM',
  'OAuth',
  'ORM',
  'Performance',
  'Security',
  'SEO',
  'State Management',

  // ========== 设计与工程 ==========
  'Design System',
  'Theme',
  'Engineering', // 研发流程、代码规范、测试策略、CI/CD、配置等工程化内容
];

export const isValidTag = (tag: string) => ALLOWED_TAGS.includes(tag);