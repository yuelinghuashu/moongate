<template>
  <div v-if="page">
    <main class="flex min-w-0">
      <!-- 文档内容 -->
      <ContentRenderer :value="page" />

      <!-- 大纲目录 -->
      <Outline
        v-if="isDesktop"
        :outline="page?.body.toc?.links"
        class="sticky top-25"
      />
    </main>
  </div>
  <div v-else>
    <ErrorPage />
  </div>
</template>

<script lang="ts" setup>
import { withLeadingSlash } from "ufo";
const route = useRoute();
const { locale, t } = useI18n();
const { isDesktop } = useResponsive();

const slug = computed(() => {
  const path = withLeadingSlash(String(route.params.slug || "/"));
  // 移除语言前缀部分
  return path.replace(new RegExp(`^/(${locale.value})`), "") || "/";
});

const { data: page, error } = await useAsyncData(`about-${slug.value}`, () => {
  return queryCollection("about").path(`/about${slug.value}`).first();
});

console.log("page", page.value);

// 监控错误
if (error.value) {
  console.error("页面数据获取错误:", error.value);
}

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
