import { describe, it, expect } from 'vitest'
import { isTagSelected, toggleTag } from '../useTagsFilter'

// 标签交互现在是纯函数（状态由 URL 承载，见 useDocs），
// 因此这里不需要任何响应式包装，直接断言输入 → 输出。
describe('isTagSelected', () => {
  it('判断标签是否选中', () => {
    expect(isTagSelected(['vue', 'nuxt'], 'vue')).toBe(true)
    expect(isTagSelected(['vue', 'nuxt'], 'nuxt')).toBe(true)
    expect(isTagSelected(['vue', 'nuxt'], 'react')).toBe(false)
    expect(isTagSelected([], 'anything')).toBe(false)
  })
})

describe('toggleTag（单选）', () => {
  it('空列表点击后只选中该标签', () => {
    expect(toggleTag([], 'vue', false)).toEqual(['vue'])
  })

  it('已选其它标签时替换为当前标签', () => {
    expect(toggleTag(['vue', 'nuxt'], 'react', false)).toEqual(['react'])
  })

  it('点击已选标签则清空', () => {
    expect(toggleTag(['vue'], 'vue', false)).toEqual([])
  })
})

describe('toggleTag（多选）', () => {
  it('追加未选中的标签', () => {
    expect(toggleTag(['vue'], 'nuxt', true)).toEqual(['vue', 'nuxt'])
  })

  it('移除已选中的标签', () => {
    expect(toggleTag(['vue', 'nuxt'], 'vue', true)).toEqual(['nuxt'])
  })

  it('重复多选不会产生重复项（第二次点击即移除）', () => {
    const once = toggleTag(['vue', 'nuxt'], 'vue', true)
    expect(once).toEqual(['nuxt'])
    expect(toggleTag(once, 'vue', true)).toEqual(['nuxt', 'vue'])
  })
})

describe('toggleTag（不可变性）', () => {
  it('不修改入参数组', () => {
    const tags = ['vue']
    toggleTag(tags, 'nuxt', true)
    expect(tags).toEqual(['vue'])
  })
})
