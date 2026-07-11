// composables/useRouteQuery.ts
import { useRoute, useRouter } from 'vue-router'
import type { Ref } from 'vue'

/**
 * 基础原始查询参数读写（不暴露给外部，仅内部使用）
 * 负责核心的 URL 同步逻辑，使用 replace 避免产生多余历史记录
 */
function useRouteQueryRaw(name: string) {
  const route = useRoute()
  const router = useRouter()
  const value = ref(route.query[name])

  // 监听路由变化，同步到内部 ref
  watch(() => route.query[name], (newVal) => {
    value.value = newVal
  })

  // 监听内部 ref 变化，同步到 URL
  watch(value, (newVal) => {
    const query = { ...route.query }
    if (newVal !== undefined && newVal !== null && newVal !== '') {
      query[name] = newVal
    } else {
      delete query[name]
    }
    router.replace({ query })
  })

  return value
}

/**
 * 字符串类型查询参数
 * @param name 参数名
 * @param options.defaultValue 默认值（可选）
 * @example
 * const search = useRouteQueryString('search', { defaultValue: '' })
 * search.value = 'vue'  // URL 变为 ?search=vue
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
 * @example
 * const page = useRouteQueryNumber('page', { defaultValue: 1 })
 * page.value = 2  // URL 变为 ?page=2
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
 * 字符串数组类型查询参数
 * 支持多参数格式：?tag=go&tag=vue
 * @param name 参数名
 * @example
 * const tags = useRouteQueryArray('tag')
 * tags.value = ['vue', 'nuxt']  // URL 变为 ?tag=vue&tag=nuxt
 */
export function useRouteQueryArray(name: string) {
  const route = useRoute()
  const router = useRouter()

  // 读取：从 route.query 获取数组
  const getValue = (): string[] => {
    const val = route.query[name]
    if (!val) return []
    return Array.isArray(val) ? val : [val]
  }

  const value = ref(getValue())

  // 监听路由变化
  watch(() => route.query[name], () => {
    const newVal = getValue()
    if (JSON.stringify(value.value) !== JSON.stringify(newVal)) {
      value.value = newVal
    }
  })

  // 监听内部 ref 变化，同步到 URL（多参数格式）
  watch(value, (newVal) => {
    const query = { ...route.query }
    if (newVal.length === 0) {
      delete query[name]
    } else {
      query[name] = newVal  // Vue Router 自动展开成 ?tag=go&tag=vue
    }
    router.replace({ query })
  }, { deep: true })

  return value
}