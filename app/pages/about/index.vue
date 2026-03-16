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

useSeoMeta({
  title: "关于 Moongate | 品牌故事与技术哲学",
  description:
    "了解 Moongate 的诞生故事：从月灵花束的诗意起源，到月球与门的意象融合，再到极简科幻终端的视觉设计。这里记录着一个技术博客的创作理念与文化沉淀。",
  ogTitle: "关于 Moongate：当月亮与代码交汇",
  ogDescription: "探索 Moongate 背后的设计哲学、词源考据与技术情怀。",
});
</script>

<style></style>
