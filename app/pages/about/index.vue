<template>
  <div>
    <UBlogPost
      v-for="item in page"
      :key="item.id"
      :title="item.title"
      :description="item.description"
      :date="item.date"
      class="card cursor-pointer mb-4 last-of-type:mb-0"
      :to="localePath(item.path)"
    />
  </div>
</template>

<script lang="ts" setup>
const localePath = useLocalePath();

// 获取关于页面列表
const { data: page } = await useAsyncData("about-list", () => {
  return queryCollection("about").order("date", "ASC").all();
});
console.log("articleList", page.value ? true : false);
</script>

<style></style>
