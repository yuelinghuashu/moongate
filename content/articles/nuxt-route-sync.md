---
title: 从分页状态同步路由，看 Nuxt 的数据流设计哲学
description: 深入探讨“URL 是唯一真实源”的核心思想，通过双向同步闭环彻底解决后退按钮数据不刷新、输入框与 URL 不同步等顽疾。
date: 2026-02-18
tags: [Nuxt, Vue, 数据流, 路由, 最佳实践]
---

# 从分页状态同步路由，看 Nuxt 的数据流设计哲学

## 引言

开发文章列表页时，我们习惯把分页、搜索参数放在 URL query 里（如 `/articles?page=2&search=nuxt`），以便分享和 SEO。但实现后常遇到两个头疼的问题：

1. **点击浏览器后退按钮，URL 变了，页面数据却没变。**
2. **直接修改 URL 参数回车，数据更新了，但输入框显示的还是旧值。**

这些问题根源在于 **内部状态与 URL 不同步**。本文用最简代码讲透一个**双向同步、自动刷新**的通用方案。

---

## 常见错误（快速了解为什么不行）

- **只监听分页推路由，不同步搜索词** → 后退时搜索词没更新，数据错误。
- **手动调用 `refresh`** → 重复请求，破坏数据流的单向性。
- **`useAsyncData` 的 `watch` 依赖不全** → 部分状态变化不触发刷新。

---

## 正确方案：两步闭环 + 自动刷新

### 核心思想

- **URL 是唯一真实源**：所有影响数据的状态（page, size, search）都应与 URL 同步。
- **`useAsyncData` 的 `watch` 自动刷新**：列全依赖，无需手动调用 `refresh`。

> 以上是手写 watch 的核心原理，足以应对大多数场景。如果你希望代码更简洁，可以使用 `@vueuse/router` 的 `useRouteQuery` 等工具（这正是 [《Nuxt 文章列表页实战》](nuxt-pagination-action) 中采用的方案。无论哪种方式，核心思想都是一致的。

### 关键代码（仅展示核心）

#### 1. 定义内部状态（从 URL 初始化）

```ts
const route = useRoute();
const router = useRouter();

const search = ref(route.query.search?.toString() || "");
const pagination = ref({
  page: Number(route.query.page) || 1,
  size: Number(route.query.size) || 5,
});
```

#### 2. Watch 1：URL → 内部状态（处理后退/直接访问）

```ts
watch(
  () => route.query,
  (newQuery) => {
    const newSearch = newQuery.search?.toString() || "";
    const newPage = Number(newQuery.page) || 1;
    const newSize = Number(newQuery.size) || 5;

    if (search.value !== newSearch) search.value = newSearch;
    if (pagination.value.page !== newPage) pagination.value.page = newPage;
    if (pagination.value.size !== newSize) pagination.value.size = newSize;
  },
  { immediate: true },
);
```

#### 3. Watch 2：内部状态 → URL（用户操作时同步）

```ts
// 分页变化（页码、每页条数）同步到 URL
watch(
  [
    () => search.value,
    () => pagination.value.page,
    () => pagination.value.size,
  ],
  ([newSearch, newPage, newSize]) => {
    // 只在文章列表页执行，避免干扰其他路由
    if (route.path !== "/articles") return;

    const query = { search: newSearch, page: newPage, size: newSize };
    // 如果 URL 已一致，则不再更新
    if (
      route.query.search === newSearch &&
      Number(route.query.page) === newPage &&
      Number(route.query.size) === newSize
    )
      return;

    router.push({ query });
  },
);
```

**说明**：此 watch 同时监听搜索词和分页变化，任何一项改变都会立即同步到 URL（无防抖）。如果希望搜索输入有防抖，可单独为搜索词创建一个带防抖的 watch（如下方扩展）。

#### 4. 数据获取：`useAsyncData` 自动刷新

```ts
const { data } = useAsyncData(
  "articles",
  () => {
    // 使用最新的 search、page、size 进行查询
    return queryCollection("articles")
      .where("title", "LIKE", `%${search.value}%`)
      .skip((pagination.value.page - 1) * pagination.value.size)
      .limit(pagination.value.size)
      .all();
  },
  {
    watch: [
      () => search.value, // 搜索词变化时刷新
      () => pagination.value.page, // 页码变化时刷新
      () => pagination.value.size, // 每页条数变化时刷新
      // 其他依赖（如分类、排序）也加在这里
    ],
  },
);
```

**关键**：`watch` 数组包含了所有依赖，任一变化都会自动重新请求数据。

## 扩展：如果需要搜索防抖

如果希望输入搜索词时不立即更新 URL（避免历史记录刷屏），可以为搜索词单独添加防抖处理。以下是使用 VueUse 工具库（`@vueuse/core` 和 `@vueuse/router`）的简洁实现，其核心思想与手写 watch 完全相同。

### 1. 安装模块

```bash
pnpm add @vueuse/core @vueuse/router
```

### 2. 代码模板

```ts
import { useRouteQuery } from "@vueuse/router";
import { watchDebounced } from "@vueuse/core";

// 分页参数（自动同步到 URL）
const page = useRouteQuery("page", 1, { transform: Number });
const size = useRouteQuery("size", 5, { transform: Number });

// 搜索参数：输入框实时值 + URL 同步（防抖）
const searchInput = ref(""); // 输入框绑定的实时值
const searchQuery = useRouteQuery<string>("search", ""); // URL 中的搜索词

// 输入防抖：用户停止输入 500ms 后更新 URL
watchDebounced(
  searchInput,
  (val) => {
    searchQuery.value = val;
  },
  { debounce: 500 },
);

// URL 变化（如后退）时同步到输入框
watch(
  searchQuery,
  (val) => {
    searchInput.value = val;
  },
  { immediate: true },
);
```

**说明**：

- `useRouteQuery` 创建的变量会**自动同步**到 URL 的 query 参数，无需手动调用 `router.push`。
- 分页变化直接修改 `page.value` 或 `size.value`，URL 实时更新，同时触发数据重新获取。
- 搜索框绑定 `searchInput`，通过 `watchDebounced` 延迟更新 `searchQuery`，既保证了 URL 的防抖，又能在后退/前进时通过反向 watch 保持输入框与 URL 一致。

此方案与手写 watch 的原理完全一致，但代码更简洁、更现代化。

---

## 原理剖析：为什么它能完美工作？

### 双向同步闭环

- **URL → 内部状态**：保证 URL 变化（后退/直接输入）时内部值同步更新。
- **内部状态 → URL**：用户操作（翻页、搜索）时将新状态推回 URL，生成历史记录。
- **闭环**：两者始终一致，任何变化都会通过 `useAsyncData` 的 `watch` 自动刷新数据。

### 后退按钮为什么现在能工作？

1. 后退改变 URL → 触发 **Watch 1** → 更新内部状态（page/size/search）。
2. 内部状态变化 → 触发 **`useAsyncData` 的 `watch`** → 自动重新请求数据。
3. 视图刷新，与 URL 匹配。

无需手动调用任何东西，完全是响应式驱动。

### SSR 兼容性

服务端渲染时 `route.query` 已包含参数，`useAsyncData` 直接执行，生成正确 HTML。客户端 hydration 后，`immediate: true` 确保状态同步。

---

## 扩展：多条件筛选怎么办？

只需：

1. 在 URL query 中增加参数（如 `?category=tech`）。
2. 定义对应的内部 ref，并在 Watch 1 中同步。
3. 为该参数添加 Watch 推回 URL（可带防抖）。
4. 将该 ref 加入 `useAsyncData` 的 `watch` 数组。

**原则**：所有影响数据的状态都走这个模式，URL 始终是真实源。

---

## 与 localStorage 对比

| 特性      | URL Query        | localStorage       |
| --------- | ---------------- | ------------------ |
| 可分享    | ✅ 直接复制链接  | ❌ 无法分享        |
| 后退/前进 | ✅ 天然支持      | ❌ 需手动监听      |
| SSR 可用  | ✅ 是            | ❌ 否              |
| 适用场景  | 分页、搜索、筛选 | 用户偏好（如主题） |

---

## 总结

本文用最精简的代码，展示了如何通过 **两个方向的 watch** + **`useAsyncData` 的自动刷新**，完美解决列表页状态与 URL 同步问题。核心要点：

- **URL 是唯一真实源**，所有状态都应与它同步。
- **`useAsyncData` 的 `watch` 列全依赖**，让数据刷新自动化。
- **防抖处理高频输入**（如搜索），避免 URL 历史爆炸。

这套模式可轻松扩展到任意复杂筛选场景，且天然兼容 SSR。从此再也不怕后退按钮失灵了。

---

**📘 姊妹篇推荐**  
如果你想看完整的组件实现（含移动端无限滚动、键盘操作等），请移步实战篇：  
👉 [《Nuxt 文章列表页实战：分页、搜索、无限滚动、键盘操作全搞定》](nuxt-pagination-action)
