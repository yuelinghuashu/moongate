// composables/useTagsFilter.ts

/**
 * 标签筛选的纯函数。
 *
 * 此前这里持有筛选状态的 ref（useDocs 里的 tags），于是"状态在哪"取决于调用顺序，
 * 组件之间靠共享单例隐式耦合。现在筛选状态统一由 URL 承载（见 useDocs），
 * 这里只负责回答"点击标签后应该是哪组标签"，因此是可直接单测的纯函数。
 */

/** 标签是否处于选中态 */
export function isTagSelected(tags: readonly string[], tag: string): boolean {
  return tags.includes(tag)
}

/**
 * 计算点击标签后的新标签集合。
 *
 * - 多选（Ctrl/Cmd，或移动端多选开关）：已选则移除，未选则追加；
 * - 单选：已选则清空，未选则只保留该标签。
 *
 * @param tags - 当前选中的标签
 * @param tag - 被点击的标签
 * @param additive - 是否多选模式
 * @returns 新的标签数组（不修改入参）
 */
export function toggleTag(tags: readonly string[], tag: string, additive: boolean): string[] {
  if (additive) {
    return tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
  }
  return tags.includes(tag) ? [] : [tag]
}
