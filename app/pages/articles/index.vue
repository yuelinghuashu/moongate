<template>
  <div>
    <form class="flex items-center justify-between search">
      <!-- 搜索区 -->
      <UInput
        v-model="searchInput"
        icon="lucide-search"
        :placeholder="t('search.inputPlaceholder')"
        size="lg"
        class="w-full"
      >
        <template v-if="searchInput?.length" #trailing>
          <UButton
            color="neutral"
            variant="ghost"
            icon="lucide-circle-x"
            aria-label="Clear input"
            @click="searchInput = ''"
          />
        </template>
      </UInput>

      <!-- 文章搜索选项 -->
      <USelect
        v-model="searchInput"
        :items="tm('search.option')"
        :label-key="isDev ? 'name.loc.source' : 'name'"
        value-key="id"
        size="lg"
        :placeholder="t('search.optionPlaceholder')"
        class="ml-2 min-w-60"
      />
    </form>

    <!-- 文章总览组件 -->
    <div class="mt-4 mb-8 grid grid-cols-2 grid-rows-2 gap-2 articles-grid">
      <UBlogPost
        v-for="(item, index) in articleList"
        :key="item.id"
        :ui="{ body: 'sm:p-4', description: 'line-clamp-2' }"
        :title="item.title"
        :description="item.description"
        :date="item.date"
        :to="localePath(item.path)"
        class="card"
        :class="
          articleList.length % 2 !== 0 &&
          index === articleList.length - 1 &&
          isDesktop
            ? 'col-span-2'
            : ''
        "
      />
    </div>

    <!-- 分页组件 -->
    <div v-if="isDesktop" class="flex justify-center items-center">
      <UPagination
        v-model:page="page"
        :total="articleData?.total"
        :items-per-page="size"
      />

      <USelect
        v-model="size"
        :items="sizeOptions"
        class="ml-4"
        @update:model-value="page = 1"
      />

      <span class="ml-4">
        {{ t("search.findCount", { count: articleData?.total }) }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useEventListener, useScroll, watchDebounced } from "@vueuse/core";
import { useSwipeUp } from "~/composables/useSwipeUp";
import useUrlQueryStore from "~/stores/urlQuery";
const urlQueryStore = useUrlQueryStore();
const { isMobile, isDesktop } = useResponsive();
const { tm, t } = useI18n();
const localePath = useLocalePath();
const { y } = useScroll(window);
const isDev = import.meta.env.DEV;

// 输入框实时值（独立于 store，用于防抖）
const searchInput = ref(urlQueryStore.search);

// 搜索选项（直接双向绑定到 store）
const searchOption = computed({
  get: () => urlQueryStore.option,
  set: (val) => {
    urlQueryStore.option = val;
  },
});

// 分页直接使用 store 的计算属性（可写）
const page = computed({
  get: () => urlQueryStore.page,
  set: (val) => {
    urlQueryStore.page = val;
  },
});
const size = computed({
  get: () => urlQueryStore.size,
  set: (val) => {
    urlQueryStore.size = val;
  },
});

const sizeOptions = [5, 10, 15, 20] as number[];

console.log("searchInput", searchInput.value);
console.log("searchOption", searchOption.value);
console.log("page", page.value);
console.log("size", size.value);

// 防抖：输入停止 500ms 后更新 store 的 search 并重置页码
watchDebounced(
  searchInput,
  (val) => {
    urlQueryStore.search = val;
    urlQueryStore.page = 1; // ⚠️ 重置页码，必须保留
  },
  { debounce: 500 },
);

// 反向同步：当 store 的 search 被外部改变（如后退按钮）时，更新输入框
watch(
  () => urlQueryStore.search,
  (val) => {
    searchInput.value = val;
  },
  { immediate: true },
);

// ---------- 判断输入框焦点（用于键盘事件）----------
const isInputFocused = computed(() => {
  const activeElement = document.activeElement?.tagName;
  return activeElement === "INPUT" || activeElement === "TEXTAREA";
});

// ---------- 滚动检测（用于移动端无限滚动）----------
const isNearBottom = computed(() => {
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  // 当滚动到距离页面底部 200 像素以内时，认为接近底部
  return scrollHeight - y.value - viewportHeight < 200;
});

// ---------- 获取文章列表（自动刷新）----------
const { data: articleData, pending } = await useAsyncData(
  "article-list",
  async () => {
    const keyword = searchInput.value.trim();
    // 1. 构建基础查询
    let query = queryCollection("articles").order("date", "DESC");

    // 2. 增加搜索条件(搜索标题/描述)
    // settings.search.option === 1 搜索标题和描述
    // settings.search.option === 2 仅搜索标题
    if (keyword !== "") {
      if (searchOption.value === 1) {
        // 搜索标题和描述
        query = query.orWhere((q) =>
          q
            .where("title", "LIKE", `%${keyword}%`)
            .where("description", "LIKE", `%${keyword}%`),
        );
      } else {
        // 仅搜索标题
        query = query.where("title", "LIKE", `%${keyword}%`);
      }
    }

    // 3. 获取总数和列表
    const [total, list] = await Promise.all([
      query.count(),
      query
        .skip((page.value - 1) * size.value)
        .limit(size.value)
        .all(),
    ]);
    console.log("articleData", list);

    return { total, list };
  },
  {
    watch: [
      () => searchInput.value, // 监听搜索词
      () => searchOption.value, // 监听搜索选项
      () => page.value, // 监听页码
      () => size.value, // 监听每页条数
    ],
  },
);

// ---------- 累积文章列表（用于移动端无限滚动）----------
const articleList = ref<[]>([]);

// 当数据更新时，根据当前模式（桌面/移动）处理列表
// 注意：当 URL 中 page > 1 时，刷新后直接显示对应页，这是符合预期的（URL 驱动状态）
watch(
  () => articleData.value?.list,
  (newList) => {
    if (!newList) return; // 数据未加载时不处理

    if (isMobile.value && page.value > 1) {
      // 移动端加载更多：合并并去重
      const merged = [...articleList.value, ...newList];
      // 使用 Map 以 id 为键去重（假设每个文章有唯一 id）
      const uniqueMap = new Map(merged.map((item) => [item.id, item]));
      articleList.value = Array.from(uniqueMap.values());
    } else {
      // 桌面端翻页或移动端第一页：直接替换（搜索时 page 会被重置为 1，因此自动清空累积）
      articleList.value = newList;
    }
  },
  { immediate: true }, // 立即执行一次，确保初始值
);

// ---------- 分页辅助计算 ----------
// 计算总页数
const totalPages = computed(() => {
  if (!articleData.value?.total) return 0;
  return Math.ceil(articleData.value.total / size.value);
});

// 检查是否有上一页/下一页
const hasPrevPage = computed(() => page.value > 1);
const hasNextPage = computed(() => page.value < totalPages.value);

// ---------- 移动端无限滚动 ----------
const loadMoreArticles = () => {
  // 增加条件：不在加载中、接近底部、是移动端、还有下一页
  if (
    pending.value ||
    !isNearBottom.value ||
    !isMobile.value ||
    !hasNextPage.value
  )
    return;

  page.value += 1;
};

// 监听滑动事件
useSwipeUp(loadMoreArticles, { threshold: 60 }); // 阈值可调

// ---------- 键盘事件：左右翻页 + ESC 失焦 ----------
useEventListener("keydown", (e) => {
  // ESC 键：如果当前聚焦在输入框，则取消聚焦
  if (e.key === "Escape" && isInputFocused.value) {
    (document.activeElement as HTMLElement)?.blur();
    return;
  }

  // 如果聚焦在输入框，不处理翻页
  if (isInputFocused.value && isMobile) return;

  // 左右方向键翻页
  if (e.key === "ArrowLeft" && hasPrevPage.value) {
    e.preventDefault();
    page.value -= 1; // 自动触发数据刷新
  } else if (e.key === "ArrowRight" && hasNextPage.value) {
    e.preventDefault();
    page.value += 1; // 自动触发数据刷新
  }
});
</script>

<style scoped>
@media (max-width: 768px) {
  :deep(.text-muted) {
    display: none;
  }
  .search {
    flex-direction: column;
  }
  .search > div {
    margin-bottom: 10px;
  }
  .search > * {
    width: 100%;
    margin-left: 0;
  }

  .articles-grid {
    grid-template-columns: none;
  }
}
</style>
