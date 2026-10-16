// utils/docs.ts
// 内容 API 的唯一 URL/参数来源（前端所有调用点都从这里取路径）。
//
// 为什么集中：此前同一份后端语义有三套拼法——列表用 URLSearchParams、
// 系列分组用模板字符串 + `&lang=` 后缀拼接、详情用另一个函数手拼 `?lang=`，
// 参数名（size/limit）与默认值也跟着散落。集中后：
//   - 参数名与后端保持一致（page/limit/search/searchMode/tag/group/content/lang）；
//   - URL 同时充当 useAsyncData 的缓存标识（key 直接用 URL），
//     请求内容与缓存 key 不可能再各说一套。

/** 内容 API 的路径常量（唯一来源，避免各处手写字符串） */
const API_DOCS = '/api/docs'

/** 搜索模式（与后端 domain.SearchMode 对齐） */
export type SearchMode = 'all' | 'title' | 'description'

/** 列表接口的查询参数 */
export interface DocsQuery {
  page?: number
  /** 每页条数；后端默认 10、上限 100（见 moongate-api internal/api/docs.go） */
  limit?: number
  search?: string
  searchMode?: SearchMode
  /** 标签，可多个（URL 中为 ?tag=a&tag=b） */
  tags?: readonly string[]
  /** group=series 时返回系列分组 */
  group?: 'series'
  /** content=true 时列表项带上正文（feed/sitemap 用） */
  content?: boolean
  /** 内容语言：仅 'en' 触发英文内容 */
  lang?: string
}

/**
 * 将 i18n locale 映射为内容 API 的 lang 参数。
 *
 * 后端只区分"英文"与"默认中文"，因此这里返回 'en' 或 ''。
 * ja 等界面语言拿到的是中文正文（后端 README 已写明）。
 */
export function resolveLangParam(locale: string): string {
  return locale === 'en' ? 'en' : ''
}

/**
 * 构建列表接口 URL（含查询串）。
 *
 * @example
 * docsApiUrl({ page: 2, tags: ['Go'] }) // '/api/docs?page=2&tag=Go'
 */
export function docsApiUrl(query: DocsQuery = {}): string {
  const params = new URLSearchParams()

  if (query.page !== undefined) params.append('page', String(query.page))
  if (query.limit !== undefined) params.append('limit', String(query.limit))
  if (query.search) params.append('search', query.search)
  if (query.searchMode) params.append('searchMode', query.searchMode)
  for (const tag of query.tags ?? []) params.append('tag', tag)
  if (query.group) params.append('group', query.group)
  if (query.content) params.append('content', 'true')
  if (query.lang) params.append('lang', query.lang)

  const qs = params.toString()
  return qs ? `${API_DOCS}?${qs}` : API_DOCS
}

/**
 * 构建单篇详情 URL。
 *
 * @example
 * docDetailApiUrl('a/b', 'en') // '/api/docs/a%2Fb?lang=en'
 */
export function docDetailApiUrl(slug: string, lang?: string): string {
  const path = `${API_DOCS}/${encodeURIComponent(slug)}`
  return lang ? `${path}?${new URLSearchParams({ lang })}` : path
}

/**
 * 安全解析日期字符串，无效时返回 fallback
 */
export function safeParseDate(dateStr: string, fallback: Date = new Date()): Date {
  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? fallback : date
  } catch {
    return fallback
  }
}
