<template>
  <div>
    <form class="flex items-center justify-between search">
      <!-- 搜索区 -->
      <UInput
        v-model="searchInput"
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

      <!-- 文档搜索选项 -->
      <div class="flex justify-between" :class="isDesktop ? 'ml-2' : ''">
        <USelect
          v-model="searchOption"
          :items="tm('search.option')"
          label-key="name"
          value-key="id"
          size="lg"
          :placeholder="t('search.optionPlaceholder')"
          class="flex-1"
        />

        <USelect
          v-model="viewMode"
          :items="tm('search.viewMode')"
          label-key="name"
          value-key="id"
          size="lg"
          :placeholder="t('search.viewModePlaceholder')"
          class="ml-2"
        />
      </div>
    </form>

    <!-- 文档总览组件 -->
    <div class="mt-4 mb-8 grid grid-cols-2 grid-rows-2 gap-2 docs-grid">
      <UBlogPost
        v-for="(item, index) in docsList"
        :key="item.id"
        :ui="{
          body: 'sm:p-4',
          description: 'line-clamp-2',
          title: viewMode === 1 ? '' : 'line-clamp-1',
        }"
        :title="item.title"
        :description="viewMode === 1 ? item.description : ''"
        :date="item.date"
        :to="localePath(item.path)"
        class="card"
        :class="
          docsList.length % 2 !== 0 &&
          index === docsList.length - 1 &&
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
        :total="docsData?.total"
        :items-per-page="size"
      />

      <USelect
        v-model="size"
        :items="sizeOptions"
        class="ml-4"
        @update:model-value="page = 1"
      />

      <span class="ml-4">
        {{ t("search.findCount", { count: docsData?.total }) }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useEventListener, useScroll, watchDebounced } from "@vueuse/core";
import { useSwipe } from "~/composables/useSwipe";
const { isMobile, isDesktop } = useResponsive();
const { t } = useI18n();
const { tm } = useI18nSafe();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const { y } = useScroll(window);

// 从 URL 初始化
const searchInput = ref(route.query.search?.toString() || "");
const searchOption = ref(Number(route.query.option) || 1);
const page = ref(Number(route.query.page) || 1);
const size = ref(Number(route.query.size) || 10);
const sizeOptions = [5, 10, 15, 20] as const;
const viewMode = ref(Number(route.query.viewMode) || 1);

// 监听路由变化（后退/前进）
watch(
  () => route.query,
  (newValue) => {
    searchInput.value = newValue.search?.toString() || "";
    searchOption.value = Number(newValue.option) || 1;
    page.value = Number(newValue.page) || 1;
    size.value = Number(newValue.size) || 10;
    viewMode.value = Number(newValue.viewMode) || 1;
  },
  { immediate: true },
);

// 工具函数：推路由（带相等性检查）
function pushQuery() {
  const query: Record<string, string> = {};
  if (searchInput.value) query.search = searchInput.value;
  if (searchOption.value !== 1) query.option = String(searchOption.value);
  if (page.value !== 1) query.page = String(page.value);
  if (size.value !== 5) query.size = String(size.value);
  if (viewMode.value !== 1) query.viewMode = String(viewMode.value);

  const current = route.query;
  if (
    query.search === (current.search?.toString() || "") &&
    (query.option || "1") === (current.option?.toString() || "1") &&
    (query.page || "1") === (current.page?.toString() || "1") &&
    (query.size || "5") === (current.size?.toString() || "5") &&
    (query.viewMode || "1") === (current.viewMode?.toString() || "1")
  )
    return;

  router.push({ query });
}

// 分页变化立即推路由
watch([page, size, viewMode], () => {
  pushQuery();
});

// 搜索防抖：输入停止 500ms 后推路由，并重置页码
watchDebounced(
  searchInput,
  () => {
    page.value = 1;
    pushQuery();
  },
  { debounce: 500 },
);

// 搜索选项变化立即推路由（不需要防抖）
watch(searchOption, () => {
  pushQuery();
});

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

// 是否接近顶部
const isNearTop = computed(() => {
  // 当滚动距离顶部小于 200px 时，认为接近顶部
  return y.value < 200;
});

// ---------- 获取文档列表（自动刷新）----------
const { data: docsData, pending } = await useAsyncData(
  "docs-list",
  async () => {
    const keyword = searchInput.value.trim();
    // 1. 构建基础查询
    let query = queryCollection("docs").order("date", "DESC");

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

// ---------- 累积文档列表（用于移动端无限滚动）----------
const docsList = ref<[]>([]);

// 当数据更新时，根据当前模式（桌面/移动）处理列表
// 注意：当 URL 中 page > 1 时，刷新后直接显示对应页，这是符合预期的（URL 驱动状态）
watch(
  () => docsData.value?.list,
  (newList) => {
    if (!newList) return; // 数据未加载时不处理

    if (isMobile.value && page.value > 1) {
      // 移动端加载更多：合并并去重
      const merged = [...docsList.value, ...newList];
      // 使用 Map 以 id 为键去重（假设每个文档有唯一 id）
      const uniqueMap = new Map(merged.map((item) => [item.id, item]));
      docsList.value = Array.from(uniqueMap.values());
    } else {
      // 桌面端翻页或移动端第一页：直接替换（搜索时 page 会被重置为 1，因此自动清空累积）
      docsList.value = newList;
    }
  },
  { immediate: true }, // 立即执行一次，确保初始值
);

// ---------- 分页辅助计算 ----------
// 计算总页数
const totalPages = computed(() => {
  if (!docsData.value?.total) return 0;
  return Math.ceil(docsData.value.total / size.value);
});

// 检查是否有上一页/下一页
const hasPrevPage = computed(() => page.value > 1);
const hasNextPage = computed(() => page.value < totalPages.value);

// ---------- 移动端无限滚动 ----------
const loadMoredocs = () => {
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

const refreshDocs = () => {
  if (isMobile.value && !pending.value && isNearTop.value) page.value = 1;
};

// 监听滑动事件
useSwipe(
  {
    onUp: () => loadMoredocs(),
    onDown: () => refreshDocs(),
  },
  { threshold: 60 },
);

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

// 设置 SEO 元信息

useSeoMeta({
  title: "所有文档 | Moongate",
  description:
    "探索 Moongate 的所有技术文档，涵盖 Nuxt、Vue、数据库等前沿技术。",
  ogTitle: "Moongate 文档库",
  ogDescription: "免费学习最新的 Web 开发技术，从入门到实践。",
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

  .docs-grid {
    grid-template-columns: none;
  }
}
</style>
