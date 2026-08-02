// utils/minimarkToHtml.ts

/**
 * 将文档正文转为 HTML 字符串
 * 目前 Go API 返回的 content 已是 gomarkdown 生成的 HTML 字符串，此函数直接透传；
 * 保留树形结构处理分支以兼容历史数据。
 * @param node - HTML 字符串或历史 MinimarkTree 节点
 * @returns HTML 字符串
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function minimarkToHtml(node: any): string {
  if (!node) return ''

  // 直接透传 HTML 字符串（Go API 返回的 content 主路径）
  if (typeof node === 'string') {
    return node
  }

  // 兼容：处理历史 MinimarkTree 根节点
  if (node.type === 'minimark' && Array.isArray(node.value)) {
    return node.value.map(minimarkToHtml).join('')
  }

  // 兼容：处理数组
  if (Array.isArray(node)) {
    return node.map(minimarkToHtml).join('')
  }

  // 兼容：处理元素节点
  if (node && typeof node === 'object') {
    if (node.tag) {
      // 使用 Unicode 转义 " 避免被编辑器自动格式化反转义
      const attrs = node.props
        ? ' ' + Object.entries(node.props)
          .map(([key, val]) => `${key}="${String(val).replace(/"/g, '\u0026quot;')}"`)
          .join(' ')
        : ''

      const children = (node.children || []).map(minimarkToHtml).join('')

      if (['img', 'br', 'hr', 'input'].includes(node.tag)) {
        return `<${node.tag}${attrs} />`
      }
      return `<${node.tag}${attrs}>${children}</${node.tag}>`
    }

    if (node.type === 'text' && node.value) {
      return node.value
    }
  }

  return ''
}