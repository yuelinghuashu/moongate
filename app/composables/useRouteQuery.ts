// composables/useRouteQuery.ts
import { useRoute, useRouter } from 'vue-router'
import type { Ref } from 'vue'

/**
 * 基础原始查询参数读写（不暴露给外部，仅内部使用）
 */
function useRouteQueryRaw(name: string) {
  const route = useRoute()
  const router = useRouter()
  const value = ref(route.query[name])

  // 监听路由变化，同步到内部 ref
  watch(
    () => route.query[name],
    (v) => {
      value.value = v
    }
  )

  // 监听内部 ref 变化，同步到 URL
  watch(value, (v) => {
    const query = { ...route.query, [name]: v }
    router.push({ query })
  })

  return value
}

/**
 * 字符串类型查询参数
 * @param name 参数名
 * @param options.defaultValue 默认值（可选）
 */
export function useRouteQueryString(name: string, options?: { defaultValue?: string }) {
  const raw = useRouteQueryRaw(name)
  const defaultValue = options?.defaultValue ?? ''

  return computed({
    get: () => (raw.value?.toString() ?? defaultValue) as string,
    set: (v: string) => {
      raw.value = v === defaultValue ? undefined : v
    }
  }) as Ref<string>
}

/**
 * 数字类型查询参数
 * @param name 参数名
 * @param options.defaultValue 默认值（可选）
 */
export function useRouteQueryNumber(name: string, options?: { defaultValue?: number }) {
  const raw = useRouteQueryRaw(name)
  const defaultValue = options?.defaultValue ?? 0

  return computed({
    get: () => {
      const val = raw.value
      if (val === undefined) return defaultValue
      const num = Number(val)
      return isNaN(num) ? defaultValue : num
    },
    set: (v: number) => {
      raw.value = v === defaultValue ? undefined : v.toString()
    }
  }) as Ref<number>
}

/**
 * 字符串数组类型查询参数（URL 中用逗号分隔）
 * @param name 参数名
 */
export function useRouteQueryArray(name: string) {
  const raw = useRouteQueryRaw(name)

  return computed({
    get: () => {
      const val = raw.value
      if (!val) return []
      return Array.isArray(val) ? val : (val as string).split(',')
    },
    set: (v: string[]) => {
      raw.value = v.length ? v.join(',') : undefined
    }
  }) as Ref<string[]>
}