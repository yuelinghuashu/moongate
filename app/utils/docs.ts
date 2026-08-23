// utils/docs.ts
// 文档处理工具函数

import { minimarkToHtml } from './minimarkToHtml'
import type { DocItem } from './apiTypes'

/**
 * 将 i18n locale 映射为内容 API 的 lang 参数。
 * 仅 en 触发英文内容请求；其余（zh_cn 默认、ja 等）返回空串表示中文内容。
 */
export function resolveLangParam(locale: string): string {
  return locale === 'en' ? 'en' : ''
}

/**
 * 安全获取文档 HTML 正文（带转换失败兜底）
 * Go API 返回的 content 已是 gomarkdown 生成的 HTML，这里直接透传；
 * 转换失败时退回 description 摘要。
 */
export function contentToHtml(doc: DocItem): string {
  if (!doc.content) return ''
  try {
    return minimarkToHtml(doc.content) || ''
  } catch (e) {
    console.error(`文章 "${doc.title}" 转换失败:`, e)
    return doc.description || ''
  }
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