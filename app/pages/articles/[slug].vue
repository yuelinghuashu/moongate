<template>
  <div v-if="page">
    <!-- 文章区 -->
    <main class="flex">
      <div class="flex-1 min-w-0">
        <UBadge
          class="mb-4"
          variant="outline"
          :label="`// Update At ${page.meta.date}`"
        />

        <!-- 文档内容 -->
        <ContentRenderer :value="page" />
      </div>
      <!-- 大纲目录 -->
      <ClientOnly>
        <Outline
          v-if="isDesktop"
          :outline="page.body.toc?.links"
          class="sticky top-25"
        />
      </ClientOnly>
    </main>

    <!-- 评论区 -->
    <footer class="h-100 text-center max-w-(--ui-container)">
      <UButton
        v-if="!isDiscussionVisible"
        class="text-center cursor-pointer"
        label="打开评论区"
        variant="ghost"
        @click="isDiscussionVisible = !isDiscussionVisible"
      />
      <Discussion v-if="isDiscussionVisible" />
    </footer>
  </div>
  <div v-else>
    <ErrorPage />
  </div>
</template>

<script lang="ts" setup>
import { withLeadingSlash } from "ufo";
const { locale, t } = useI18n();
const route = useRoute();
const { isDesktop, isMobile } = useResponsive();

// 评论区显示状态
const isDiscussionVisible = ref(false);

// 核心：移除语言前缀，得到原始路径
// 例如：/en/articles/welcome -> /articles/welcome
const slug = computed(() => {
  const path = withLeadingSlash(String(route.params.slug || "/"));
  // 移除语言前缀部分
  return path.replace(new RegExp(`^/(${locale.value})`), "") || "/";
});

// 稳定查询：永远只查询 'articles' 这个集合
const { data: page } = await useAsyncData(`articles-${slug.value}`, () => {
  return queryCollection("articles").path(`/articles${slug.value}`).first();
});

// 设置 SEO 元信息
if (page.value?.title && page.value?.description) {
  useSeoMeta({
    title: page.value?.title,
    description: page.value?.description,
    ogTitle: page.value?.title,
    ogDescription: page.value?.description,
  });
} else {
  useSeoMeta({
    title: t("title"),
    description: t("description"),
    ogTitle: t("title"),
    ogDescription: t("description"),
  });
}
</script>

<style scoped></style>
