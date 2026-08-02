// utils/xml.ts
// XML 相关工具函数

// 使用 Unicode 转义避免被编辑器自动格式化反转义 HTML 实体
const AMP = '\u0026amp;'
const LT = '\u0026lt;'
const GT = '\u0026gt;'
const QUOT = '\u0026quot;'
const APOS = '\u0026apos;'

/**
 * 转义 XML 特殊字符
 */
export function escapeXml(text: string): string {
  if (!text) return ''
  return text
    .replace(/\u0026/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT)
    .replace(/"/g, QUOT)
    .replace(/'/g, APOS)
}

/**
 * 将内容安全地放入 CDATA 块中（处理 `]]>` 冲突）
 */
export function cdataEscape(content: string): string {
  if (!content) return ''
  return content.replace(/\]\]>/g, ']]]]>\u003C![CDATA[>')
}