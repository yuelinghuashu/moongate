// composables/useDocs.ts
import { useRouteQueryString, useRouteQueryNumber, useRouteQueryArray } from './useRouteQuery'
import { useAsyncData, queryCollection } from '#imports'
import { createSharedComposable } from '@vueuse/core'

// 定义文档项类型（基于查询选择的字段）
interface DocItem {
  id: string
  title: string
  description: string
  level: string
  tags: string[]
  permalink: string
  date: string
  path: string
}

const _useDocs = () => {
  const DEFAULT_OPTIONS = {
    search: '',
    searchOption: 1,
    page: 1,
    size: 5,
    viewMode: 1,
    level: '',
  }

  // ---------- 路由 query 状态（自动同步 URL）----------
  const searchInput = useRouteQueryString('search', { defaultValue: DEFAULT_OPTIONS.search })
  const searchOption = useRouteQueryNumber('option', { defaultValue: DEFAULT_OPTIONS.searchOption })
  const page = useRouteQueryNumber('page', { defaultValue: DEFAULT_OPTIONS.page })
  const size = useRouteQueryNumber('size', { defaultValue: DEFAULT_OPTIONS.size })
  const viewMode = useRouteQueryNumber('viewMode', { defaultValue: DEFAULT_OPTIONS.viewMode })
  const level = useRouteQueryString('level', { defaultValue: DEFAULT_OPTIONS.level })

  // 直接使用 useRouteQueryArray 返回的响应式数组，无需二次包装
  const tags = useRouteQueryArray('tag')

  watch(tags, () => {
    page.value = 1
  })

  // 构建查询逻辑
  const buildQuery = () => {
    let query = queryCollection('docs').order('date', 'DESC')
    const keyword = searchInput.value.trim()

    if (keyword) {
      if (searchOption.value === 1) {
        query = query.orWhere((q) =>
          q
            .where('title', 'LIKE', `%${keyword}%`)
            .where('description', 'LIKE', `%${keyword}%`)
        )
      } else {
        query = query.where('title', 'LIKE', `%${keyword}%`)
      }
    }

    if (level.value) {
      query = query.where('level', '=', level.value)
    }

    if (tags.value.length) {
      query = query.andWhere((q) => {
        tags.value.forEach((tag) => {
          q = q.where('tags', 'LIKE', `%${tag}%`)
        })
        return q
      })
    }

    return query
  }

  // 数据获取
  const { data, pending, refresh } = useAsyncData(
    'docs-list',
    async () => {
      const query = buildQuery()
      const [total, list] = await Promise.all([
        query.count(),
        query
          .skip((page.value - 1) * size.value)
          .limit(size.value)
          .select(
            'id',
            'title',
            'description',
            'level',
            'tags',
            'permalink',
            'date',
            'path'
          )
          .all(),
      ])
      return { total, list: list as DocItem[] }
    },
    {
      watch: [searchInput, searchOption, page, size, viewMode, level, tags],
    }
  )

  const resetFilters = () => {
    searchInput.value = DEFAULT_OPTIONS.search
    searchOption.value = DEFAULT_OPTIONS.searchOption
    page.value = DEFAULT_OPTIONS.page
    size.value = DEFAULT_OPTIONS.size
    viewMode.value = DEFAULT_OPTIONS.viewMode
    level.value = DEFAULT_OPTIONS.level
    tags.value = []
  }

  return {
    searchInput,
    searchOption,
    page,
    size,
    viewMode,
    level,
    tags,
    docsList: data,
    pending,
    refresh,
    resetFilters,
  }
}

/**
 * 全局唯一的 useDocs 单例
 * 确保在多个组件中调用同一份状态，避免重复请求和状态冲突
 */
export const useDocs = createSharedComposable(_useDocs)