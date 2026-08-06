// composables/useRouteQuery.ts
import { useRoute, useRouter, type LocationQueryRaw, type LocationQueryValue } from 'vue-router'
import { watch, computed, ref, onUnmounted, getCurrentInstance } from 'vue'
import type { Ref } from 'vue'

/** 注册表条目：每一个活跃的 URL 查询参数 */
interface QueryRegistration {
  /** 参数名 */
  name: string
  /** 读取当前最新值（避免使用过期的 route.query 快照） */
  getValue: () => unknown
}

/**
 * 全局注册表：维护当前页面所有 useRouteQuery* 创建的参数。
 *
 * 当多个参数在同一 tick 内批量修改（如 resetFilters 同时重置 6 个参数）时，
 * 每个参数的独立 watch 都会触发 router.replace。
 * 传统的做法是从旧的 route.query 出发构建 query，这会导致前面的修改被后面的覆盖。
 *
 * 改用注册表读取所有参数的「最新值」来构建完整 query，
 * 保证无论 watch 的执行顺序如何，最终 URL 包含所有参数的正确状态。
 */
const registry = new Set<QueryRegistration>()

/** 从注册表构建完整 query（用最新 ref 值，而非 route.query 旧快照） */
function buildQueryFromRegistry(): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  for (const { name, getValue } of registry) {
    const val = getValue()
    // 跳过空值，保持 URL 干净（避免 ?search= 之类）
    if (val === undefined || val === null || val === '') continue
    if (Array.isArray(val) && val.length === 0) continue
    query[name] = val as LocationQueryValue | LocationQueryValue[]
  }
  return query
}

/**
 * 基础原始查询参数读写（不暴露给外部，仅内部使用）
 * 负责核心的 URL 同步逻辑，使用 replace 避免产生多余历史记录。
 */
function useRouteQueryRaw(name: string) {
  const route = useRoute()
  const router = useRouter()
  const value = ref(route.query[name])

  // 注册到全局注册表，用于批量写回时获取最新值
  const registration: QueryRegistration = { name, getValue: () => value.value }
  registry.add(registration)

  const instance = getCurrentInstance()
  if (instance) {
    onUnmounted(() => registry.delete(registration))
  }

  // 监听路由变化，同步到内部 ref
  watch(() => route.query[name], (newVal) => {
    value.value = newVal
  })

  // 监听内部 ref 变化，同步到 URL（基于注册表最新值，避免批量更新互相覆盖）
  watch(value, () => {
    router.replace({ query: buildQueryFromRegistry() })
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

  // 读取：从 route.query 获取数组（过滤 null 值）
  const getValueFromRoute = (): string[] => {
    const val = route.query[name]
    if (!val) return []
    if (Array.isArray(val)) {
      return val.filter((v): v is string => v !== null)
    }
    return [val]
  }

  const value = ref<string[]>(getValueFromRoute())

  // 注册到全局注册表
  const registration: QueryRegistration = { name, getValue: () => value.value }
  registry.add(registration)

  const instance = getCurrentInstance()
  if (instance) {
    onUnmounted(() => registry.delete(registration))
  }

  // 监听路由变化，同步到内部 ref（比较序列化结果，避免无意义更新）
  watch(() => route.query[name], () => {
    const newVal = getValueFromRoute()
    if (JSON.stringify(value.value) !== JSON.stringify(newVal)) {
      value.value = newVal
    }
  })

  // 监听内部 ref 变化，同步到 URL（多参数格式，基于注册表最新值）
  watch(value, () => {
    router.replace({ query: buildQueryFromRegistry() })
  }, { deep: true })

  return value
}