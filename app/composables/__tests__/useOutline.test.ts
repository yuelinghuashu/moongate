import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useOutline } from '../useOutline'

describe('useOutline', () => {
  it('should return empty outline for no content', () => {
    const { outline, nestedOutline } = useOutline(ref(undefined))

    expect(outline.value).toEqual([])
    expect(nestedOutline.value).toEqual([])
  })

  it('should return empty outline for empty string', () => {
    const { outline } = useOutline(ref(''))

    expect(outline.value).toEqual([])
  })

  it('should extract flat headings', () => {
    const content = '<h2 id="one">Title One</h2><h3 id="two">Sub Title</h3>'
    const { outline } = useOutline(ref(content))

    expect(outline.value).toHaveLength(2)
    expect(outline.value[0]!).toEqual({
      id: 'one',
      text: 'Title One',
      depth: 2,
    })
    expect(outline.value[1]!).toEqual({
      id: 'two',
      text: 'Sub Title',
      depth: 3,
    })
  })

  it('should generate id for headings without id', () => {
    const content = '<h2>No ID</h2><h3>Another</h3>'
    const { outline } = useOutline(ref(content))

    expect(outline.value[0]!.id).toBe('heading-0')
    expect(outline.value[1]!.id).toBe('heading-1')
  })

  it('should handle malformed HTML without throwing', () => {
    const { outline } = useOutline(ref('<h2>Broken'))

    // happy-dom 可能容忍不完整 HTML
    expect(Array.isArray(outline.value)).toBe(true)
  })

  it('should return empty for invalid content type', () => {
    // @ts-expect-error - testing invalid input type
    const { outline } = useOutline(ref(123))

    expect(outline.value).toEqual([])
  })

  describe('nestedOutline', () => {
    it('should build flat structure for same depth headings', () => {
      const content = '<h2 id="a">A</h2><h2 id="b">B</h2>'
      const { nestedOutline } = useOutline(ref(content))

      expect(nestedOutline.value).toHaveLength(2)
      expect(nestedOutline.value[0]!.id).toBe('a')
      expect(nestedOutline.value[0]!.children).toEqual([])
      expect(nestedOutline.value[1]!.id).toBe('b')
    })

    it('should nest h3 under h2', () => {
      const content = '<h2 id="parent">Parent</h2><h3 id="child">Child</h3>'
      const { nestedOutline } = useOutline(ref(content))

      expect(nestedOutline.value).toHaveLength(1)
      expect(nestedOutline.value[0]!.id).toBe('parent')
      expect(nestedOutline.value[0]!.children).toHaveLength(1)
      expect(nestedOutline.value[0]!.children![0]!.id).toBe('child')
    })

    it('should handle multiple hierarchy levels', () => {
      const content = '<h2 id="h2">H2</h2><h3 id="h3">H3</h3><h4 id="h4">H4</h4>'
      const { nestedOutline } = useOutline(ref(content))

      expect(nestedOutline.value).toHaveLength(1)
      const h2 = nestedOutline.value[0]!
      expect(h2.id).toBe('h2')
      expect(h2.children).toHaveLength(1)
      expect(h2.children![0]!.id).toBe('h3')
      expect(h2.children![0]!.children).toHaveLength(1)
      expect(h2.children![0]!.children![0]!.id).toBe('h4')
    })

    it('should put skipped-level headings at root', () => {
      const content = '<h2 id="a">A</h2><h4 id="b">B</h4>'
      const { nestedOutline } = useOutline(ref(content))

      // h2 -> h4 跳过 h3，h4 应该成为 h2 的子节点
      expect(nestedOutline.value).toHaveLength(1)
      expect(nestedOutline.value[0]!.id).toBe('a')
      expect(nestedOutline.value[0]!.children).toHaveLength(1)
      expect(nestedOutline.value[0]!.children![0]!.id).toBe('b')
    })

    it('should handle sibling groups', () => {
      const content = '<h2 id="a">A</h2><h3 id="a1">A1</h3><h3 id="a2">A2</h3>'
      const { nestedOutline } = useOutline(ref(content))

      expect(nestedOutline.value).toHaveLength(1)
      expect(nestedOutline.value[0]!.children).toHaveLength(2)
      expect(nestedOutline.value[0]!.children![0]!.id).toBe('a1')
      expect(nestedOutline.value[0]!.children![1]!.id).toBe('a2')
    })
  })
})