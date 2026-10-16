<template>
  <div>
    <DocsSearchHeader
      v-model:search="searchInput"
      v-model:search-mode="searchMode"
      v-model:view-mode="viewMode"
      :is-desktop="isDesktop"
      @toggle-filter="isFilterVisible = !isFilterVisible"
    />

    <DocsTagFilter
      v-show="isFilterVisible"
      :tags="filters.tags"
      @toggle-tag="handleToggleTag"
    />

    <Skeleton v-if="!docs" />

    <DocsList
      v-else-if="(docs?.total || 0) > 0"
      :docs="docs?.data || []"
      :view-mode="filters.viewMode"
      :tags="filters.tags"
      @toggle-tag="handleToggleTag"
    />

    <!-- 空状态 -->
    <div v-else class="text-center py-12 px-4">
      <div class="text-gray-400 text-6xl mb-4">📭</div>
      <h3 class="text-gray-500 text-lg mb-2">{{ t("docs.noDocuments") }}</h3>
      <p class="text-gray-400 text-sm mb-4">
        {{ emptyStateMessage }}
      </p>
      <Button class="cursor-pointer" @click="resetFilters">
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
          v-model="limit"
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
import { useLocalStorage, useEventListener, watchDebounced } from "@vueuse/core";
import { useDocs } from "~/composables/useDocs";
import { toggleTag } from "~/composables/useTagsFilter";

// ---------- 响应式工具 ----------
const { isDesktop, isMobile } = useResponsive();
const { t } = useI18n();

// ---------- 筛选状态 + 数据 ----------
// 列表页是 useDocs 的唯一调用点：筛选状态由 URL 承载，数据请求与缓存 key 都在这里；
// 子组件通过 props / 事件参与，不再各自去取一份隐式共享状态。
const { docs, filters, filterModel, setFilters, resetFilters } = useDocs();

/** 各筛选参数的可写模型：模板继续用 v-model，写入统一经过 setFilters */
const page = filterModel("page");
const limit = filterModel("limit");
const searchMode = filterModel("searchMode");
const viewMode = filterModel("viewMode");

const sizeOptions = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "50", value: 50 },
];

// ---------- UI 状态：筛选面板可见性（持久化）----------
const isFilterVisible = useLocalStorage("isFilterVisible", false);

// ---------- 搜索输入 ----------
// 输入框绑本地状态：防抖 500ms 后才写进 URL（也就才触发请求）。
// 反向同步只用于"前进/后退把 URL 改回来"时回填输入框；
// 由于 setFilters 在值没变时不导航，这个回填不会反过来覆盖历史状态。
const searchInput = ref(filters.value.search);
watch(() => filters.value.search, (value) => {
  if (value !== searchInput.value) searchInput.value = value;
});
watchDebounced(searchInput, (value) => {
  void setFilters({ search: value });
}, { debounce: 500 });

// ---------- 标签筛选 ----------
// 具体应该是哪组标签由纯函数决定，写入只有 setFilters 一个入口
const handleToggleTag = (tag: string, additive: boolean) => {
  void setFilters({ tags: toggleTag(filters.value.tags, tag, additive) });
};

// 空状态提示
const emptyStateMessage = computed(() => {
  const hasSearch = filters.value.search.trim().length > 0;
  const hasTags = filters.value.tags.length > 0;

  if (hasSearch || hasTags) {
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
  title: "文档 | Docs",
  description:
    "探索 Moongate 的所有技术文档，涵盖 Nuxt、Vue、数据库等前沿技术。",
  ogTitle: "Moongate 文档库",
  ogDescription: "免费学习最新的 Web 开发技术，从入门到实践。",
});
</script>
