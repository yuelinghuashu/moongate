// composables/useDocs.ts
// 文档列表页的筛选状态 + 列表数据。
//
// 设计要点（与旧实现的关键差别）：
//
//  1. URL 是筛选条件的唯一真相。`filters` 由 route.query 派生，
//     因此深链、刷新、前进/后退天然正确，不需要任何"反向同步"。
//  2. 只有**一个**写入口 setFilters()：合并 patch、默认值不写入 URL、一次 router.replace。
//     旧实现为每个参数建一个双向 watch + 一个按 nuxtApp 隔离的 WeakMap 注册表（189 行），
//     只为解决"同一 tick 批量改参数时后写的覆盖先写的"——单写入口让这个问题不再存在，
//     也不再依赖 watch 的执行顺序。
//  3. 筛选条件真正变化时自动回到第 1 页（旧实现把这件事故在防抖 composable 里，
//     同一语义有两处实现）。
//  4. useAsyncData 的 key 直接使用请求 URL：请求内容与缓存 key 不可能各说一套。
//     旧实现的 key 只含语言，所有筛选组合共用一个 key，跨筛选导航/预取会命中同一 key。

import type { WritableComputedRef } from 'vue'
import { docsApiUrl, resolveLangParam, type DocsQuery, type SearchMode } from '~/utils/docs'
import type { DocsResponse } from '~/utils/apiTypes'

/** 列表页筛选条件：参数名与默认值集中在此 */
export interface DocsFilters {
  search: string
  searchMode: SearchMode
  page: number
  limit: number
  /** 视图模式：1=详细 | 2=简洁（纯前端展示，不发给后端） */
  viewMode: number
  tags: string[]
}

/**
 * 默认筛选条件。page/limit 的默认值与后端保持一致
 * （moongate-api internal/api/docs.go: defaultPage=1, defaultLimit=10）。
 */
export const DOCS_FILTER_DEFAULTS: DocsFilters = {
  search: '',
  searchMode: 'all',
  page: 1,
  limit: 10,
  viewMode: 1,
  tags: [],
}

/** 会触发"回到第 1 页"的筛选项：改这些以后再停在第 3 页没有意义 */
const PAGE_RESET_KEYS: readonly string[] = ['search', 'searchMode', 'tags']

const SEARCH_MODES: readonly string[] = ['all', 'title', 'description']

/** 把 URL query 解析为筛选条件：非法值一律回落默认值，保证任何深链都能渲染 */
export function parseDocsFilters(query: Record<string, unknown>): DocsFilters {
  const str = (name: string): string | undefined => {
    const val = query[name]
    if (Array.isArray(val)) return typeof val[0] === 'string' ? val[0] : undefined
    return typeof val === 'string' ? val : undefined
  }

  const num = (name: string, fallback: number): number => {
    const raw = str(name)
    if (raw === undefined) return fallback
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback
  }

  const rawMode = str('searchMode')
  const mode = SEARCH_MODES.includes(rawMode ?? '')
    ? (rawMode as SearchMode)
    : DOCS_FILTER_DEFAULTS.searchMode

  const rawTags = query.tag
  const tagList = Array.isArray(rawTags) ? rawTags : rawTags === undefined ? [] : [rawTags]
  const tags = tagList.filter((tag): tag is string => typeof tag === 'string' && tag !== '')

  return {
    search: str('search') ?? DOCS_FILTER_DEFAULTS.search,
    searchMode: mode,
    page: num('page', DOCS_FILTER_DEFAULTS.page),
    limit: num('limit', DOCS_FILTER_DEFAULTS.limit),
    viewMode: num('viewMode', DOCS_FILTER_DEFAULTS.viewMode),
    tags,
  }
}

/** 把筛选条件序列化为 URL query：与默认值相同的项不写入，保持 URL 干净 */
export function filtersToQuery(filters: DocsFilters): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {}

  if (filters.search) query.search = filters.search
  if (filters.searchMode !== DOCS_FILTER_DEFAULTS.searchMode) query.searchMode = filters.searchMode
  if (filters.page !== DOCS_FILTER_DEFAULTS.page) query.page = String(filters.page)
  if (filters.limit !== DOCS_FILTER_DEFAULTS.limit) query.limit = String(filters.limit)
  if (filters.viewMode !== DOCS_FILTER_DEFAULTS.viewMode) query.viewMode = String(filters.viewMode)
  if (filters.tags.length > 0) query.tag = [...filters.tags]

  return query
}

/** 把筛选条件映射为内容 API 的查询参数（默认值不发送，请求与缓存 key 都保持最小） */
export function filtersToApiQuery(filters: DocsFilters, lang: string): DocsQuery {
  return {
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    // searchMode 的默认值就是 all，交给后端默认值即可
    searchMode: filters.searchMode === DOCS_FILTER_DEFAULTS.searchMode ? undefined : filters.searchMode,
    tags: filters.tags,
    lang,
  }
}

/** 值比较（tags 是数组，需要按内容比较） */
function isSameValue(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => item === b[i])
  }
  return a === b
}

/**
 * 文档列表 Composable。
 *
 * 只在页面组件里调用一次（`pages/docs/index.vue`），筛选状态通过 props 往下传，
 * 不再用 createSharedComposable 做隐式共享单例。
 */
export function useDocs() {
  const route = useRoute()
  const router = useRouter()
  const config = useRuntimeConfig()
  const { locale } = useI18n()

  /** 内容语言：由 i18n locale（/en URL 前缀）驱动，仅 en 时请求英文内容 */
  const lang = computed(() => resolveLangParam(locale.value))

  /** 筛选条件：唯一真相是 URL */
  const filters = computed<DocsFilters>(() => parseDocsFilters(route.query))

  /**
   * 唯一的写入口：合并 patch → 一次 router.replace。
   *
   * - 没有任何字段真的变化时不导航（避免把前进/后退还原出来的 URL 又写回去）；
   * - 筛选条件变化时强制回到第 1 页；
   * - 默认值不写入 URL。
   */
  function setFilters(patch: Partial<DocsFilters>) {
    const current = filters.value
    const changedKeys = (Object.keys(patch) as (keyof DocsFilters)[]).filter(
      key => !isSameValue(current[key], patch[key]),
    )
    if (changedKeys.length === 0) return Promise.resolve()

    const next: DocsFilters = { ...current, ...patch }
    if (changedKeys.some(key => PAGE_RESET_KEYS.includes(key))) {
      next.page = DOCS_FILTER_DEFAULTS.page
    }

    return router.replace({ query: filtersToQuery(next) })
  }

  /** 重置所有筛选条件到默认值（一次 replace 完成，不是 6 个参数各写一次） */
  function resetFilters() {
    return router.replace({ query: filtersToQuery({ ...DOCS_FILTER_DEFAULTS, tags: [] }) })
  }

  /**
   * 某个筛选参数的可写模型：模板里可继续用 v-model，
   * 但写入统一经过 setFilters（因此不存在"每个参数一套双向 watch"）。
   */
  function filterModel<K extends keyof DocsFilters>(key: K): WritableComputedRef<DocsFilters[K]> {
    return computed({
      get: () => filters.value[key],
      set: (value: DocsFilters[K]) => {
        void setFilters({ [key]: value } as Partial<DocsFilters>)
      },
    })
  }

  /** 发往后端的查询参数 */
  const apiQuery = computed(() => filtersToApiQuery(filters.value, lang.value))

  /**
   * 列表数据请求。key 与请求 URL 是同一个字符串：
   * 请求一变 key 就变，Nuxt 会据此重新取数（不需要再列 watch 依赖），
   * 缓存条目也会在引用归零时被清理，不会随筛选/翻页累积。
   */
  const { data: docs, pending, error, refresh } = useAsyncData<DocsResponse>(
    computed(() => `docs-list:${docsApiUrl(apiQuery.value)}`),
    () => $fetch<DocsResponse>(docsApiUrl(apiQuery.value), { baseURL: config.public.apiUrl }),
  )

  return {
    // 筛选状态
    filters,
    filterModel,
    setFilters,
    resetFilters,

    // 数据状态
    docs,
    pending,
    error,
    refresh,
  }
}
