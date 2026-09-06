// composables/useSeriesNav.ts
// 系列导航数据装配：把 API 的系列分组映射为 <SeriesNav> 所需的 items + active + 标题。
//
// 职责（只做"拿到数据 + 映射"，不负责排序——排序由后端按 order/date 保证）：
// 1. 拉取全部分组（/api/docs?group=series，按 lang 缓存）
// 2. 按当前文档的 series slug 取同系列篇目
// 3. 映射为 SeriesNavItem[]（title → label，slug → href）
// 4. 计算当前激活项 key、系列名标题（i18n）
// 5. 无系列 / 无数据时返回空，交由上层渲染空
import { computed } from "vue";
import type { Ref } from "vue";
import { resolveLangParam } from "~/utils/docs";

/** 组内单篇摘要（/api/docs?group=series 返回的 DocSummary 结构） */
export interface SeriesDocSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  series: string | null;
  order?: number | null;
  tags: string[];
  lang?: string;
  isFallback?: boolean;
  hasTranslation?: boolean;
}

/** 系列分组 */
export interface SeriesGroup {
  slug: string;
  docs: SeriesDocSummary[];
}

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
    title: seriesNames?.[slug] || slug,
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
  const { tm } = useI18nSafe();
  const { locale } = useI18n();
  const config = useRuntimeConfig();
  const localePath = useLocalePath();

  const lang = computed(() => resolveLangParam(locale.value));

  // 按语言缓存全部分组（多个文章页共享一次请求，避免重复拉取）
  const { data } = useAsyncData<SeriesGroup[]>(
    computed(() => `series-nav-${lang.value}`),
    async () => {
      const query = lang.value ? `&lang=${lang.value}` : "";
      return await $fetch<SeriesGroup[]>(
        `/api/docs?group=series${query}`,
        { baseURL: config.public.apiUrl },
      );
    },
    {
      watch: [lang],
      server: true,
    },
  );

  // 局部化的系列名
  const seriesNames = computed(() => tm("series") as Record<string, string>);

  const result = computed<UseSeriesNavResult>(() =>
    buildSeriesNavModel(
      data.value || [],
      series.value,
      currentSlug.value,
      seriesNames.value || {},
      (s) => localePath(`/docs/${s}`),
    ),
  );

  return result;
}
