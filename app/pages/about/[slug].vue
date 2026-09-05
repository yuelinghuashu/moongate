<template>
  <Skeleton v-if="!page" />
  <div v-else>
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

// 关于页面详情响应体
interface AboutDetailResponse {
  slug: string
  title: string
  description: string
  date: string
  content: string             // 原始未高亮的 HTML 内容
  highlightedContent?: string // 用于在服务端存放高亮转换后的完全体 HTML
}

// 复用公共 useDocDetail：数据获取 + Shiki 高亮 + 大纲提取
const { page, contentRef, nestedOutline, isOutlineVisible } =
  useDocDetail<AboutDetailResponse>(
    `about-${slug.value}`,
    slug,
    (s) => `/api/about/${s}`,
  );

useSeoMeta({
  title: page.value?.title || t("site.title"),
  description: page.value?.description || t("site.description"),
  ogTitle: page.value?.title || t("site.title"),
  ogDescription: page.value?.description || t("site.description"),
});
</script>