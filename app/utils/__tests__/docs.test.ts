import { describe, it, expect } from 'vitest'
import { safeParseDate } from '../docs'

// 说明：contentToHtml / minimarkToHtml 已删除——后端返回的 content 就是最终 HTML
// （且已在加载期清洗），那两层"透传 + 兼容历史 MinimarkTree"没有任何调用价值。
// 正文相关的渲染行为由 useDocDetail（高亮）与后端 sanitize 测试覆盖。

describe('safeParseDate', () => {
  it('should parse valid date string', () => {
    const date = safeParseDate('2025-01-15T10:30:00Z')
    expect(date.toISOString()).toBe('2025-01-15T10:30:00.000Z')
  })

  it('should parse date without time component', () => {
    const date = safeParseDate('2025-01-15')
    expect(date.getUTCFullYear()).toBe(2025)
    expect(date.getUTCMonth()).toBe(0) // January
    expect(date.getUTCDate()).toBe(15)
  })

  it('should use fallback for invalid date string', () => {
    const fallback = new Date('2024-01-01')
    const result = safeParseDate('not-a-date', fallback)
    expect(result).toBe(fallback)
  })

  it('should use current date as fallback when not provided', () => {
    const before = new Date(Date.now() - 1000)
    const result = safeParseDate('invalid')
    const after = new Date(Date.now() + 1000)
    expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(result.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should handle empty string as invalid', () => {
    const fallback = new Date('2023-06-15')
    const result = safeParseDate('', fallback)
    expect(result).toBe(fallback)
  })

  it('should handle ISO timestamp string', () => {
    const result = safeParseDate('2025-03-20T08:00:00.000Z')
    expect(result.toISOString()).toBe('2025-03-20T08:00:00.000Z')
  })
})
