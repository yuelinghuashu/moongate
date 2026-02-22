// composables/useI18nSafe.ts
import type { LocaleMessageValue, VueMessageType } from 'vue-i18n'
import { useI18n } from 'vue-i18n'

/**
 * 递归提取开发环境下的实际值（移除 loc.source 包装）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractValue(value: LocaleMessageValue<VueMessageType>): any {
  if (!value || typeof value !== 'object') return value

  // 处理被包装的字符串（开发环境特有）
  if (value.loc?.source !== undefined) {
    return value.loc.source
  }

  // 处理数组
  if (Array.isArray(value)) {
    return value.map(extractValue)
  }

  // 处理对象
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {}
  for (const key in value) {
    result[key] = extractValue(value[key])
  }
  return result
}

export function useI18nSafe() {
  const { tm: originalTm, ...rest } = useI18n()

  const tm = (key: string) => {
    const value = originalTm(key)
    // 仅开发环境需要提取，生产环境直接返回
    if (import.meta.env.DEV) {
      return extractValue(value)
    }
    return value
  }

  return { tm, ...rest }
}