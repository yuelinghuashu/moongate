// utils/minimarkToHtml.ts

/**
 * 将 Nuxt Content v3 的 MinimarkTree 转换为 HTML 字符串
 * @param node - 文章 body 节点 (article.body)
 * @returns HTML 字符串
 */
export function minimarkToHtml(node: any): string {
  if (!node) return ''

  // 处理 MinimarkTree 的根节点
  if (node.type === 'minimark' && Array.isArray(node.value)) {
    return node.value.map(minimarkToHtml).join('')
  }

  // 文本节点
  if (typeof node === 'string') {
    return node
  }

  // 元素节点（数组中的每个项）
  if (Array.isArray(node)) {
    return node.map(minimarkToHtml).join('')
  }

  if (node && typeof node === 'object') {
    // 处理带标签的元素
    if (node.tag) {
      const tag = node.tag
      const children = (node.children || [])
        .map(minimarkToHtml)
        .join('')

      // 处理自闭合标签
      if (['img', 'br', 'hr'].includes(tag)) {
        return `<${tag} />`
      }

      return `<${tag}>${children}</${tag}>`
    }

    // 处理文本节点
    if (node.type === 'text' && node.value) {
      return node.value
    }
  }

  return ''
}