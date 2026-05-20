<template>
  <div class="flex flex-col gap-4">
    <Card
      v-for="item in docs"
      :key="item.id"
      as="li"
      hoverable
      :hide-body="viewMode === 1 ? false : true"
      class="cursor-pointer"
      @click="navigateTo(localePath(item.path))"
    >
      <template #header>
        <div class="flex justify-between items-start">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-medium">{{ item.title }}</h2>
            <div class="flex flex-wrap gap-1">
              <em
                v-for="tag in item.tags"
                :key="tag"
                class="inline-block nav-link text-sm"
                :class="{ active: isTagSelected(tag) }"
                @click="handleTagClick(tag, $event)"
                >#{{ tag }}</em
              >
            </div>
          </div>

          <div :class="['flex items-center gap-2', { 'flex-col': isMobile }]">
            <Badge v-if="level !== item.level" :label="item.level" />
            <time :datetime="item.date" class="text-xs text-ui-text-muted">
              {{ dayjs(item.date).format("YYYY-MM-DD") }}
            </time>
          </div>
        </div>
      </template>
      <template #default>
        <p class="truncate">{{ item.description }}</p>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { Card, Badge } from "moongate-vue";
import { useDocs } from "~/composables/useDocs";
import { useTagsFilter } from "~/composables/useTagsFilter";
import dayjs from "dayjs";

const localePath = useLocalePath();
const { isMobile } = useResponsive();

// 从全局单例获取 tags 和 level，以及筛选方法
const { tags, level, viewMode } = useDocs();
const { isTagSelected, handleTagClick } = useTagsFilter(tags);

const props = defineProps<{
  docs: any[];
  viewMode: number;
}>();
</script>
