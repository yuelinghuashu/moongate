<template>
  <!-- 仅当当前文档属于某系列时渲染系列导航 -->
  <div v-if="nav.hasSeries && nav.items.length" class="mg-series-nav-wrapper">
    <SeriesNav
      :title="nav.title"
      :items="nav.items"
      :active="nav.active"
      :numbered="true"
      :visible-count="visibleCount"
    />
  </div>
</template>

<script setup lang="ts">
import { SeriesNav } from "moongate-vue";
import { useSeriesNav } from "~/composables/useSeriesNav";

interface Props {
  /** 当前文档所属系列 slug（可为空） */
  series?: string | null;
  /** 当前文档 slug */
  active: string;
  /** 折叠阈值：超过则折叠为单一 "N more parts..."（默认 6） */
  visibleCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  series: null,
  visibleCount: 6,
});

// 传入响应式 ref 以复用缓存；当前文档系列变化时自动重算
const seriesRef = computed(() => props.series || null);
const activeRef = computed(() => props.active);

const nav = useSeriesNav(seriesRef, activeRef);
</script>

<style scoped>
/* 系列导航卡片容器：与 dev.to Series box 观感一致的浅色卡片 */
.mg-series-nav-wrapper {
  margin: var(--ui-spacing-lg, 16px) 0;
  border: 1px solid var(--ui-border, #2d3748);
  border-radius: var(--ui-radius-sm, 2px);
  /* 使用库暴露的 background token（颜色随主题切换） */
  background-color: var(--ui-bg-elevated);
  overflow: hidden;
}
</style>
