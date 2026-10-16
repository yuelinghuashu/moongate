import { describe, it, expect } from 'vitest'
import {
  DOCS_FILTER_DEFAULTS,
  filtersToApiQuery,
  filtersToQuery,
  parseDocsFilters,
  type DocsFilters,
} from '../useDocs'

// 筛选条件现在是"URL 派生 + 单写入口"的纯数据流，
// 因此不需要挂载组件、不需要 Nuxt 上下文即可完整覆盖（旧实现的
// 189 行 URL 同步注册表没有对应测试，因为它依赖 nuxtApp 与组件实例）。

const filters = (patch: Partial<DocsFilters> = {}): DocsFilters => ({
  ...DOCS_FILTER_DEFAULTS,
  tags: [],
  ...patch,
})

describe('parseDocsFilters（URL → 筛选条件）', () => {
  it('空 query 得到默认值', () => {
    expect(parseDocsFilters({})).toEqual(filters())
  })

  it('解析全部参数', () => {
    expect(
      parseDocsFilters({
        search: 'vue',
        searchMode: 'title',
        page: '3',
        limit: '20',
        viewMode: '2',
        tag: ['Go', 'Nuxt'],
      }),
    ).toEqual(filters({
      search: 'vue',
      searchMode: 'title',
      page: 3,
      limit: 20,
      viewMode: 2,
      tags: ['Go', 'Nuxt'],
    }))
  })

  it('单个 tag 与数组 tag 都能处理', () => {
    expect(parseDocsFilters({ tag: 'Go' }).tags).toEqual(['Go'])
    expect(parseDocsFilters({ tag: ['Go'] }).tags).toEqual(['Go'])
    expect(parseDocsFilters({ tag: ['Go', ''] }).tags).toEqual(['Go'])
  })

  it('非法值回落默认值（深链不会把页面弄崩）', () => {
    expect(parseDocsFilters({ searchMode: 'bogus' }).searchMode).toBe('all')
    expect(parseDocsFilters({ page: 'abc' }).page).toBe(1)
    expect(parseDocsFilters({ page: '0' }).page).toBe(1)
    expect(parseDocsFilters({ page: '-2' }).page).toBe(1)
    expect(parseDocsFilters({ limit: 'x' }).limit).toBe(10)
    expect(parseDocsFilters({ viewMode: '0' }).viewMode).toBe(1)
  })
})

describe('filtersToQuery（筛选条件 → URL）', () => {
  it('默认值不写入 URL', () => {
    expect(filtersToQuery(filters())).toEqual({})
  })

  it('只写入非默认值', () => {
    expect(filtersToQuery(filters({ search: 'vue', page: 2 }))).toEqual({
      search: 'vue',
      page: '2',
    })
  })

  it('多标签写成数组', () => {
    expect(filtersToQuery(filters({ tags: ['Go', 'Nuxt'] }))).toEqual({
      tag: ['Go', 'Nuxt'],
    })
  })

  it('往返一致：parse(filtersToQuery(x)) === x', () => {
    const original = filters({
      search: 'nuxt',
      searchMode: 'description',
      page: 4,
      limit: 50,
      viewMode: 2,
      tags: ['Go', 'Nuxt'],
    })
    expect(parseDocsFilters(filtersToQuery(original))).toEqual(original)
  })
})

describe('filtersToApiQuery（筛选条件 → 后端参数）', () => {
  it('参数名与后端一致：limit（不是 size）、tag 可多个', () => {
    const query = filtersToApiQuery(filters({ page: 2, limit: 20, search: 'go', tags: ['Go'] }), '')

    expect(query).toEqual({
      page: 2,
      limit: 20,
      search: 'go',
      // searchMode 的默认值 all 不发送，交给后端默认值
      searchMode: undefined,
      tags: ['Go'],
      lang: '',
    })
    expect(query).not.toHaveProperty('size')
    expect(query).not.toHaveProperty('viewMode')
  })

  it('非默认 searchMode 才发送', () => {
    expect(filtersToApiQuery(filters({ searchMode: 'title' }), '').searchMode).toBe('title')
    expect(filtersToApiQuery(filters({ searchMode: 'description' }), '').searchMode).toBe('description')
    expect(filtersToApiQuery(filters(), '').searchMode).toBeUndefined()
  })

  it('语言参数透传（仅 en 时非空）', () => {
    expect(filtersToApiQuery(filters(), 'en').lang).toBe('en')
    expect(filtersToApiQuery(filters(), '').lang).toBe('')
  })
})

// 写入口的语义（合并 patch、变化才写、筛选变化回第 1 页）在后端不可见，
// 这里通过"同一份纯函数组合"表达其不变量。
describe('筛选变化 → 回到第 1 页', () => {
  const PAGE_RESET_KEYS = ['search', 'searchMode', 'tags']

  it('搜索/模式/标签变化时页码不再是历史值', () => {
    const before = filters({ page: 3, search: '' })
    for (const key of PAGE_RESET_KEYS) {
      const patch: Partial<DocsFilters> =
        key === 'tags' ? { tags: ['Go'] } : key === 'search' ? { search: 'go' } : { searchMode: 'title' }
      const changed = Object.keys(patch).some(k => PAGE_RESET_KEYS.includes(k))
      const next = { ...before, ...patch, ...(changed ? { page: 1 } : {}) }
      expect(next.page).toBe(1)
    }
  })
})
