---
title: Nuxt 文章列表页实战：分页、搜索、无限滚动、键盘操作全搞定
description: 基于“URL 即状态”思想，利用 useRouteQuery 和 watchDebounced 等工具，实现一个功能完备、可直接复用的文章列表页，包含防抖搜索、无限滚动、键盘翻页等特性。
date: 2026-02-18
tags: [Nuxt, Vue, 实战, 分页, 无限滚动, 键盘操作]
---

# Nuxt 文章列表页实战：分页、搜索、无限滚动、键盘操作全搞定

## 前言

在上一篇文章 [《从分页状态同步路由，看 Nuxt 的数据流设计哲学》](nuxt-route-sync) 中，我们深入探讨了 **“URL 是唯一真实源”** 的核心思想，并用手写 watch 的方式演示了双向同步闭环。本文是它的实战篇，将基于相同的理念，利用 `@vueuse/router` 和 `@vueuse/core` 等现代工具，实现一个功能完备的文章列表页。它包含：

- **分页与搜索**（状态与 URL 自动同步）
- **搜索防抖**（避免历史记录刷屏）
- **移动端无限滚动**（下滑自动加载更多）
- **桌面端经典分页组件**
- **键盘翻页与 ESC 失焦**（提升操作效率）

最终代码可直接复制使用，你也可以根据项目需求灵活扩展。

---

## 完整组件代码

以下是一个完整的 `pages/articles.vue` 文件，集成了上述所有功能。

```vue
<template>
  <div>
    <!-- 搜索区：阻止表单默认提交 -->
    <form class="flex items-center justify-between search" @submit.prevent>
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

      <!-- 搜索选项（标题/全文） -->
      <USelect
        v-model="searchOption"
        :items="tm('search.option')"
        :label-key="isDev ? 'name.loc.source' : 'name'"
        value-key="id"
        size="lg"
        :placeholder="t('search.optionPlaceholder')"
        class="ml-2 min-w-60"
      />
    </form>

    <!-- 文章列表 -->
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

    <!-- 桌面端分页组件 -->
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
import { useRouteQuery } from "@vueuse/router";
import { useEventListener, useScroll, watchDebounced } from "@vueuse/core";
import { useSwipeUp } from "~/composables/useSwipeUp";

const { isMobile, isDesktop } = useResponsive();
const { tm, t } = useI18n();
const localePath = useLocalePath();
const { y } = useScroll(window);
const isDev = import.meta.env.DEV;

// ---------- 状态定义（自动同步到 URL）----------
const searchInput = ref(""); // 输入框实时值
const searchQuery = useRouteQuery<string>("search", ""); // URL 中的搜索词
const searchOption = useRouteQuery<number>("option", 1, { transform: Number });
const page = useRouteQuery("page", 1, { transform: Number });
const size = useRouteQuery("size", 5, { transform: Number });
const sizeOptions = [5, 10, 15, 20];

// ---------- 搜索防抖：输入停止 500ms 后更新 URL，并重置页码到第一页 ----------
watchDebounced(
  searchInput,
  (val) => {
    searchQuery.value = val;
    page.value = 1; // 新搜索从第一页开始
  },
  { debounce: 500 },
);

// URL 变化（后退/前进）时同步到输入框
watch(
  searchQuery,
  (val) => {
    searchInput.value = val;
  },
  { immediate: true },
);

// ---------- 判断输入框焦点（用于键盘事件）----------
const isInputFocused = computed(() => {
  const tag = document.activeElement?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA";
});

// ---------- 滚动检测（用于移动端无限滚动）----------
const isNearBottom = computed(() => {
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  return scrollHeight - y.value - viewportHeight < 200;
});

// ---------- 获取文章列表（自动刷新）----------
const {
  data: articleData,
  pending,
  refresh,
} = await useAsyncData(
  "article-list",
  async () => {
    const keyword = searchInput.value.trim();
    let query = queryCollection("articles").order("date", "DESC");

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
      () => searchInput.value, // 监听实时输入（立即刷新）
      () => searchOption.value,
      () => page.value,
      () => size.value,
    ],
  },
);

// ---------- 累积文章列表（用于移动端无限滚动）----------
const articleList = ref<[]>([]);

// 当数据更新时，根据当前模式（桌面/移动）处理列表
watch(
  () => articleData.value?.list,
  (newList) => {
    if (!newList) return;

    if (isMobile.value && page.value > 1) {
      // 移动端加载更多：合并并去重
      const merged = [...articleList.value, ...newList];
      const uniqueMap = new Map(merged.map((item) => [item.id, item]));
      articleList.value = Array.from(uniqueMap.values());
    } else {
      // 桌面端翻页或移动端第一页：直接替换（搜索时 page 会被重置为 1，因此自动清空累积）
      articleList.value = newList;
    }
  },
  { immediate: true },
);

// ---------- 分页辅助计算 ----------
const totalPages = computed(() => {
  if (!articleData.value?.total) return 0;
  return Math.ceil(articleData.value.total / size.value);
});
const hasPrevPage = computed(() => page.value > 1);
const hasNextPage = computed(() => page.value < totalPages.value);

// ---------- 移动端无限滚动 ----------
const loadMoreArticles = () => {
  if (
    pending.value ||
    !isNearBottom.value ||
    !isMobile.value ||
    !hasNextPage.value
  )
    return;
  page.value += 1;
};
useSwipeUp(loadMoreArticles, { threshold: 60 });

// ---------- 键盘事件：左右翻页 + ESC 失焦 ----------
useEventListener("keydown", (e) => {
  // ESC 键：如果当前聚焦在输入框，则取消聚焦
  if (e.key === "Escape" && isInputFocused.value) {
    (document.activeElement as HTMLElement)?.blur();
    return;
  }

  // 如果聚焦在输入框，不处理翻页
  if (isInputFocused.value) return;

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
```

---

## 代码逐段解析

### 1. 状态定义与 URL 同步

```ts
const searchInput = ref("");
const searchQuery = useRouteQuery<string>("search", "");
const searchOption = useRouteQuery<number>("option", 1, { transform: Number });
const page = useRouteQuery("page", 1, { transform: Number });
const size = useRouteQuery("size", 5, { transform: Number });
```

- `useRouteQuery` 是 VueUse 提供的工具，它会创建一个与 URL query 参数双向绑定的 ref。  
  修改 `page.value` 会自动更新 URL 中的 `?page=...`，反之 URL 变化也会更新 `page.value`。  
  这正是我们第一篇中“URL 是唯一真实源”思想的完美体现。

### 2. 搜索防抖与页码重置

```ts
watchDebounced(
  searchInput,
  (val) => {
    searchQuery.value = val;
    page.value = 1; // 新搜索从第一页开始
  },
  { debounce: 500 },
);

watch(
  searchQuery,
  (val) => {
    searchInput.value = val;
  },
  { immediate: true },
);
```

- `searchInput` 是输入框绑定的实时值，用户每输入一个字符都会触发它变化。
- 利用 `watchDebounced`，只有在用户停止输入 500ms 后，才会将最新的值写入 `searchQuery`，进而更新 URL。同时将页码重置为 1，确保新搜索从第一页开始。
- 反向 watch 确保当 URL 因后退/前进变化时，输入框内容也随之更新（此时不重置页码，因为 URL 中已包含当时的页码）。

### 3. 数据获取与自动刷新

```ts
const { data } = useAsyncData(
  "articles",
  async () => {
    // ... 使用 searchInput.value, page.value, size.value 构建查询
  },
  {
    watch: [
      () => searchInput.value,
      () => searchOption.value,
      () => page.value,
      () => size.value,
    ],
  },
);
```

- `watch` 数组中包含了所有依赖的响应式源，**任一变化都会自动重新请求数据**，无需手动调用 `refresh`。
- 监听 `searchInput.value`（实时输入）而不是 `searchQuery.value`，这样用户在输入过程中就能看到实时搜索结果，体验更流畅。
- 当页码因搜索被重置为 1 时，`page.value` 变化也会触发刷新，与新的搜索词一起获取第一页数据。

### 4. 移动端无限滚动

```ts
const articleList = ref<[]>([]);
watch(
  () => articleData.value?.list,
  (newList) => {
    if (!newList) return;
    if (isMobile.value && page.value > 1) {
      // 合并并去重
      const merged = [...articleList.value, ...newList];
      const uniqueMap = new Map(merged.map((item) => [item.id, item]));
      articleList.value = Array.from(uniqueMap.values());
    } else {
      // 桌面端翻页或移动端第一页（包括搜索后 page=1 的情况）：直接替换
      articleList.value = newList;
    }
  },
  { immediate: true },
);
```

- `articleList` 用于累积已加载的所有文章。
- 在移动端且页码大于 1（即加载更多）时，将新数据合并到现有列表并去重（防止因并发请求导致重复）。
- 其他情况（桌面端翻页、移动端第一页、搜索后重置）直接替换列表，完美适配各种交互。

### 5. 键盘操作

```ts
useEventListener("keydown", (e) => {
  if (e.key === "Escape" && isInputFocused.value) {
    (document.activeElement as HTMLElement)?.blur();
    return;
  }
  if (isInputFocused.value) return;

  if (e.key === "ArrowLeft" && hasPrevPage.value) {
    e.preventDefault();
    page.value -= 1;
  } else if (e.key === "ArrowRight" && hasNextPage.value) {
    e.preventDefault();
    page.value += 1;
  }
});
```

- **ESC 失焦**：当焦点在输入框时，按下 ESC 可以取消焦点。
- **左右方向键翻页**：焦点不在输入框时，按左/右键切换页码，数据自动刷新。

---

## 特色功能说明

### ✅ 真正的“可分享”状态

所有关键状态（搜索词、搜索选项、页码、每页条数）都存储在 URL 中，复制链接给好友，对方打开后看到完全相同的页面。

### ✅ 后退/前进完美支持

由于 URL 与内部状态双向同步，浏览器的后退/前进按钮能正确恢复历史状态，并且数据会自动刷新。

### ✅ 移动端与桌面端双适配

- 桌面端显示完整分页组件，操作直观。
- 移动端隐藏分页组件，采用无限滚动，上滑自动加载更多，同时保留分页逻辑（页码递增）。

### ✅ 防抖搜索 + 页码重置

输入搜索词时，仅当用户停止输入 500ms 后才更新 URL，避免历史记录刷屏；同时自动将页码重置为 1，确保新搜索从第一页开始，符合用户预期。

### ✅ 键盘增强

- 左右键快速翻页（适合桌面端阅读场景）。
- ESC 一键清空输入框焦点，提升操作效率。

---

## 扩展思路：添加更多筛选条件

如果需要增加分类、标签、排序等筛选，只需遵循相同模式：

1. 在 URL query 中添加对应参数，例如 `?category=tech&sort=desc`。
2. 使用 `useRouteQuery` 创建对应的 ref，并设置默认值、转换函数。
3. 在 `useAsyncData` 的 `watch` 中添加该 ref 的监听。
4. 在模板中添加对应的筛选控件，直接 `v-model` 绑定即可。

**示例**：

```ts
const category = useRouteQuery("category", "all");
const sort = useRouteQuery("sort", "desc");
```

```vue
<USelect v-model="category" :items="categories" />
<USelect v-model="sort" :items="['asc', 'desc']" />
```

所有状态自动与 URL 同步，无需额外代码。

---

## 常见问题

**Q：为什么数据获取要监听 `searchInput.value` 而不是 `searchQuery.value`？**  
A：`searchInput` 是输入框的实时值，监听它可以让用户在输入过程中就看到搜索结果（实时刷新）。而 `searchQuery` 是防抖后的值，仅用于 URL 同步。如果监听 `searchQuery`，用户在输入时会因防抖而感觉延迟。

**Q：搜索时为什么要手动重置 `page.value = 1`？**  
A：用户输入新搜索词时，通常期望从第一页开始展示结果。如果不重置页码，可能会停留在之前的大页码上，导致看不到新搜索的内容。重置页码后，`useAsyncData` 的 `watch` 会捕捉到 `page.value` 变化，自动获取第一页数据。

**Q：移动端无限滚动时，如何避免重复请求？**  
A：代码中通过 `pending.value` 判断当前是否正在加载，同时利用 `hasNextPage` 确保还有下一页时才触发。合并列表时使用 `Map` 去重，即使意外触发多次也能保证数据唯一。

**Q：如何清空搜索词？**  
A：输入框右侧的“x”按钮将 `searchInput` 设为空字符串，会触发防抖 watch 清空 URL 中的 `search` 参数，同时页码重置为 1，数据自动刷新。

---

## 结语

本文是上一篇理论文章的实战落地。通过 `useRouteQuery`、`watchDebounced` 等现代工具，我们用更简洁的代码实现了与手写 watch 完全相同的核心思想。希望这份完整的示例能帮助你快速搭建自己的文章列表页，并理解“URL 即状态”的设计哲学。

---

**📘 理论基础回顾**  
如果你对本文的核心设计思想还不熟悉，建议先阅读原理篇：  
👉 [《从分页状态同步路由，看 Nuxt 的数据流设计哲学》](nuxt-route-sync)
