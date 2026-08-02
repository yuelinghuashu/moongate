import { ref, watch, onMounted, type Ref } from 'vue'
import { highlightHtmlContent } from '~/utils/shikiProcessor'

export function useHighlightContent(contentRef: Ref<string>) {
  const html = ref('')

  const highlight = async () => {
    if (!contentRef.value || typeof window === 'undefined') return
    html.value = await highlightHtmlContent(contentRef.value)
  }

  onMounted(highlight)
  watch(contentRef, highlight)

  return { html }
}