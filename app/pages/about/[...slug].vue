<template>
  <div v-if="page" class="flex">
    <!-- 文档内容 -->
    <ContentRenderer
      v-if="page"
      :value="page"
      class="w-full max-w-(--ui-container)"
    />

    <!-- 大纲目录 -->
    <Outline :outline="page?.body.toc?.links" class="sticky top-25" />
  </div>
  <div v-else>
    <ErrorPage />
  </div>
</template>

<script lang="ts" setup>
import { withLeadingSlash } from "ufo";
const route = useRoute();
const { locale } = useI18n();

const slug = computed(() => {
  const path = withLeadingSlash(String(route.params.slug || "/"));
  // 移除语言前缀部分
  return path.replace(new RegExp(`^/(${locale.value})`), "") || "/";
});

const { data: page } = await useAsyncData(
  route.path,
  () => {
    return queryCollection("about").path(`/about${slug.value}`).first();
  },
  {
    // 设置 transform 确保数据一致性
    transform: (data) => {
      if (!data) return null;
      return data;
    },
  },
);
console.log(page.value);

// 设置 SEO 元信息
if (page.value?.title !== "" && page.value?.description != "") {
  useSeoMeta({
    title: page.value?.title,
    description: page.value?.description,
    ogTitle: page.value?.title,
    ogDescription: page.value?.description,
  });
}
</script>

<style scoped></style>
