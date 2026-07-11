// utils/shikiProcessor.ts
import { getShikiHighlighter } from '~/composables/useShikiHighlighter'

// 匹配现有的 HTML 中未高亮的 <pre><code>code</code></pre>，支持有无语言标记两种情况
export async function highlightHtmlContent(htmlContent: string): Promise<string> {
  if (!htmlContent) return ''

  // 仅在服务端或支持的通用环境下运行，避免客户端打包加载 WASM
  const highlighter = await getShikiHighlighter()

  // 用正则是最快、最轻量且不依赖浏览器 DOMParser 的方式
  // 匹配 <pre><code> 块，无论是否有 class="language-xxx"
  const preCodeRegex = /<pre>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/g

  // 异步替换所有匹配到的代码块
  const matches = [...htmlContent.matchAll(preCodeRegex)]
  let resultHtml = htmlContent

  for (const match of matches) {
    const [fullMatch, attributes, rawCode] = match

    // 提取语言类型，若无则默认为 'text'
    const langMatch = attributes.match(/class="[^"]*language-(\w+)"/)
    const lang = langMatch ? langMatch[1] : 'text'

    // 解码 HTML 实体（如 &lt; 转为 <），防止 Shiki 二次转义
    const code = rawCode
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

    const highlighted = highlighter.codeToHtml(code, {
      lang,
      themes: {
        light: 'Moongate Theme Light',
        dark: 'Moongate Theme Dark',
      },
      defaultColor: false, // 纯靠 CSS 变量驱动，完美解决闪动
    })

    resultHtml = resultHtml.replace(fullMatch, highlighted)
  }

  return resultHtml
}