import { describe, it, expect } from 'vitest'
import { escapeXml, cdataEscape } from '../xml'

// 使用 Unicode 转义避免被编辑器自动格式化反转义 HTML 实体
const AMP = '\u0026'
const LT = '\u003C'
const GT = '\u003E'
const QUOT = '\u0022'
const APOS = '\u0027'
const AMP_ENTITY = '\u0026amp;'
const LT_ENTITY = '\u0026lt;'
const GT_ENTITY = '\u0026gt;'
const QUOT_ENTITY = '\u0026quot;'
const APOS_ENTITY = '\u0026apos;'

describe('escapeXml', () => {
  it('should escape ampersand', () => {
    expect(escapeXml(`a ${AMP} b`)).toBe(`a ${AMP_ENTITY} b`)
  })

  it('should escape angle brackets', () => {
    expect(escapeXml(`${LT}tag${GT}`)).toBe(`${LT_ENTITY}tag${GT_ENTITY}`)
  })

  it('should escape double quotes', () => {
    expect(escapeXml(`say ${QUOT}hello${QUOT}`)).toBe(`say ${QUOT_ENTITY}hello${QUOT_ENTITY}`)
  })

  it('should escape single quotes', () => {
    expect(escapeXml(`it${APOS}s`)).toBe(`it${APOS_ENTITY}s`)
  })

  it('should escape all special characters together', () => {
    const input = `${LT}a href=${QUOT}x${QUOT}${GT}${AMP}y${APOS}z${LT}/a${GT}`
    const expected = `${LT_ENTITY}a href=${QUOT_ENTITY}x${QUOT_ENTITY}${GT_ENTITY}${AMP_ENTITY}y${APOS_ENTITY}z${LT_ENTITY}/a${GT_ENTITY}`
    expect(escapeXml(input)).toBe(expected)
  })

  it('should return empty string for empty input', () => {
    expect(escapeXml('')).toBe('')
  })

  it('should handle Chinese characters without escaping', () => {
    expect(escapeXml('你好世界')).toBe('你好世界')
  })
})

describe('cdataEscape', () => {
  it('should handle empty content', () => {
    expect(cdataEscape('')).toBe('')
  })

  it('should escape CDATA closing sequence', () => {
    expect(cdataEscape('a]]>b')).toBe('a]]]]><![CDATA[>b')
  })

  it('should handle multiple CDATA closing sequences', () => {
    expect(cdataEscape('a]]>b]]>c')).toBe('a]]]]><![CDATA[>b]]]]><![CDATA[>c')
  })

  it('should pass through normal content unchanged', () => {
    const content = '<p>Hello <strong>world</strong></p>'
    expect(cdataEscape(content)).toBe(content)
  })
})