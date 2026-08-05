// app/utils/tags.ts

export interface TagGroup {
  /** 分组标识，用于 i18n 翻译 */
  key: string;
  /** 分组内标签 */
  tags: string[];
}

export const TAG_GROUPS: TagGroup[] = [
  {
    key: 'language',
    tags: [
      'CSS',
      'HTML',
      'JavaScript',
      'TypeScript',
      'Vue',
      'Go',
      'Compiler',
      'JSON',
    ],
  },
  {
    key: 'framework',
    tags: ['Caddy', 'Docker', 'Nuxt', 'PostgreSQL', 'VSCode'],
  },
  {
    key: 'concept',
    tags: [
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
    ],
  },
  {
    key: 'engineering',
    tags: ['Design System', 'Theme', 'Engineering'],
    // Engineering: 研发流程、代码规范、测试策略、CI/CD、配置等工程化内容
  },
];

/** 扁平化标签列表（保持向后兼容） */
export const ALLOWED_TAGS: string[] = TAG_GROUPS.flatMap((group) => group.tags);

export const isValidTag = (tag: string) => ALLOWED_TAGS.includes(tag);