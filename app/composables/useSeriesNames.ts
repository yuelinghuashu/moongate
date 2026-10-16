// composables/useSeriesNames.ts
// 系列 slug → 显示名 的唯一解析处。
//
// 此前 pages/series.vue 与 useSeriesNav 各写了一遍 `names[slug] || slug`，
// 回退规则一旦要改就得改两处。系列名来自 i18n 的 `series` 段（三种语言各一份）。
import { useI18nSafe } from './useI18nSafe'

/** 局部化的系列名映射（i18n `series` 段） */
export function useSeriesNames() {
  const { tm } = useI18nSafe()
  return computed<Record<string, string>>(() => (tm('series') as Record<string, string>) || {})
}

/**
 * 解析系列显示名：i18n 未收录该 slug 时回退为 slug 本身
 * （回退规则只在这里，不在调用方重复）
 */
export function resolveSeriesName(
  names: Record<string, string> | undefined,
  slug: string,
): string {
  return names?.[slug] || slug
}
