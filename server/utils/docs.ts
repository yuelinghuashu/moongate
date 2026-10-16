// server/utils/docs.ts
// 服务端 API 请求工具（Nuxt server 自动导入）

import { docsApiUrl, type DocsQuery } from '../../app/utils/docs'
import type { ApiDocDetail, ApiDocSummary, DocsResponse } from '../../app/utils/apiTypes'

/** 单页请求量：与后端上限一致（moongate-api internal/api/docs.go: maxLimit=100）。
 *  取满上限只是减少往返次数；**正确性不依赖它**——翻页以响应信封的 totalPages 为准，
 *  后端将来若调整上限（响应会回显真实生效值），这里也不会漏文章。 */
const PAGE_SIZE = 100

/** 带正文的取数（feed 用） */
export function fetchDocs(
  apiUrl: string,
  options: { includeContent: true, limit?: number },
): Promise<ApiDocDetail[]>
/** 不带正文的取数（sitemap 用） */
export function fetchDocs(
  apiUrl: string,
  options?: { includeContent?: false, limit?: number },
): Promise<ApiDocSummary[]>

/**
 * 获取文档列表（服务端专用，用于 feed / sitemap 这类需要全量产物的路由）。
 *
 * 翻页依据是**响应信封**里的 totalPages，而不是前端自己猜的页面大小：
 * 旧实现硬编码了一个 "后端限制保护 MAX_PAGE_SIZE=100"（后端当时并没有这个上限），
 * 并且用自己请求的值而不是后端真实生效值来判断是否取完，上限一旦变化就会静默漏数据。
 *
 * @param apiUrl - 后端 API 基地址
 * @param options.includeContent - 是否要正文（feed 需要，sitemap 不需要）
 * @param options.limit - 最多取多少篇，默认取完为止
 */
export async function fetchDocs(
  apiUrl: string,
  options: { includeContent?: boolean, limit?: number } = {},
): Promise<ApiDocSummary[]> {
  const { includeContent = false, limit = Number.POSITIVE_INFINITY } = options

  const all: ApiDocSummary[] = []
  let page = 1

  while (all.length < limit) {
    const query: DocsQuery = { page, limit: PAGE_SIZE, content: includeContent }

    const response = await $fetch<DocsResponse<ApiDocDetail>>(`${apiUrl}${docsApiUrl(query)}`)
    const docs = response.data || []
    all.push(...docs)

    // 空页或已到最后一页即停止（无数据时 totalPages 为 0）
    if (docs.length === 0 || page >= response.totalPages) break
    page++
  }

  return all.slice(0, limit)
}
