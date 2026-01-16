<template>
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
</template>

<script lang="ts" setup>
const { locale } = useI18n();

onMounted(() => {
  getArticleList();
});

// 关于列表
const aboutList = ref();
// 获取文章列表
const getArticleList = async () => {
  // 获取文章列表
  aboutList.value = await queryCollection("about").all();
  console.log("articleList", aboutList.value);
};
</script>

<style></style>
