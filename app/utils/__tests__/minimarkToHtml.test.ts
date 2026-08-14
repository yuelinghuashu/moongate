import { describe, it, expect } from 'vitest'
import { minimarkToHtml } from '../minimarkToHtml'

describe('minimarkToHtml', () => {
  it('should return empty string for null/undefined', () => {
    expect(minimarkToHtml(null)).toBe('')
    expect(minimarkToHtml(undefined)).toBe('')
  })

  it('should pass through HTML string directly', () => {
    const html = '<p>Hello world</p>'
    expect(minimarkToHtml(html)).toBe(html)
  })

  it('should handle minimark root node with value array', () => {
    const node = {
      type: 'minimark',
      value: ['text1', 'text2'],
    }
    expect(minimarkToHtml(node)).toBe('text1text2')
  })

  it('should handle plain array', () => {
    expect(minimarkToHtml(['a', 'b', 'c'])).toBe('abc')
  })

  it('should handle element node with tag', () => {
    const node = {
      tag: 'p',
      children: [{ type: 'text', value: 'Hello' }],
    }
    expect(minimarkToHtml(node)).toBe('<p>Hello</p>')
  })

  it('should handle element node with props', () => {
    const node = {
      tag: 'a',
      props: { href: 'https://example.com' },
      children: [{ type: 'text', value: 'Link' }],
    }
    expect(minimarkToHtml(node)).toBe('<a href="https://example.com">Link</a>')
  })

  it('should handle self-closing tags', () => {
    const img = { tag: 'img', props: { src: 'x.png', alt: 'x' } }
    expect(minimarkToHtml(img)).toBe('<img src="x.png" alt="x" />')
  })

  it('should handle br tag as self-closing', () => {
    expect(minimarkToHtml({ tag: 'br' })).toBe('<br />')
  })

  it('should handle nested elements', () => {
    const node = {
      tag: 'div',
      children: [
        { tag: 'h2', children: [{ type: 'text', value: 'Title' }] },
        { tag: 'p', children: [{ type: 'text', value: 'Body' }] },
      ],
    }
    expect(minimarkToHtml(node)).toBe('<div><h2>Title</h2><p>Body</p></div>')
  })

  it('should handle text node', () => {
    const node = { type: 'text', value: 'just text' }
    expect(minimarkToHtml(node)).toBe('just text')
  })

  it('should return empty string for unknown object', () => {
    expect(minimarkToHtml({ type: 'unknown' })).toBe('')
  })

  it('should escape quotes in props', () => {
    const node = {
      tag: 'span',
      props: { title: `say ${'\u0022'}hi${'\u0022'}` },
      children: [{ type: 'text', value: 'x' }],
    }
    const result = minimarkToHtml(node)
    // 属性中的引号应被转义为 "
    expect(result).toBe(`<span title="say ${'\u0026quot;'}hi${'\u0026quot;'}">x</span>`)
  })
})
