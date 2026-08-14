// server/utils/docs.ts
// 服务端 API 请求工具（Nuxt server 自动导入）

import type { DocsResponse } from '../../app/utils/apiTypes'

/** 单次请求最大页大小（后端限制保护） */
const MAX_PAGE_SIZE = 100

/**
 * 获取文档列表（服务端专用）
 * 支持分页遍历，避免文章超过单次 limit 上限时遗漏。
 */
export async function fetchDocs(apiUrl: string, options: { includeContent?: boolean, limit?: number } = {}) {
  const { includeContent = false, limit = 1000 } = options
  const allDocs = []
  const pageSize = Math.min(limit, MAX_PAGE_SIZE)
  let page = 1

  while (true) {
    const response = await $fetch<DocsResponse>(
      `${apiUrl}/api/docs?content=${includeContent}&limit=${pageSize}&page=${page}`
    )
    const docs = response.data || []
    allDocs.push(...docs)

    // 已取完或达到目标数量则停止
    if (docs.length < pageSize || allDocs.length >= limit) break
    page++
  }

  return allDocs
}
