// composables/useShikiHighlighter.ts
import { createHighlighter, type Highlighter } from 'shiki'
import lightTheme from '~/assets/themes/light.json'
import darkTheme from '~/assets/themes/dark.json'

let highlighterInstance: Highlighter | null = null

export async function getShikiHighlighter() {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: [lightTheme, darkTheme],
      langs: [
        'bash', 'css', 'docker', 'go', 'html',
        'javascript', 'json', 'markdown', 'shell',
        'sql', 'typescript', 'vue', 'xml', 'yaml'
      ],
    })
  }
  return highlighterInstance
}