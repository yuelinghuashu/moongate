// composables/useSeriesNav.ts
// 系列导航数据装配：把 API 的系列分组映射为 <SeriesNav> 所需的 items + active + 标题。
//
// 职责（只做"拿到数据 + 映射"，不负责排序——排序由后端按 order/date 保证）：
// 1. 拉取全部分组（/api/docs?group=series，按请求 URL 缓存）
// 2. 按当前文档的 series slug 取同系列篇目
// 3. 映射为 SeriesNavItem[]（title → label，slug → href）
// 4. 计算当前激活项 key、系列名标题（i18n）
// 5. 无系列 / 无数据时返回空，交由上层渲染空
import { docsApiUrl, resolveLangParam } from "~/utils/docs";
import type { SeriesGroup } from "~/utils/apiTypes";
import { resolveSeriesName, useSeriesNames } from "./useSeriesNames";

/** 映射给 <SeriesNav> 的 item */
export interface SeriesNavViewModel {
  key: string;
  label: string;
  href: string;
}

/** useSeriesNav 返回结构 */
export interface UseSeriesNavResult {
  /** 系列名标题（i18n），无则回退 slug */
  title: string;
  /** 有序 items（已由后端排好阅读顺序） */
  items: SeriesNavViewModel[];
  /** 当前激活项 key（当前文档 slug） */
  active: string;
  /** 当前系列 slug */
  seriesSlug: string;
  /** 是否真正存在系列（无则上层渲染为空） */
  hasSeries: boolean;
}

/**
 * 纯函数：把 API 分组 + 当前系列 + 激活 slug + 局部化系列名映射为视图模型。
 * 独立于 Nuxt 上下文（useAsyncData / $fetch / useLocalePath），便于单元测试。
 *
 * @param groups - /api/docs?group=series 返回的全部分组
 * @param seriesSlug - 当前文档所属系列 slug（可为空）
 * @param currentSlug - 当前文档 slug（激活项 key）
 * @param seriesNames - 局部化系列名映射（i18n tm("series")）
 * @param toHref - 由 slug 生成链接的函数（生产环境为 localePath）
 */
export function buildSeriesNavModel(
  groups: SeriesGroup[],
  seriesSlug: string | null | undefined,
  currentSlug: string,
  seriesNames: Record<string, string>,
  toHref: (slug: string) => string,
): UseSeriesNavResult {
  const slug = seriesSlug || "";
  const group = groups.find((g) => g.slug === slug);

  if (!slug || !group) {
    return {
      title: "",
      items: [],
      active: currentSlug,
      seriesSlug: slug,
      hasSeries: !!slug,
    };
  }

  const items: SeriesNavViewModel[] = group.docs.map((doc) => ({
    key: doc.slug,
    label: doc.title,
    href: toHref(doc.slug),
  }));

  return {
    title: resolveSeriesName(seriesNames, slug),
    items,
    active: currentSlug,
    seriesSlug: slug,
    hasSeries: true,
  };
}

/**
 * 装配系列导航数据。
 *
 * @param series - 当前文档的系列 slug（可为空串 null）
 * @param currentSlug - 当前文档 slug（作为激活项 key）
 */
export function useSeriesNav(
  series: Ref<string | null | undefined>,
  currentSlug: Ref<string>,
) {
  const { locale } = useI18n();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();
  const seriesNames = useSeriesNames();

  const lang = computed(() => resolveLangParam(locale.value));

  // 按请求 URL 缓存全部分组：key 与请求 URL 相同，语言变化时自动重新取数
  // （旧实现语言既在 key 里、又在 watch 列表里，watch 属多余）
  const url = computed(() => docsApiUrl({ group: "series", lang: lang.value }));

  const { data } = useAsyncData<SeriesGroup[]>(
    computed(() => `series-nav:${url.value}`),
    () => $fetch<SeriesGroup[]>(url.value, { baseURL: config.public.apiUrl }),
    { server: true },
  );

  return computed<UseSeriesNavResult>(() =>
    buildSeriesNavModel(
      data.value || [],
      series.value,
      currentSlug.value,
      seriesNames.value || {},
      (s) => localePath(`/docs/${s}`),
    ),
  );
}
