<template>
  <div>
    <DocsSearchHeader
      v-model:search="searchInputDebounced"
      v-model:option="searchOption"
      v-model:view-mode="viewMode"
      :is-desktop="isDesktop"
      @toggle-filter="isFilterVisible = !isFilterVisible"
    />

    <DocsNavigationLevel :level="level" />

    <DocsTagFilter v-show="isFilterVisible" />

    <Skeleton v-if="pending && !docsList?.list.length" />

    <DocsList
      v-else-if="docsList?.list.length"
      :docs="docsList.list"
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
        :total-pages="totalPages"
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
          {{ t("docs.findCount", { count: docsList?.total || 0 }) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Button, Pagination, Select, Skeleton } from "moongate-vue";
import {
  useLocalStorage,
  watchDebounced,
  useEventListener,
} from "@vueuse/core";

// ---------- 响应式工具 ----------
const { isDesktop, isMobile } = useResponsive();
const { t } = useI18n();

// 使用全局单例
const {
  docsList,
  searchInput,
  searchOption,
  viewMode,
  page,
  size,
  level,
  tags,
  pending,
  resetFilters,
} = useDocs();

const sizeOptions = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "15", value: 15 },
  { label: "20", value: 20 },
];

// ---------- UI 状态：筛选面板可见性（持久化）----------
const isFilterVisible = useLocalStorage("isFilterVisible", false);

// 防抖搜索
const searchInputDebounced = ref(searchInput.value);

watchDebounced(
  searchInputDebounced,
  (val) => {
    searchInput.value = val;
    page.value = 1;
  },
  { debounce: 500 },
);

watch(searchInput, (val) => {
  searchInputDebounced.value = val;
});

// 空状态提示
const emptyStateMessage = computed(() => {
  const hasSearch = searchInput.value;
  const hasLevel = level.value;
  const hasTags = tags.value.length;

  if (hasSearch || hasLevel || hasTags) {
    return t("docs.emptyMessage");
  }
  return "还没有文档，请稍后再来";
});

// 计算总页数（响应式）
const totalPages = computed(() => {
  const total = docsList.value?.total ?? 0;
  const currentSize = size.value ?? 10;
  return Math.ceil(total / currentSize);
});

const isInputFocused = computed(() => {
  const active = document.activeElement;
  return active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";
});

// 优化键盘左右翻页事件
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
    // 增加上限：不能超过总页数
    if (page.value < totalPages.value) page.value += 1;
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
