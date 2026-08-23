// utils/apiTypes.ts
// 共享 API 类型定义（前端 + 服务端通用）

/**
 * 文档项（对应 Go API 返回的 Doc 结构）
 */
export interface DocItem {
  permalink: string
  slug: string
  title: string
  description: string
  level: string
  series: string | null
  tags: string[]
  date: string
  content: string
  /** 实际返回内容的语言：zh | en */
  lang?: string
  /** 请求语言无译文时回退到了另一语言 */
  isFallback?: boolean
  /** 该 slug 是否存在英文译文 */
  hasTranslation?: boolean
}

/**
 * 文档列表 API 响应格式
 */
export interface DocsResponse {
  data: DocItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}