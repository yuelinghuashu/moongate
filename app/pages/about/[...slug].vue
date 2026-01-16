<template>
  <div v-if="page" class="flex">
    <!-- 文档内容 -->
    <div class="overflow-auto h-screen">
      <!-- <header class="mb-4">
        <UBadge :label="`// 创建日期： ${page.meta.date}`" />
      </header> -->

      <ContentRenderer v-if="page" :value="page" />

      <footer><!-- ... --></footer>
    </div>

    <!-- 大纲目录 -->
    <Outline :outline="page?.body.toc?.links" class="sticky top-25" />
  </div>
  <div v-else>
    <ErrorPage />
  </div>
</template>

<script lang="ts" setup>
const { locale, defaultLocale } = useI18n();
const route = useRoute();

// 计算应该查询的 Content 路径
const contentPath = computed(() => {
  if (locale.value === defaultLocale) {
    return route.path;
  }

  // 移除语言前缀
  return route.path.replace(`/${locale.value}`, "") || "/";
});

const { data: page } = await useAsyncData(
  route.path,
  () => {
    return queryCollection("about").path(contentPath.value).first();
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
  });
}
</script>

<style>
.empty-page {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border: 1px solid;
}
</style>
