// composables/useI18nSafe.ts
//
// vue-i18n 在开发环境会把消息包成 `{ loc: { source } }` 的 AST 节点（生产环境直接是原始值），
// 于是 `tm('nav.items')` 在 dev 下拿到的不是数组而是对象，组件里 v-for / 传 :options 就会出问题。
// 这里把包装统一剥掉。
//
// 刻意不 `import { useI18n } from 'vue-i18n'`：@nuxtjs/i18n 已把它注册为 Nuxt 自动导入，
// Nuxt 会把落点解析成 .pnpm 里的绝对路径（见 .nuxt/types/imports.d.ts），
// 显式 import 只会让本文件对 vue-i18n 多一条落不到实处的直接依赖。
//
// 注意 tm() 的返回类型比"随手 as any"要紧一点：dev/prod 两个分支都返回同一种
// 消息值类型。调用方明确知道形状时用泛型收窄，而不是在外面补强制转换。

/** 递归提取开发环境下的实际值（移除 loc.source 包装） */
function extractValue(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value

  // 处理被包装的字符串（开发环境特有）
  if ((value as { loc?: { source?: unknown } }).loc?.source !== undefined) {
    return (value as { loc: { source: unknown } }).loc.source
  }

  // 处理数组
  if (Array.isArray(value)) {
    return value.map(extractValue)
  }

  // 处理对象
  const result: Record<string, unknown> = {}
  for (const key in value) {
    result[key] = extractValue((value as Record<string, unknown>)[key])
  }
  return result
}

export function useI18nSafe() {
  const { tm: originalTm, ...rest } = useI18n()

  /** vue-i18n 对一整段消息的静态类型（`tm()` 的返回值） */
  type MessageValue = ReturnType<typeof originalTm>

  /**
   * 取一整段 i18n 消息。默认沿用 vue-i18n 的消息值类型；
   * 调用方知道确切形状时显式指定泛型，例如 `tm<SelectOption[]>('docs.searchMode')`。
   */
  const tm = <T = MessageValue>(key: string): T => {
    const value = originalTm(key)
    // 仅开发环境需要提取，生产环境直接返回
    return (import.meta.env.DEV ? extractValue(value) : value) as T
  }

  return { tm, ...rest }
}
