<template>
  <div class="flex flex-col gap-2">
    <Card
      v-for="item in page"
      :key="item.id"
      as="li"
      hoverable
      class="cursor-pointer"
      @click="navigateTo(localePath(item.path))"
    >
      <template #header>{{ item.title }}</template>
      <template #default>{{ item.description }}</template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { Card } from "moongate-vue";

const localePath = useLocalePath();

// 获取关于页面列表
const { data: page } = await useAsyncData("about-list", () => {
  return queryCollection("about").order("date", "ASC").all();
});

useSeoMeta({
  title: "关于 | About",
  description:
    "了解 Moongate 的诞生故事：从月灵花束的诗意起源，到月球与门的意象融合，再到极简科幻终端的视觉设计。这里记录着一个技术博客的创作理念与文化沉淀。",
  ogTitle: "关于 Moongate：当月亮与代码交汇",
  ogDescription: "探索 Moongate 背后的设计哲学、词源考据与技术情怀。",
});
</script>
