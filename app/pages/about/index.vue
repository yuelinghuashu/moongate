<template>
  <div class="max-w-(--ui-container)">
    <UBlogPost
      v-for="item in page"
      :key="item.id"
      :title="item.title"
      :description="item.description"
      :date="item.meta.date"
      class="card cursor-pointer mb-4 last-of-type:mb-0"
      @click="
        navigateTo(locale === 'zh_cn' ? item.path : `/${locale}${item.path}`)
      "
    />
  </div>
</template>

<script lang="ts" setup>
const { locale } = useI18n();

// 获取关于页面列表
const { data: page } = await useAsyncData("aboutList", () => {
  return queryCollection("about").order("meta", "ASC").all();
});

console.log(page.value);
</script>

<style></style>
