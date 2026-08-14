import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useTagsFilter } from '../useTagsFilter'

describe('useTagsFilter', () => {
  it('should check if tag is selected', () => {
    const tags = ref(['vue', 'nuxt'])
    const { isTagSelected } = useTagsFilter(tags)

    expect(isTagSelected('vue')).toBe(true)
    expect(isTagSelected('nuxt')).toBe(true)
    expect(isTagSelected('react')).toBe(false)
  })

  it('should select a single tag on normal click', () => {
    const tags = ref<string[]>([])
    const { handleTagClick } = useTagsFilter(tags)

    handleTagClick('vue', new MouseEvent('click'))

    expect(tags.value).toEqual(['vue'])
  })

  it('should replace existing tags with single tag on normal click', () => {
    const tags = ref(['vue', 'nuxt'])
    const { handleTagClick } = useTagsFilter(tags)

    handleTagClick('react', new MouseEvent('click'))

    expect(tags.value).toEqual(['react'])
  })

  it('should clear tags when clicking selected tag without modifier', () => {
    const tags = ref(['vue'])
    const { handleTagClick } = useTagsFilter(tags)

    handleTagClick('vue', new MouseEvent('click'))

    expect(tags.value).toEqual([])
  })

  it('should add tag with ctrl+click for multi-select', () => {
    const tags = ref(['vue'])
    const { handleTagClick } = useTagsFilter(tags)

    handleTagClick('nuxt', new MouseEvent('click', { ctrlKey: true }))

    expect(tags.value).toEqual(['vue', 'nuxt'])
  })

  it('should remove tag with ctrl+click when already selected', () => {
    const tags = ref(['vue', 'nuxt'])
    const { handleTagClick } = useTagsFilter(tags)

    handleTagClick('vue', new MouseEvent('click', { ctrlKey: true }))

    expect(tags.value).toEqual(['nuxt'])
  })

  it('should add tag with meta+click for multi-select (Mac)', () => {
    const tags = ref(['vue'])
    const { handleTagClick } = useTagsFilter(tags)

    handleTagClick('nuxt', new MouseEvent('click', { metaKey: true }))

    expect(tags.value).toEqual(['vue', 'nuxt'])
  })

  it('should not duplicate tags when adding existing tag with multi-select', () => {
    const tags = ref(['vue', 'nuxt'])
    const { handleTagClick } = useTagsFilter(tags)

    handleTagClick('vue', new MouseEvent('click', { ctrlKey: true }))

    // 已选中的被移除而不是保留
    expect(tags.value).toEqual(['nuxt'])
  })

  it('should handle empty tags list', () => {
    const tags = ref<string[]>([])
    const { isTagSelected, handleTagClick } = useTagsFilter(tags)

    expect(isTagSelected('anything')).toBe(false)

    handleTagClick('vue', new MouseEvent('click'))
    expect(tags.value).toEqual(['vue'])
  })
})