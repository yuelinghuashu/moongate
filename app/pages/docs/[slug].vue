<template>
  <Skeleton v-if="!page" />
  <div v-else>
    <DocsMeta :date="page.date" :level="page.level" :tags="page.tags" />

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

const route = useRoute();
const { t } = useI18n();
const { isDesktop } = useResponsive();
const slug = computed(() => (route.params.slug as string) || "");

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
}

// 复用公共 useDocDetail：数据获取 + Shiki 高亮 + 大纲提取
const { page, contentRef, nestedOutline, isOutlineVisible } =
  useDocDetail<DocDetailResponse>(
    `doc-${slug.value}`,
    slug,
    `/api/docs/${slug.value}`,
  );

useSeoMeta({
  title: page.value?.title || t("site.title"),
  description: page.value?.description || t("site.description"),
  ogTitle: page.value?.title || t("site.title"),
  ogDescription: page.value?.description || t("site.description"),
});
</script>