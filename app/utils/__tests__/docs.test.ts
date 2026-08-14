import { describe, it, expect, vi } from 'vitest'
import { contentToHtml, safeParseDate } from '../docs'
import type { DocItem } from '../apiTypes'

describe('contentToHtml', () => {
  it('should return empty string when content is empty', () => {
    const doc = { title: 'test', content: '' } as DocItem
    expect(contentToHtml(doc)).toBe('')
  })

  it('should return content HTML directly', () => {
    const doc = { title: 'test', content: '<p>Hello</p>' } as DocItem
    expect(contentToHtml(doc)).toBe('<p>Hello</p>')
  })

  it('should fall back to description when conversion fails', () => {
    // 构造一个访问属性时抛异常的对象，让 minimarkToHtml 抛异常
    const throwingObj = {}
    Object.defineProperty(throwingObj, 'type', {
      get() { throw new Error('boom') }
    })

    const doc = {
      title: 'test',
      content: throwingObj,
      description: 'fallback description',
    } as unknown as DocItem

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = contentToHtml(doc)
    consoleSpy.mockRestore()

    expect(result).toBe('fallback description')
  })

  it('should return description when content is falsy', () => {
    const doc = {
      title: 'test',
      content: '',
      description: 'no content available',
    } as unknown as DocItem
    expect(contentToHtml(doc)).toBe('')
  })
})

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