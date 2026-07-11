<!-- components/DocsOutline.vue -->
<template>
  <nav class="p-4 leading-loose">
    <ul class="space-y-0">
      <OutlineItem
        v-for="item in nestedOutline"
        :key="item.id"
        :item="item"
        @close="emit('close')"
      />
    </ul>
  </nav>
</template>

<script setup lang="ts">
import OutlineItem from "./OutlineItem.vue";

interface OutlineItem {
  id: string
  text: string
  depth: number
  children?: OutlineItem[]
}

const props = defineProps<{
  outline: OutlineItem[]
}>()

const emit = defineEmits<{
  close: []
}>()

// 直接使用传入的 outline（已经是嵌套结构）
const nestedOutline = computed(() => props.outline)
</script>