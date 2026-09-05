<template>
  <div v-if="page" class="flex flex-col gap-4">
    <Card
      v-for="item in page"
      :key="item.slug"
      as="li"
      hoverable
      class="cursor-pointer"
      @click="navigateTo(localePath(`/about/${item.slug}`))"
    >
      <template #header>{{ item.title }}</template>
      <template #default>{{ item.description }}</template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { Card } from "moongate-vue";

const localePath = useLocalePath();

// 类型定义 
interface AboutDetailResponse {
  slug: string
  title: string
  description: string
  date: string
}

// 获取关于页面列表
const config = useRuntimeConfig()

const { data: page } = await useAsyncData<AboutDetailResponse[]>(
  'about-list',
  async () => {
    return await $fetch<AboutDetailResponse[]>(`/api/about`, {
      baseURL: config.public.apiUrl
    })
  }
)

useSeoMeta({
  title: "关于 | About",
  description:
    "了解 Moongate 的诞生故事：从月灵花束的诗意起源，到月球与门的意象融合，再到极简科幻终端的视觉设计。这里记录着一个技术博客的创作理念与文化沉淀。",
  ogTitle: "关于 Moongate：当月亮与代码交汇",
  ogDescription: "探索 Moongate 背后的设计哲学、词源考据与技术情怀。",
});
</script>
