// composables/useDocs.ts
import { createSharedComposable } from '@vueuse/core'
import { useRouteQueryString, useRouteQueryNumber, useRouteQueryArray } from './useRouteQuery'
import type { DocsResponse } from '~/utils/apiTypes'

/**
 * 默认筛选条件
 * 与 URL 查询参数默认值保持同步
 */
const DEFAULTS = {
  search: '',
  searchMode: 'all',
  page: 1,
  size: 10,
  viewMode: 1,
  level: '',
} as const

/**
 * 文档列表 Composable
 * 
 * 功能：
 * 1. 管理列表页的筛选条件（搜索、分页、排序等）
 * 2. 筛选条件自动同步到 URL（可分享、可刷新）
 * 3. 调用 Go API 获取文档列表
 * 4. 提供重置筛选条件的方法
 * 
 * 使用 createSharedComposable 确保全局单例
 */
const _useDocs = () => {
  // ============================================
  // 1. URL 同步状态
  // 每个状态都自动与 URL 查询参数双向同步
  // ============================================

  /** 搜索关键词 */
  const searchInput = useRouteQueryString('search', { defaultValue: DEFAULTS.search })

  /** 搜索模式：all | title | description */
  const searchMode = useRouteQueryString('searchMode', { defaultValue: DEFAULTS.searchMode })

  /** 当前页码 */
  const page = useRouteQueryNumber('page', { defaultValue: DEFAULTS.page })

  /** 每页条数 */
  const size = useRouteQueryNumber('size', { defaultValue: DEFAULTS.size })

  /** 视图模式：1=详细 | 2=简洁 */
  const viewMode = useRouteQueryNumber('viewMode', { defaultValue: DEFAULTS.viewMode })

  /** 等级筛选：P1-P5 */
  const level = useRouteQueryString('level', { defaultValue: DEFAULTS.level })

  /** 标签筛选：支持多标签（URL 中为 ?tag=a&tag=b） */
  const tags = useRouteQueryArray('tag')

  /**
   * 当筛选条件变化时，自动重置到第一页
   * 避免筛选后停留在不存在的页码
   */
  watch([searchInput, searchMode, level, tags], () => {
    page.value = DEFAULTS.page
  }, { deep: true })

  // ============================================
  // 2. 构建 API 请求参数
  // ============================================

  /**
   * 将当前筛选条件转换为 URLSearchParams
   * 自动跳过空值，保持 URL 干净
   */
  const queryParams = computed(() => {
    const params = new URLSearchParams()

    // 分页参数（必传）
    params.append('page', String(page.value))
    params.append('limit', String(size.value))

    // 搜索关键词
    if (searchInput.value.trim()) {
      params.append('search', searchInput.value.trim())
    }

    // 搜索模式（非默认值时传递）
    if (searchMode.value !== DEFAULTS.searchMode) {
      params.append('searchMode', searchMode.value)
    }

    // 等级筛选
    if (level.value) {
      params.append('level', level.value)
    }

    // 标签筛选（每个标签单独一个参数）
    tags.value.forEach(t => params.append('tag', t))

    return params
  })

  // ============================================
  // 3. 调用 API 获取数据
  // ============================================

  /**
   * 使用 useAsyncData 获取文档列表
   * 当 watch 中的依赖变化时自动重新请求
   */
  const config = useRuntimeConfig()
  const { data, pending, refresh, error } = useAsyncData<DocsResponse>(
    'docs-list',
    async () => {
      return await $fetch<DocsResponse>(`/api/docs?${queryParams.value.toString()}`, {
        baseURL: config.public.apiUrl
      })
    },
    {
      watch: [searchInput, searchMode, page, size, level, tags],
    }
  )

  // ============================================
  // 4. 工具方法
  // ============================================

  /**
   * 重置所有筛选条件到默认值
   * 常用于点击"清空筛选"按钮
   */
  const resetFilters = () => {
    searchInput.value = DEFAULTS.search
    searchMode.value = DEFAULTS.searchMode
    page.value = DEFAULTS.page
    size.value = DEFAULTS.size
    viewMode.value = DEFAULTS.viewMode
    level.value = DEFAULTS.level
    tags.value = []
  }

  // ============================================
  // 5. 对外暴露
  // ============================================

  return {
    // 筛选状态（双向绑定）
    searchInput,
    searchMode,
    page,
    size,
    viewMode,
    level,
    tags,

    // 数据状态
    docs: data,          // 文档列表数据
    pending,             // 加载中状态
    error,               // 错误信息
    refresh,             // 手动刷新

    // 操作方法
    resetFilters,        // 重置所有筛选
  }
}

/**
 * 导出全局单例 useDocs
 * createSharedComposable 确保在多个组件中调用时共享同一实例
 * 避免重复请求和状态不一致
 */
export const useDocs = createSharedComposable(_useDocs)