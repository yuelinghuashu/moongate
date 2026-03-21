<template>
  <div>
    <DocsSearchHeader
      v-model:search="searchInput"
      v-model:option="searchOption"
      v-model:view-mode="viewMode"
      :is-desktop="isDesktop"
      @toggle-filter="isFilterVisible = !isFilterVisible"
    />

    <DocsNavigationLevel :level="level" />

    <DocsTagFilter
      v-show="isFilterVisible"
      :get-tag-link="getTagLink"
      :is-tag-selected="isTagSelected"
      @tag-click="handleTagClick"
    />

    <DocsList
      v-if="docsList.length"
      :docs="docsList"
      :view-mode="viewMode"
      :tags="tags"
      :get-tag-link="getTagLink"
      :is-tag-selected="isTagSelected"
      @tag-click="handleTagClick"
    />
    <div v-else class="text-center py-12 px-4">
      <div class="text-gray-400 text-6xl mb-4">📭</div>
      <h3 class="text-gray-500 text-lg mb-2">暂无文档</h3>
      <p class="text-gray-400 text-sm mb-4">
        {{ emptyStateMessage }}
      </p>
      <UButton
        size="sm"
        variant="solid"
        class="cursor-pointer"
        @click="clearAllFilters"
      >
        清除所有筛选
      </UButton>
    </div>

    <DocsPaginationBar
      v-if="isDesktop && docsList.length"
      v-model:page="page"
      v-model:size="size"
      :total="docsData?.total"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  useLocalStorage,
  useEventListener,
  useScroll,
  watchDebounced,
} from "@vueuse/core";
import { useSwipe } from "~/composables/useSwipe";

// ---------- 响应式工具 ----------
const { isMobile, isDesktop } = useResponsive();

const route = useRoute();
const router = useRouter();
const { y } = useScroll(window); // 滚动距离（用于检测底部/顶部）

// ---------- 状态定义（全部从 URL 初始化，保证 SSR 一致）----------
const searchInput = ref(route.query.search?.toString() || ""); // 搜索关键词
const searchOption = ref(Number(route.query.option) || 1); // 搜索范围：1=标题+描述，2=仅标题
const page = ref(Number(route.query.page) || 1); // 当前页码
const size = ref(Number(route.query.size) || 10); // 每页条数
const viewMode = ref(Number(route.query.viewMode) || 1); // 显示模式：1=详细，2=简洁
const level = ref(route.query.level?.toString() || ""); // 等级筛选（空字符串表示无筛选）
const tags = ref<string[]>([]); // 标签筛选数组

// ---------- 标签解析：从 URL 中读取 tag 参数（支持逗号分隔）----------
const parseTagsFromQuery = () => {
  const tagParam = route.query.tag;
  tags.value = tagParam
    ? Array.isArray(tagParam)
      ? tagParam
      : tagParam.split(",")
    : [];
};
parseTagsFromQuery();

// ---------- 监听路由变化（用户点击后退/前进时同步状态）----------
watch(
  () => route.query,
  (newValue) => {
    searchInput.value = newValue.search?.toString() || "";
    searchOption.value = Number(newValue.option) || 1;
    page.value = Number(newValue.page) || 1;
    size.value = Number(newValue.size) || 10;
    viewMode.value = Number(newValue.viewMode) || 1;
    level.value = newValue.level?.toString() || "";
    parseTagsFromQuery();
  },
  { immediate: true }, // 立即执行一次，确保组件初始化时状态正确
);

// ---------- 标签辅助函数 ----------
// 判断某个标签是否已被选中
const isTagSelected = (tag: string) => tags.value.includes(tag);

// 生成标签链接对象（用于 NuxtLink）
const getTagLink = (tag: string) => {
  const newTags = isTagSelected(tag)
    ? tags.value.filter((t) => t !== tag) // 已选中则移除
    : [...tags.value, tag]; // 未选中则添加

  const query = { ...route.query };
  if (newTags.length) {
    query.tag = newTags.join(",");
  } else {
    delete query.tag;
  }
  // 切换标签时重置页码
  if (query.page) query.page = "1";
  return { query };
};

// 标签单选/多选事件
const handleTagClick = (tag: string, event: MouseEvent) => {
  // 桌面端：按住 Ctrl/Cmd 时多选
  const isMulti = event.ctrlKey || event.metaKey;
  let newTags: string[];

  if (isMulti) {
    // 多选：切换（有则移除，无则添加）
    newTags = tags.value.includes(tag)
      ? tags.value.filter((t) => t !== tag)
      : [...tags.value, tag];
  } else {
    // 单选：如果已选中则清空，否则只保留当前标签
    if (tags.value.includes(tag)) {
      newTags = []; // 取消选中
    } else {
      newTags = [tag];
    }
  }

  const query = { ...route.query };
  if (newTags.length) {
    query.tag = newTags.join(",");
  } else {
    delete query.tag;
  }
  // 重置页码
  query.page = "1";

  router.push({ query });
};

// ---------- 推路由：将当前状态同步到 URL ----------
function pushQuery() {
  const query: Record<string, string> = {};
  if (searchInput.value) query.search = searchInput.value;
  if (searchOption.value !== 1) query.option = String(searchOption.value);
  if (page.value !== 1) query.page = String(page.value);
  if (size.value !== 5) query.size = String(size.value);
  if (viewMode.value !== 1) query.viewMode = String(viewMode.value);
  if (level.value) query.level = level.value; // 只有非空时才添加
  if (tags.value.length) query.tag = tags.value.join(",");

  // 避免无意义的重复跳转（例如连续两次相同状态）
  if (JSON.stringify(route.query) !== JSON.stringify(query)) {
    router.push({ query });
  }
}

// ---------- 监听状态变化，自动更新 URL ----------
watch([page, size, viewMode, level, tags], () => pushQuery()); // 分页、显示模式、等级、标签变化立即更新
watchDebounced(
  searchInput,
  () => {
    // 搜索输入防抖更新
    page.value = 1;
    pushQuery();
  },
  { debounce: 500 },
);
watch(searchOption, () => pushQuery()); // 搜索范围变化立即更新

// ---------- 数据获取（自动响应所有筛选状态）----------
const { data: docsData, pending } = await useAsyncData(
  "docs-list",
  async () => {
    let query = queryCollection("docs").order("date", "DESC");
    const keyword = searchInput.value.trim();

    // 搜索条件
    if (keyword) {
      if (searchOption.value === 1) {
        query = query.orWhere((q) =>
          q
            .where("title", "LIKE", `%${keyword}%`)
            .where("description", "LIKE", `%${keyword}%`),
        );
      } else {
        query = query.where("title", "LIKE", `%${keyword}%`);
      }
    }

    // 等级过滤（仅当 level 有值）
    if (level.value) {
      query = query.where("level", "=", level.value);
    }

    // 标签过滤（AND 关系）
    if (tags.value.length) {
      query = query.andWhere((q) => {
        tags.value.forEach((tag) => {
          q = q.where("tags", "LIKE", `%${tag}%`);
        });
        return q;
      });
    }

    // 分页
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
    watch: [searchInput, searchOption, page, size, viewMode, level, tags],
  },
);

// ---------- 移动端累积列表（用于无限滚动，水合阶段不会触发）----------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const docsList = ref<any[]>([]);
watch(
  () => docsData.value?.list,
  (newList) => {
    if (!newList) return;
    // 仅当移动端且 page > 1 时才合并（水合时 page=1，不会进入）
    if (isMobile.value && page.value > 1) {
      const merged = [...docsList.value, ...newList];
      const uniqueMap = new Map(merged.map((item) => [item.id, item]));
      docsList.value = Array.from(uniqueMap.values());
    } else {
      docsList.value = newList;
    }
  },
  { immediate: true },
);

// ---------- 滚动检测（用于移动端无限滚动）----------
const isNearBottom = computed(() => {
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  return scrollHeight - y.value - viewportHeight < 200;
});
const isNearTop = computed(() => y.value < 200);

// 分页辅助
const totalPages = computed(() => {
  if (!docsData.value?.total) return 0;
  return Math.ceil(docsData.value.total / size.value);
});
const hasPrevPage = computed(() => page.value > 1);
const hasNextPage = computed(() => page.value < totalPages.value);

// 加载更多（上滑触发）
const loadMoreDocs = () => {
  if (
    pending.value ||
    !isNearBottom.value ||
    !isMobile.value ||
    !hasNextPage.value
  )
    return;
  page.value += 1;
};

// 下拉刷新（下滑回到第一页）
const refreshDocs = () => {
  if (isMobile.value && !pending.value && isNearTop.value) page.value = 1;
};

// 监听滑动事件
useSwipe({ onUp: loadMoreDocs, onDown: refreshDocs }, { threshold: 60 });

// ---------- 键盘事件：左右翻页、ESC 失焦 ----------
const isInputFocused = computed(() => {
  const active = document.activeElement;
  return active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";
});

useEventListener("keydown", (e) => {
  if (e.key === "Escape" && isInputFocused.value) {
    (document.activeElement as HTMLElement)?.blur();
    return;
  }
  if (isInputFocused.value && isMobile.value) return;

  if (e.key === "ArrowLeft" && hasPrevPage.value) {
    e.preventDefault();
    page.value -= 1;
  } else if (e.key === "ArrowRight" && hasNextPage.value) {
    e.preventDefault();
    page.value += 1;
  }
});

// ---------- UI 状态：筛选面板可见性（持久化，不影响初始 DOM）----------
const isFilterVisible = useLocalStorage("isFilterVisible", false);

// ---------- 空状态提示 ----------
const emptyStateMessage = computed(() => {
  const hasSearch = searchInput.value;
  const hasLevel = level.value;
  const hasTags = tags.value.length;

  if (hasSearch || hasLevel || hasTags) {
    return "没有找到符合条件的文档，试试调整筛选条件吧";
  }
  return "还没有文档，请稍后再来";
});

// ---------- 清除所有筛选 ----------
const clearAllFilters = () => {
  searchInput.value = "";
  level.value = "";
  tags.value = [];
  page.value = 1;
  size.value = 10;
  viewMode.value = 1;
};

// ---------- SEO 元信息 ----------
useSeoMeta({
  title: "所有文档 | ALL DOCS",
  description:
    "探索 Moongate 的所有技术文档，涵盖 Nuxt、Vue、数据库等前沿技术。",
  ogTitle: "Moongate 文档库",
  ogDescription: "免费学习最新的 Web 开发技术，从入门到实践。",
});
</script>
