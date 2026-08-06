<template>
    <div>
      <DocsSearchHeader
        v-model:search="searchInputDebounced"
        v-model:search-mode="searchMode"
        v-model:view-mode="viewMode"
        :is-desktop="isDesktop"
        @toggle-filter="isFilterVisible = !isFilterVisible"
      />

      <DocsNavigationLevel :level="level" />

      <DocsTagFilter v-show="isFilterVisible" />

      <Skeleton v-if="!docs" />

      <DocsList
        v-else-if="(docs?.total || 0) > 0"
        :docs="docs?.data || []"
        :view-mode="viewMode"
        :level="level"
      />

      <!-- 空状态 -->
      <div v-else class="text-center py-12 px-4">
        <div class="text-gray-400 text-6xl mb-4">📭</div>
        <h3 class="text-gray-500 text-lg mb-2">{{ t("docs.noDocuments") }}</h3>
        <p class="text-gray-400 text-sm mb-4">
          {{ emptyStateMessage }}
        </p>
        <Button size="sm" class="cursor-pointer" @click="resetFilters">
          {{ t("docs.clearAllFilters") }}
        </Button>
      </div>

      <div
        class="flex flex-col md:flex-row items-center justify-center md:justify-between mt-6"
      >
        <!-- 分页组件 -->
        <Pagination
          v-model="page"
          :total-pages="docs?.totalPages || 0"
          :size="isDesktop ? 'md' : 'sm'"
          :prev-text="t('docs.pagination.prev')"
          :next-text="t('docs.pagination.next')"
        />

        <!-- 右侧控制区：每页条数 + 计数 -->
        <div class="flex items-center" :class="{ 'mt-2': isMobile }">
          <span class="text-sm">{{ t("docs.perPage") }}</span>
          <Select
            v-model="size"
            :options="sizeOptions"
            :size="isDesktop ? 'md' : 'sm'"
            class="px-2 min-w-10 max-w-20"
          />
          <span class="text-sm">{{ t("docs.unit") }}</span>

          <span class="text-sm whitespace-nowrap ml-8">
            {{ t("docs.findCount", { count: docs?.total || 0 }) }}
          </span>
        </div>
      </div>
    </div>
</template>

<script lang="ts" setup>
import { Button, Pagination, Select, Skeleton } from "moongate-vue";
import { useLocalStorage, useEventListener } from "@vueuse/core";

// ---------- 响应式工具 ----------
const { isDesktop, isMobile } = useResponsive();
const { t } = useI18n();

const {
  docs,
  searchInput,
  searchMode,
  viewMode,
  page,
  size,
  level,
  tags,
  resetFilters,
} = useDocs();


const sizeOptions = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "50", value: 50 },
];

// ---------- UI 状态：筛选面板可见性（持久化）----------
const isFilterVisible = useLocalStorage("isFilterVisible", false);

// 防抖搜索（复用 useDebouncedSearch composable）
const { searchInputDebounced } = useDebouncedSearch(searchInput, page, 500);

// 空状态提示
const emptyStateMessage = computed(() => {
  const hasSearch = searchInput.value?.trim() ?? false;
  const hasLevel = level.value ?? false;
  const hasTags = (tags.value?.length ?? 0) > 0;

  if (hasSearch || hasLevel || hasTags) {
    return t("docs.emptyMessage");
  }
  return t("docs.emptyState");
});

// 判断当前是否聚焦在输入框
const isInputFocused = computed(() => {
  const active = document.activeElement;
  return active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";
});

// 键盘事件
useEventListener("keydown", (e) => {
  if (e.key === "Escape" && isInputFocused.value) {
    (document.activeElement as HTMLElement)?.blur();
    return;
  }
  if (isInputFocused.value && isMobile.value) return;

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (page.value > 1) page.value -= 1;
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    if (page.value < (docs.value?.totalPages || 0)) page.value += 1;
  }
});

// ---------- SEO 元信息 ----------
useSeoMeta({
  title: "所有文档 | ALL DOCS",
  description:
    "探索 Moongate 的所有技术文档，涵盖 Nuxt、Vue、数据库等前沿技术。",
  ogTitle: "Moongate 文档库",
  ogDescription: "免费学习最新的 Web 开发技术，从入门到实践。",
});
</script>