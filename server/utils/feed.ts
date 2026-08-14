// server/utils/feed.ts
// Feed 生成公共模块：隔离 Atom/RSS/JSON Feed 的重复逻辑

import { contentToHtml, safeParseDate } from '../../app/utils/docs'
import { cdataEscape, escapeXml } from '../../app/utils/xml'
import { fetchDocs } from './docs'
import type { DocItem } from '../../app/utils/apiTypes'

/** Feed 文档类型（与后端 DocItem 对齐） */
export interface FeedDoc {
  title: string
  description: string
  date: string
  permalink: string
  slug: string
  level: string
  series: string | null
  tags: string[]
  content: string
}

/** Feed 公共元信息 */
export interface FeedMeta {
  siteUrl: string
  apiUrl: string
  feedUrl: string
  title: string
  subtitle: string
  description: string
  language: string
  id: string
}

/** Feed 站点常量 */
export const FEED_CONSTANTS = {
  title: 'MoonGate',
  subtitle: 'Where Moon Meets Code',
  description: 'Where Moon Meets Code',
  language: 'zh-CN',
} as const

/**
 * 构建 Feed 元信息
 */
export function buildFeedMeta(siteUrl: string, feedPath: string): FeedMeta {
  return {
    siteUrl,
    apiUrl: '', // 由调用方填充
    feedUrl: `${siteUrl}${feedPath}`,
    title: FEED_CONSTANTS.title,
    subtitle: FEED_CONSTANTS.subtitle,
    description: FEED_CONSTANTS.description,
    language: FEED_CONSTANTS.language,
    id: siteUrl,
  }
}

/**
 * 安全获取 Feed 文档列表（空时返回空数组）
 */
export async function getFeedDocs(apiUrl: string): Promise<FeedDoc[]> {
  try {
    const docs = await fetchDocs(apiUrl, { includeContent: true })
    return docs.map((doc: DocItem) => ({
      title: doc.title || '',
      description: doc.description || '',
      date: doc.date || '',
      permalink: doc.permalink || '',
      slug: doc.slug || '',
      level: doc.level || '',
      series: doc.series || null,
      tags: doc.tags || [],
      content: doc.content || '',
    }))
  } catch (error) {
    console.error('获取 Feed 文档失败:', error)
    return []
  }
}

/**
 * 构建文档链接
 */
export function buildDocLink(siteUrl: string, doc: FeedDoc): string {
  const slug = doc.slug || doc.permalink || ''
  return slug ? `${siteUrl}/docs/${slug}` : siteUrl
}

/**
 * 构建文档唯一标识
 */
export function buildDocId(doc: FeedDoc, fallbackLink: string): string {
  return doc.permalink || fallbackLink
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
 * 安全格式化日期为 date-only 字符串（YYYY-MM-DD，Sitemap 专用）
 */
export function formatDateOnly(dateStr: string): string {
  return safeParseDate(dateStr).toISOString().split('T')[0]!
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
 * 将文档内容转为安全的 CDATA HTML
 */
export function docContentToCdata(doc: FeedDoc): string {
  // FeedDoc 与 DocItem 结构兼容，转换为 DocItem 类型
  const item: DocItem = {
    permalink: doc.permalink,
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    level: doc.level,
    series: doc.series,
    tags: doc.tags,
    date: doc.date,
    content: doc.content,
  }
  return cdataEscape(contentToHtml(item))
}
