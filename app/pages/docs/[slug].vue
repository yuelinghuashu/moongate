<template>
  <Skeleton v-if="!page" />
  <div v-else>
    <DocsMeta :date="page.date" :level="page.level" :tags="page.tags" />

    <!-- 请求语言无译文时回退到中文的提示条 -->
    <div
      v-if="page.isFallback"
      class="mb-4 px-4 py-2 text-sm rounded-sm border"
      style="border-color: var(--ui-border); color: var(--ui-text-muted)"
    >
      {{ t("docs.detail.fallbackNotice") }}
    </div>

    <article class="prose dark:prose-invert max-w-none prose-sm md:prose-base lg:prose-lg">
      <h1 class="text-3xl font-bold">{{ page.title }}</h1>
      <div class="shiki-content" v-html="contentRef" />
    </article>

    <ClientOnly>
      <Drawer
        v-model="isOutlineVisible"
        size="lg"
        :placement="isDesktop ? 'right' : 'bottom'"
        :title="t('docs.detail.title')"
      >
        <DocsOutline :outline="nestedOutline" />
      </Drawer>
    </ClientOnly>

    <SharedBuyMeCoffee class="mb-8 mt-8" />
  </div>
</template>

<script lang="ts" setup>
import { Drawer, Skeleton } from "moongate-vue";
import { resolveLangParam } from "~/utils/docs";

const route = useRoute();
const { t, locale } = useI18n();
const { isDesktop } = useResponsive();
const config = useRuntimeConfig();
const slug = computed(() => (route.params.slug as string) || "");
// 内容语言：由 /en URL 前缀（i18n locale）驱动
const lang = computed(() => resolveLangParam(locale.value));

// 文档详情响应体
interface DocDetailResponse {
  permalink: string
  slug: string
  title: string
  description: string
  date: string
  level: string
  series: string
  tags: string[]
  content: string            // 原始未高亮的 HTML 内容
  highlightedContent?: string // 服务端异步高亮生成的完全体 HTML
  lang?: string              // 实际返回内容的语言
  isFallback?: boolean       // 请求语言无译文时回退到了另一语言
  hasTranslation?: boolean   // 该 slug 是否存在英文译文
}

// 复用公共 useDocDetail：数据获取 + Shiki 高亮 + 大纲提取
const { page, contentRef, nestedOutline, isOutlineVisible } =
  useDocDetail<DocDetailResponse>(
    `doc-${slug.value}`,
    slug,
    (s) => `/api/docs/${s}`,
    lang,
  );

// ---------- SEO：canonical + hreflang 双语交替 ----------
const siteUrl = computed(() => (config.public.siteUrl || "").replace(/\/$/, ""));
const docZhUrl = computed(() => `${siteUrl.value}/docs/${slug.value}`);
const docEnUrl = computed(() => `${siteUrl.value}/en/docs/${slug.value}`);
const canonicalUrl = computed(() =>
  `${siteUrl.value}${route.path}`,
);

useHead(() => ({
  link: [
    { rel: "canonical", href: canonicalUrl.value } as const,
    { rel: "alternate", hreflang: "x-default", href: docZhUrl.value } as const,
    // 存在英文译文时声明双语交替页
    ...(page.value?.hasTranslation
      ? [
          { rel: "alternate", hreflang: "zh-CN", href: docZhUrl.value } as const,
          { rel: "alternate", hreflang: "en", href: docEnUrl.value } as const,
        ]
      : []),
  ],
}));

useSeoMeta({
  title: page.value?.title || t("site.title"),
  description: page.value?.description || t("site.description"),
  ogTitle: page.value?.title || t("site.title"),
  ogDescription: page.value?.description || t("site.description"),
});
</script>
