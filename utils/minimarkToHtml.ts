// utils/minimarkToHtml.ts

/**
 * 将 Nuxt Content v3 的 MinimarkTree 转换为 HTML 字符串
 * @param node - 文档 body 节点 (article.body)
 * @returns HTML 字符串
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // 元素节点（带标签）
    if (node.tag) {
      // 生成属性字符串
      const attrs = node.props
        ? ' ' + Object.entries(node.props)
          .map(([key, val]) => `${key}="${String(val).replace(/"/g, '&quot;')}"`)
          .join(' ')
        : ''

      const children = (node.children || []).map(minimarkToHtml).join('')

      // 自闭合标签
      if (['img', 'br', 'hr', 'input'].includes(node.tag)) {
        return `<${node.tag}${attrs} />`
      }
      return `<${node.tag}${attrs}>${children}</${node.tag}>`
    }

    // 处理文本节点
    if (node.type === 'text' && node.value) {
      return node.value
    }
    
  }

  return ''
}