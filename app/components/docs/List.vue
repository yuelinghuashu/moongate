<template>
  <div class="flex flex-col gap-4">
    <Card
      v-for="item in docs"
      :key="item.permalink"
      as="li"
      hoverable
      :hide-body="viewMode === 1 ? false : true"
      class="cursor-pointer"
      @click="navigateToDoc(item.slug)"
    >
      <template #header>
        <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
          <div class="flex-1">
            <h2 class="text-xl font-medium">{{ item.title }}</h2>
            <div class="flex flex-wrap mt-1">
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="inline-block nav-link text-sm cursor-pointer"
                :class="{ active: isTagSelected(tag) }"
                @click="handleTagClick(tag, $event)"
                >#{{ tag }}</span
              >
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <Badge v-if="level !== item.level" :label="item.level" />
            <time :datetime="item.date" class="text-xs text-ui-text-muted whitespace-nowrap">
              {{ dayjs(item.date).format("YYYY-MM-DD") }}
            </time>
          </div>
        </div>
      </template>
      <template #default>
        <p class="line-clamp-1">{{ item.description }}</p>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { Card, Badge } from "moongate-vue";
import { useDocs } from "~/composables/useDocs";
import { useTagsFilter } from "~/composables/useTagsFilter";
import type { DocItem } from "~/utils/apiTypes";
import dayjs from "dayjs";

// ---------- 定义 Props ----------
defineProps<{
  docs: DocItem[]
  viewMode: number
}>()


// ---------- 响应式工具 ----------
const localePath = useLocalePath()

// ---------- 全局状态 ----------
const { tags, level } = useDocs()
const { isTagSelected, handleTagClick } = useTagsFilter(tags)

// ---------- 导航 ----------
const navigateToDoc = (slug: string) => {
  return navigateTo(localePath(`/docs/${slug}`))
}
</script>