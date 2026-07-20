<template>
  <Skeleton v-if="pending" />
  <div v-else-if="page">
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
        :title="t('doc.title')"
      >
        <DocsOutline :outline="nestedOutline" />
      </Drawer>
    </ClientOnly>

    <SharedBuyMeCoffee class="mb-8 mt-8" />
  </div>
  <div v-else>
    <ErrorPage />
  </div>
</template>

<script lang="ts" setup>
import { Drawer, Skeleton } from "moongate-vue";
import { highlightHtmlContent } from "~/utils/shikiProcessor"; // 引入纯服务端高亮转换工具

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
  highlightedContent?: string // 新增：服务端异步高亮生成的完全体 HTML
}

const config = useRuntimeConfig()

const {
  data: page,
  pending,
} = useAsyncData<DocDetailResponse>(
  `doc-${slug.value}`,
  async () => {
    return await $fetch<DocDetailResponse>(`/api/docs/${slug.value}`, {
      baseURL: config.public.apiUrl
    });
  },
  { 
    watch: [slug],
    // 🔥 核心魔法：数据在 Node.js 服务端抓取到后，直接拦截并转换为高亮 HTML
    transform: async (data) => {
      if (data && data.content) {
        try {
          data.highlightedContent = await highlightHtmlContent(data.content)
        } catch (e) {
          console.error(`[${slug.value}] 高亮渲染失败，使用原始内容:`, e)
          data.highlightedContent = data.content
        }
      }
      return data
    }
  },
);

// 此时 contentRef 优先读取服务端已经注入并高亮好的完全体 HTML 字符串
const contentRef = computed(() => page.value?.highlightedContent || page.value?.content || '')
const { nestedOutline, isOutlineVisible, isOutlineIconVisible } = useOutline(contentRef)

watchEffect(() => {
  isOutlineIconVisible.value = !!page.value;
});

useSeoMeta({
  title: page.value?.title || t("title"),
  description: page.value?.description || t("description"),
  ogTitle: page.value?.title || t("title"),
  ogDescription: page.value?.description || t("description"),
});
</script>