<template>
  <div class="max-w-(--ui-container)">
    <UBlogPost
      v-for="item in aboutList"
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

onMounted(() => {
  getAboutList();
});

// 关于列表
const aboutList = ref();
// 获取关于文章列表
const getAboutList = async () => {
  // 获取文章列表
  aboutList.value = await queryCollection("about").order("meta", "ASC").all();
  console.log("aboutList", aboutList.value);
};
</script>

<style></style>
