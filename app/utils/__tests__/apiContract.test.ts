import { describe, expect, it, expectTypeOf } from 'vitest'
import {
  docsApiUrl,
  docDetailApiUrl,
  resolveLangParam,
} from '../docs'
import type { ApiDocDetail, ApiDocSummary, DocsResponse, SeriesGroup } from '../apiTypes'

// API 契约的编译期护栏。
//
// 这些断言在后端 domain/dto.go 的响应视图变化（增删字段）时会**编译失败**，
// 提醒你同步更新 app/utils/apiTypes.ts；后端侧的运行时护栏则是
// moongate-api 的 internal/api/testdata/contract 快照测试。
//
// 注意：vitest 运行期不检查类型（expectTypeOf 在 `vitest run` 下是空操作），
// 这份护栏由 `pnpm typecheck` 执行——CI 已把它与 `pnpm test` 一起跑。
describe('API 契约类型（与后端 DocSummary / DocDetail 对齐）', () => {
  it('摘要视图字段与后端 DocSummary 完全一致', () => {
    expectTypeOf<keyof ApiDocSummary>().toEqualTypeOf<
      | 'title'
      | 'description'
      | 'date'
      | 'slug'
      | 'series'
      | 'order'
      | 'tags'
      | 'lang'
      | 'isFallback'
      | 'hasTranslation'
    >()
  })

  it('详情视图 = 摘要视图 + 正文', () => {
    expectTypeOf<ApiDocDetail>().toMatchTypeOf<ApiDocSummary>()
    expectTypeOf<ApiDocDetail['content']>().toEqualTypeOf<string>()
  })

  it('系列分组为裸数组（slug + docs）', () => {
    expectTypeOf<keyof SeriesGroup>().toEqualTypeOf<'slug' | 'docs'>()
    expectTypeOf<SeriesGroup['docs']>().toEqualTypeOf<ApiDocSummary[]>()
  })

  it('列表信封：data 的类型由 ?content=true 决定', () => {
    // 默认是摘要；带 content=true 时是详情——类型参数把这件事说清楚，
    // feed 侧因此不必再把摘要当详情读（那是让类型说谎）
    expectTypeOf<DocsResponse>().toMatchTypeOf<{ data: ApiDocSummary[] }>()
    expectTypeOf<DocsResponse<ApiDocDetail>>().toMatchTypeOf<{ data: ApiDocDetail[] }>()
    expectTypeOf<keyof DocsResponse>().toEqualTypeOf<
      'data' | 'total' | 'page' | 'limit' | 'totalPages'
    >()
  })
})

// 路径构建：唯一的 API URL 来源，避免各处手写/拼接字符串漂移。
describe('API URL 构建', () => {
  it('无参数时只有路径', () => {
    expect(docsApiUrl()).toBe('/api/docs')
  })

  it('分页与搜索参数', () => {
    expect(docsApiUrl({ page: 2, limit: 20 })).toBe('/api/docs?page=2&limit=20')
    expect(docsApiUrl({ search: 'nuxt vue', searchMode: 'title' })).toBe(
      '/api/docs?search=nuxt+vue&searchMode=title',
    )
  })

  it('标签可多个（?tag=a&tag=b），空标签不发送', () => {
    expect(docsApiUrl({ tags: ['Go', 'Engineering'] })).toBe('/api/docs?tag=Go&tag=Engineering')
    expect(docsApiUrl({ tags: [] })).toBe('/api/docs')
  })

  it('系列分组与正文开关', () => {
    expect(docsApiUrl({ group: 'series' })).toBe('/api/docs?group=series')
    expect(docsApiUrl({ group: 'series', lang: 'en' })).toBe('/api/docs?group=series&lang=en')
    expect(docsApiUrl({ content: true, page: 1 })).toBe('/api/docs?page=1&content=true')
  })

  it('详情路径对 slug 做转义，lang 走标准查询串', () => {
    expect(docDetailApiUrl('nuxt-url-state-guide')).toBe('/api/docs/nuxt-url-state-guide')
    expect(docDetailApiUrl('a/b')).toBe('/api/docs/a%2Fb')
    expect(docDetailApiUrl('a/b', 'en')).toBe('/api/docs/a%2Fb?lang=en')
  })

  it('语言映射：只有 en 请求英文内容', () => {
    expect(resolveLangParam('en')).toBe('en')
    expect(resolveLangParam('zh_cn')).toBe('')
    expect(resolveLangParam('ja')).toBe('')
    expect(resolveLangParam('fr')).toBe('')
  })
})
