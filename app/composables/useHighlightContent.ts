import { ref, watch, onMounted } from 'vue'
import { useShikiHighlighter } from './useShikiHighlighter'

export function useHighlightContent(contentRef: Ref<string>) {
  const html = ref('')

  const highlight = async () => {
    if (!contentRef.value || typeof window === 'undefined') return

    const highlighter = await useShikiHighlighter()
    const doc = new DOMParser().parseFromString(contentRef.value, 'text/html')

    for (const el of doc.querySelectorAll('pre > code')) {
      const lang = el.className.match(/language-(\w+)/)?.[1] || 'text'
      const code = el.textContent || ''

      // ✅ 使用 Dual Themes，一次生成两套颜色
      const result = highlighter.codeToHtml(code, {
        lang,
        themes: {
          light: 'Moongate Theme Light',
          dark: 'Moongate Theme Dark',
        },
        defaultColor: 'light',
      })

      const div = document.createElement('div')
      div.innerHTML = result
      el.parentElement?.replaceWith(div.firstElementChild!)
    }

    html.value = doc.body.innerHTML
  }

  onMounted(highlight)
  watch(contentRef, highlight)

  return { html }
}