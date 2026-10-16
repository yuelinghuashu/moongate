// composables/useOutline.ts
import { computed } from "vue";
import type { Ref } from "vue";

export interface OutlineItem {
  id: string
  text: string
  depth: number
  children?: OutlineItem[]
}

/**
 * 从正文 HTML 提取大纲（目录）。
 *
 * 纯提取逻辑：不持有任何 UI 状态，因此可以被多次调用、也可以直接单测。
 * "目录抽屉是否展开"这个开关的唯一来源是 stores/setting.ts
 * （此前分散在 Pinia store、本 composable 的 localStorage、以及 AppHeader 的
 * watchEffect 三处；同一个开关有三个来源，谁也不知道以谁为准）。
 */
export function useOutline(contentRef?: Ref<string | undefined>) {
  // ==================== 大纲提取 ====================
  const outline = computed<OutlineItem[]>(() => {
    const rawContent = contentRef?.value
    if (typeof rawContent !== 'string' || !rawContent) return []

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(rawContent, 'text/html')
      // 支持 h2, h3, h4, h5, h6
      const headings = doc.querySelectorAll('h2, h3, h4, h5, h6')

      return Array.from(headings).map((heading, index) => ({
        id: heading.id || `heading-${index}`,
        text: heading.textContent?.trim() || '',
        depth: parseInt(heading.tagName.charAt(1)), // 2,3,4,5,6
      }))
    } catch {
      return []
    }
  })

  // ==================== 构建嵌套树 ====================
  const nestedOutline = computed<OutlineItem[]>(() => {
    const items = outline.value
    if (!items.length) return []

    const result: OutlineItem[] = []
    const stack: { item: OutlineItem; depth: number }[] = []

    for (const item of items) {
      const node: OutlineItem = { ...item, children: [] }

      // 如果栈为空，直接添加到根
      if (stack.length === 0) {
        result.push(node)
        stack.push({ item: node, depth: item.depth })
        continue
      }

      // 找到最近的父级（深度小于当前）
      let parentFound = false
      while (stack.length > 0) {
        const top = stack[stack.length - 1]!
        if (top.depth < item.depth) {
          // 找到父级
          top.item.children = top.item.children || []
          top.item.children.push(node)
          // 替换栈顶为当前节点
          stack.push({ item: node, depth: item.depth })
          parentFound = true
          break
        } else {
          // 弹出，继续向上找
          stack.pop()
        }
      }

      // 如果没有找到父级，添加到根
      if (!parentFound) {
        result.push(node)
        stack.length = 0
        stack.push({ item: node, depth: item.depth })
      }
    }

    return result
  })

  return {
    outline,
    nestedOutline,
  };
}
