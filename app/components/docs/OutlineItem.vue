<template>
  <li :style="{ paddingLeft: `${(item.depth - 2) * 1}rem` }">
    <NuxtLink
      :href="`#${item.id}`"
      class="nav-link block py-1"
      :class="{ active: isActive }"
      rel="noopener noreferrer"
      @click="$emit('close')"
    >
      {{ item.text }}
    </NuxtLink>

    <!-- 递归渲染子级 -->
    <ul v-if="item.children?.length" class="space-y-0">
      <OutlineItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        @close="$emit('close')"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();

const props = defineProps<{
  item: {
    id: string
    text: string
    depth: number
    children?: any[]
  }
}>()

defineEmits<{
  close: []
}>()

const isActive = computed(() => {
  return route.hash === `#${props.item.id}`
})
</script>