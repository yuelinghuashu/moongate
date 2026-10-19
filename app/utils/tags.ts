// app/utils/tags.ts

export interface TagGroup {
  /** 分组标识，用于 i18n 翻译 */
  key: string;
  /** 分组内标签 */
  tags: string[];
}

/**
 * 筛选面板的标签白名单。
 *
 * 组内顺序 = 内容里该标签的文章数降序（2026-10-19 按 68 篇中文文章统计），
 * 让高频标签落在视线最先到的地方。新增标签时按同一规则插入。
 *
 * 注意：这份白名单是**手工同步**的，与 moongate-api 的 frontmatter 标签是两份数据，
 * 两边对不上时就会出现"卡片显示但筛不到"（`SSR`，1 篇在用）或"面板里有但永远空"（历史遗留）。
 * 根本解法是由后端按内容聚合标签，届时本文件只保留 tag → 分组 的映射。
 */
export const TAG_GROUPS: TagGroup[] = [
  {
    key: "language",
    tags: [
      "Go",
      "Vue",
      "Compiler",
      "TypeScript",
      "CSS",
      "Dart",
      "C#",
      ".NET",
      "HTML",
      "JavaScript",
      "JSON",
    ],
  },
  {
    key: "framework",
    tags: [
      "Nuxt",
      "PostgreSQL",
      "Caddy",
      "VSCode",
      "Docker",
      "Flutter",
      "Godot",
    ],
  },
  {
    key: "concept",
    tags: [
      "LLM",
      "CI/CD",
      "Performance",
      "ORM",
      "State Management",
      "Security",
      "Agent",
      "DSL",
      "Hydration",
      "i18n",
      "SEO",
      "Encoding",
      "OAuth",
    ],
  },
  {
    key: "engineering",
    tags: ["Engineering", "Design System", "Theme"],
    // Engineering: 研发流程、代码规范、测试策略、CI/CD、配置等工程化内容
  },
];
