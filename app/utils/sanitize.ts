// utils/sanitize.ts
// HTML 消毒工具：防止 XSS 攻击
import DOMPurify from 'dompurify'

/**
 * 消毒 HTML 字符串，移除所有危险内容和属性。
 *
 * @param html - 需要消毒的 HTML 字符串
 * @returns 安全的 HTML 字符串
 *
 * @example
 * ```ts
 * const safe = sanitizeHtml('<script>alert(1)</script><p>Hello</p>')
 * // safe === '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target'], // 保留 Shiki 生成的 target="_blank"
    ADD_TAGS: ['shiki-content'], // 保留自定义标记
  })
}