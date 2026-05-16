<template>
  <nav class="p-4 leading-loose">
    <OutlineItem
      v-for="item in outline"
      :key="item.id"
      :item="item"
      @close="isOutlineVisible = false"
    />
  </nav>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import OutlineItem from "./OutlineItem.vue";

defineProps<{
  outline: object[]
}>()

// 持久化抽屉可见性（避免水合错误）
const isOutlineVisible = useLocalStorage("isOutlineVisible", false);
</script>