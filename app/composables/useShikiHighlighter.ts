// composables/useShikiHighlighter.ts
import { createHighlighter, type Highlighter, type ThemeRegistrationRaw } from 'shiki'
import lightTheme from '~/assets/themes/light.json'
import darkTheme from '~/assets/themes/dark.json'

// JSON 主题文件是 VS Code 主题格式，需转换为 Shiki 的原始主题注册类型
const themes: ThemeRegistrationRaw[] = [
  lightTheme as unknown as ThemeRegistrationRaw,
  darkTheme as unknown as ThemeRegistrationRaw,
]

let highlighterInstance: Highlighter | null = null

export async function getShikiHighlighter() {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes,
      langs: [
        'bash', 'css', 'docker', 'go', 'html',
        'javascript', 'json', 'markdown', 'shell',
        'sql', 'typescript', 'vue', 'xml', 'yaml'
      ],
    })
  }
  return highlighterInstance
}