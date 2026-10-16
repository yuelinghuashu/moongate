// server/utils/feed.ts
// Feed 生成公共模块：隔离 Atom/RSS/JSON Feed 的重复逻辑

import { safeParseDate } from '../../app/utils/docs'
import { cdataEscape, escapeXml } from '../../app/utils/xml'
import { fetchDocs } from './docs'
import type { ApiDocDetail } from '../../app/utils/apiTypes'

/** Feed 站点常量 */
export const FEED_CONSTANTS = {
  title: 'MoonGate',
  subtitle: 'Where Moon Meets Code',
  description: 'Where Moon Meets Code',
  language: 'zh-CN',
} as const

/**
 * 安全获取 Feed 文档列表（含正文；失败或为空时返回空数组）。
 *
 * 直接使用后端 DocDetail 视图，不再另立一套同形 FeedDoc 再转回去——
 * 那份"结构兼容"的搬运只是让类型说谎（把摘要当详情用）。
 */
export async function getFeedDocs(apiUrl: string): Promise<ApiDocDetail[]> {
  try {
    return await fetchDocs(apiUrl, { includeContent: true })
  } catch (error) {
    console.error('获取 Feed 文档失败:', error)
    return []
  }
}

/**
 * 构建文档链接
 */
export function buildDocLink(siteUrl: string, doc: ApiDocDetail): string {
  const slug = doc.slug || ''
  return slug ? `${siteUrl}/docs/${slug}` : siteUrl
}

/**
 * 安全格式化日期为 ISO 字符串
 */
export function formatDateIso(dateStr: string): string {
  return safeParseDate(dateStr).toISOString()
}

/**
 * 安全格式化日期为 UTC 字符串（RSS 专用）
 */
export function formatDateUtc(dateStr: string): string {
  return safeParseDate(dateStr).toUTCString()
}

/**
 * XML 转义（非 CDATA 场景）
 */
export function xmlEscape(text: string): string {
  return escapeXml(text)
}

/**
 * CDATA 安全转义
 */
export function xmlCdata(text: string): string {
  return cdataEscape(text || '')
}

/**
 * 把文档正文放进 CDATA。
 *
 * 正文 HTML 已由后端在加载期清洗（白名单），这里只处理 CDATA 分隔符冲突。
 * 旧实现绕了一圈 contentToHtml(minimarkToHtml)——那层已退化为透传。
 */
export function docContentToCdata(doc: ApiDocDetail): string {
  return cdataEscape(doc.content || '')
}
