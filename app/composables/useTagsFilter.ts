import type { Ref } from 'vue'

/**
 * 标签筛选交互逻辑
 * @param tags - 当前选中的标签数组（响应式引用，来自 useDocs）
 */
export function useTagsFilter(tags: Ref<string[]>) {
  const isTagSelected = (tag: string): boolean => tags.value.includes(tag)

  const handleTagClick = (tag: string, event: MouseEvent): void => {
    const isMulti = event.ctrlKey || event.metaKey
    let newTags: string[]

    if (isMulti) {
      newTags = tags.value.includes(tag)
        ? tags.value.filter(t => t !== tag)
        : [...tags.value, tag]
    } else {
      newTags = tags.value.includes(tag) ? [] : [tag]
    }

    tags.value = newTags
  }

  return { isTagSelected, handleTagClick }
}