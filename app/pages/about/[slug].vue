<template>
  <Skeleton v-if="pending" />
  <div v-else-if="page">
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

// 关于页面详情响应体
interface AboutDetailResponse {
  permalink: string
  slug: string
  title: string
  description: string
  date: string
  content: string             // 原始未高亮的 HTML 内容
  highlightedContent?: string // 新增：用于在服务端存放高亮转换后的完全体 HTML
}

// 获取关于页面详情
const config = useRuntimeConfig()

const { data: page, pending } = useAsyncData<AboutDetailResponse>(
  `about-${slug.value}`,
  async () => {
    return await $fetch<AboutDetailResponse>(`/api/about/${slug.value}`, {
      baseURL: config.public.apiUrl
    })
  },
  { 
    watch: [slug],
    transform: async (data) => {
      if (data && data.content) {
        data.highlightedContent = await highlightHtmlContent(data.content)
      }
      return data
    }
  }
)

// 此时 contentRef 优先读取服务端已经注入并高亮好的完全体 HTML 字符串
const contentRef = computed(() => page.value?.highlightedContent || page.value?.content || '')
const { nestedOutline, isOutlineVisible, isOutlineIconVisible } = useOutline(contentRef)

watchEffect(() => {
  isOutlineIconVisible.value = !!page.value?.content;
});

useSeoMeta({
  title: page.value?.title || t("title"),
  description: page.value?.description || t("description"),
  ogTitle: page.value?.title || t("title"),
  ogDescription: page.value?.description || t("description"),
});
</script>