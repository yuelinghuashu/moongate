// server/utils/docs.ts
// 服务端 API 请求工具（Nuxt server 自动导入）

import type { DocsResponse } from '../../app/utils/apiTypes'

/**
 * 获取文档列表（服务端专用）
 */
export async function fetchDocs(apiUrl: string, options: { includeContent?: boolean, limit?: number } = {}) {
  const { includeContent = false, limit = 1000 } = options
  const response = await $fetch<DocsResponse>(
    `${apiUrl}/api/docs?content=${includeContent}&limit=${limit}`
  )
  return response.data || []
}