// utils/apiTypes.ts
// 共享 API 类型定义（前端 + 服务端通用）
//
// 这里是内容 API 契约的唯一来源，字段与后端 domain/dto.go 的响应视图一一对应。
// 各页面 / composable 不要再另写一份同形 interface——一旦后端 DTO 变化，
// 重复定义会各自漂移，且 TypeScript 不会报错（多余字段被静默忽略）。
//
// 护栏（两者都要真正跑到才算护栏）：
//   - 后端：internal/api/testdata/contract 的 15 组响应快照（逐字段比对，CI 跑 go test）
//   - 前端：app/utils/__tests__/apiContract.test.ts 的类型断言
//     ——它由 CI 的 `pnpm typecheck` 执行（vitest 运行期不会检查类型，
//     因此仅有 `pnpm test` 时这份断言等于没跑）
//
// 因此本文件只描述"后端实际会发什么"，不掺杂页面自己的加工字段
// （例如高亮后的 highlightedContent 由 useDocDetail 在消费侧扩展）。

/**
 * 列表接口的 data 项：后端 DocSummary 视图（**不含正文**）
 *
 * series / order 在类型上可选，是为了兼容只关心部分字段的调用方与测试夹具；
 * 真实响应里后端总会带上它们（无系列 / 未声明顺序时为 null）。
 */
export interface ApiDocSummary {
  title: string
  description: string
  date: string
  slug: string
  /** 所属系列，无系列时后端返回 null */
  series?: string | null
  /** 系列内阅读顺序，未声明时后端返回 null */
  order?: number | null
  tags: string[]
  /** 实际返回内容的语言：zh | en */
  lang?: string
  /** 请求语言无译文时回退到了另一语言 */
  isFallback?: boolean
  /** 该 slug 是否存在英文译文 */
  hasTranslation?: boolean
}

/** 单篇详情视图：后端 DocDetail（摘要字段 + 必定存在的正文） */
export interface ApiDocDetail extends ApiDocSummary {
  content: string
}

/**
 * 组件内部使用的文档项：摘要字段 + 可选正文。
 * 列表接口默认不返回 content（需 `?content=true`），消费方不能假设一定有正文。
 */
export interface DocItem extends ApiDocSummary {
  content?: string
}

/**
 * 文档列表 API 响应格式（信封）。
 *
 * 泛型参数表达后端的一个既有行为：`?content=true` 时 data 里是 DocDetail（带正文），
 * 默认是 DocSummary。此前固定写成 ApiDocSummary[]，于是 feed 侧把同一对象当
 * DocItem 读 content，靠结构兼容侥幸通过——类型在说谎，现在由类型参数说清楚。
 */
export interface DocsResponse<T = ApiDocSummary> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * 系列分组（GET /api/docs?group=series，裸数组）
 */
export interface SeriesGroup {
  slug: string
  docs: ApiDocSummary[]
}
