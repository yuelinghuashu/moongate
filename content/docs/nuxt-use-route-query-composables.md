---
title: 手写一个更适合 Nuxt 的 useRouteQuery：简化 URL 状态同步
description: 封装一套开箱即用的 useRouteQueryString / Number / Array，将 70 行重复的 URL 状态同步代码压缩到 7 行，并彻底解决官方版本的 SSR 隐患。包含完整源码、防抖处理与反向同步示例。
date: 2026-03-22
permalink: m090PL4mgYDryo4lCaEi_
series: url-state
platform: nuxt
level: P3
tags: [Nuxt, Vue, State Management, Hydration]
---

# 手写一个更适合 Nuxt 的 useRouteQuery：简化 URL 状态同步

> 在生产项目中，我经历过手写 70 行重复的 `watch` 与 `pushQuery`，也踩过官方 `@vueuse/router` 的 SSR 坑。最终我封装了一套开箱即用的 `useRouteQueryString`、`useRouteQueryNumber`、`useRouteQueryArray`，将代码量从 70 行压缩到 7 行，且完全可控、SSR 安全。本文将分享这套封装的设计思路与完整代码。

---

> 📚 **系列导航**  
> 本文是 **Nuxt 状态同步三部曲** 的第二篇。
>
> - 第一篇：[《Nuxt 中 URL 与状态双向绑定的终极指南》](./nuxt-url-state-guide.md) 讲解了原理与手写方案。
> - 第三篇：[《从零到一：构建一个功能完备的文档列表页》](./nuxt-docs-list-page-complete-guide.md) 将综合运用本文的封装，实现完整页面。

---

## 一、背景：手写方案的痛点

在 Nuxt 中实现 URL 与状态双向同步，常见的做法是：

```ts
// 1. 定义所有状态（从 URL 初始化）
const searchInput = ref(route.query.search?.toString() || "");
const searchOption = ref(Number(route.query.option) || 1);
const page = ref(Number(route.query.page) || 1);
const size = ref(Number(route.query.size) || 10);
const viewMode = ref(Number(route.query.viewMode) || 1);
const level = ref(route.query.level?.toString() || "");
const tags = ref<string[]>([]);

// 解析 tags 数组（支持逗号分隔）
const parseTagsFromQuery = () => {
  const tagParam = route.query.tag;
  tags.value = tagParam
    ? Array.isArray(tagParam)
      ? tagParam
      : tagParam.split(",")
    : [];
};
parseTagsFromQuery();

// 2. 监听 URL 变化，同步到内部状态
watch(
  () => route.query,
  (q) => {
    searchInput.value = q.search?.toString() || "";
    searchOption.value = Number(q.option) || 1;
    page.value = Number(q.page) || 1;
    size.value = Number(q.size) || 10;
    viewMode.value = Number(q.viewMode) || 1;
    level.value = q.level?.toString() || "";
    parseTagsFromQuery();
  },
  { immediate: true },
);

// 3. 监听内部状态变化，同步到 URL
function pushQuery() {
  const query: Record<string, string> = {};
  if (searchInput.value) query.search = searchInput.value;
  if (searchOption.value !== 1) query.option = String(searchOption.value);
  if (page.value !== 1) query.page = String(page.value);
  if (size.value !== 10) query.size = String(size.value);
  if (viewMode.value !== 1) query.viewMode = String(viewMode.value);
  if (level.value) query.level = level.value;
  if (tags.value.length) query.tag = tags.value.join(",");

  if (JSON.stringify(route.query) !== JSON.stringify(query)) {
    router.push({ query });
  }
}

watch([searchInput, searchOption, page, size, viewMode, level, tags], () =>
  pushQuery(),
);
```

重复 7 个状态，代码量庞大，且每个新页面都要重写一遍。这种代码不仅笨重，还容易漏掉某个 `watch`，导致 URL 与状态不同步。

---

## 二、官方 `useRouteQuery` 的隐患

`@vueuse/router` 提供了 `useRouteQuery`，看似简洁，但在生产环境中我遇到了 `Invalid value used as weak map key` 的错误，原因是其内部使用了全局 `WeakMap` 和 `nextTick` 批量更新，在 SSR 下可能跨请求污染。最终我放弃了第三方库，决定自己封装一个稳定、可控的版本。

---

## 三、封装设计：按类型拆分，各司其职

我将 URL 查询参数按常见类型拆分为三个专用函数，每个函数只做一件事，语义清晰。

### 3.1 基础函数 `useRouteQueryRaw`

不对外暴露，仅用于内部读写原始值：

```ts
function useRouteQueryRaw(name: string) {
  const route = useRoute();
  const router = useRouter();
  const value = ref(route.query[name]);

  watch(
    () => route.query[name],
    (v) => {
      value.value = v;
    },
  );
  watch(value, (v) => {
    router.push({ query: { ...route.query, [name]: v } });
  });
  return value;
}
```

**特点**：

- 无全局状态，每个组件实例独立。
- 直接监听 `route.query` 和内部 `ref`，实现双向同步。
- 不使用 `nextTick` 批量更新，避免复杂时序问题。

### 3.2 字符串类型 `useRouteQueryString`

```ts
export function useRouteQueryString(
  name: string,
  options?: { defaultValue?: string },
) {
  const raw = useRouteQueryRaw(name);
  const defaultValue = options?.defaultValue ?? "";

  return computed({
    get: () => (raw.value?.toString() ?? defaultValue) as string,
    set: (v: string) => {
      raw.value = v === defaultValue ? undefined : v;
    },
  }) as Ref<string>;
}
```

### 3.3 数字类型 `useRouteQueryNumber`

```ts
export function useRouteQueryNumber(
  name: string,
  options?: { defaultValue?: number },
) {
  const raw = useRouteQueryRaw(name);
  const defaultValue = options?.defaultValue ?? 0;

  return computed({
    get: () => {
      const val = raw.value;
      if (val === undefined) return defaultValue;
      const num = Number(val);
      return isNaN(num) ? defaultValue : num;
    },
    set: (v: number) => {
      raw.value = v === defaultValue ? undefined : v.toString();
    },
  }) as Ref<number>;
}
```

### 3.4 数组类型（逗号分隔）`useRouteQueryArray`

```ts
export function useRouteQueryArray(name: string) {
  const raw = useRouteQueryRaw(name);

  return computed({
    get: () => {
      const val = raw.value;
      if (!val) return [];
      return Array.isArray(val) ? val : (val as string).split(",");
    },
    set: (v: string[]) => {
      raw.value = v.length ? v.join(",") : undefined;
    },
  }) as Ref<string[]>;
}
```

---

## 四、使用示例：从 70 行到 7 行

### 4.1 定义状态

```ts
const searchInput = useRouteQueryString("search", { defaultValue: "" });
const searchOption = useRouteQueryNumber("option", { defaultValue: 1 });
const page = useRouteQueryNumber("page", { defaultValue: 1 });
const size = useRouteQueryNumber("size", { defaultValue: 10 });
const viewMode = useRouteQueryNumber("viewMode", { defaultValue: 1 });
const level = useRouteQueryString("level", { defaultValue: "" });
const tags = useRouteQueryArray("tag");
```

### 4.2 在模板中使用

```vue
<template>
  <UInput v-model="searchInput" placeholder="搜索" />
  <!-- 其他筛选组件直接使用对应的状态变量 -->
</template>
```

### 4.3 处理搜索防抖（可选）

由于直接修改 `searchInput` 会立即更新 URL，如果你希望实现“输入停止后才更新”的效果，可以引入一个防抖中间变量，并添加反向同步。

#### 数据流向图

```
用户输入
    ↓
searchInputDebounced 变化
    ↓
watchDebounced 延迟 500ms
    ↓
searchInput.value = val
    ↓
URL 更新，route.query 变化
    ↓
useRouteQueryString 内部监听到 route.query 变化
    ↓
searchInput 被同步为新值（但此时已经是新值，无变化）
    ↓
【关键】当 URL 因后退/前进变化时：
    route.query 变化 → searchInput 被同步 → watch(searchInput) 触发
    ↓
searchInputDebounced.value = val  ← 反向同步，输入框内容与 URL 保持一致
```

#### 完整代码

```ts
// 实际搜索词（与 URL 同步）
const searchInput = useRouteQueryString("search", { defaultValue: "" });
const page = useRouteQueryNumber("page", { defaultValue: 1 });

// 创建防抖中间变量，初始值与实际搜索词相同
const searchInputDebounced = ref(searchInput.value);

// 监听防抖变量，延迟 500ms 后同步到实际搜索词，并重置页码
watchDebounced(
  searchInputDebounced,
  (val) => {
    searchInput.value = val;
    page.value = 1;
  },
  { debounce: 500 },
);

// 反向同步：当 URL 变化（后退/前进）时，更新防抖变量，保持输入框与 URL 一致
watch(searchInput, (val) => {
  searchInputDebounced.value = val;
});
```

**注意**：如果使用了防抖，模板中需要绑定 `searchInputDebounced` 而不是 `searchInput`。

```vue
<template>
  <UInput v-model="searchInputDebounced" placeholder="搜索" />
</template>
```

这样，搜索框的实时输入不会触发 URL 更新，只有用户停止输入 500ms 后才会同步到 URL。同时，当用户点击后退按钮时，输入框内容也会自动同步到 URL 中的值。

---

## 五、与官方 `useRouteQuery` 对比

| 维度         | 官方版本                      | 本封装       |
| ------------ | ----------------------------- | ------------ |
| **SSR 安全** | ⚠️ 有隐患（`WeakMap` 跨请求） | ✅ 安全      |
| **数组支持** | 需手动 `transform`            | ✅ 内置      |
| **使用便捷** | 需写 `transform`/`serialize`  | 函数名即类型 |
| **代码量**   | 中等                          | 极少         |
| **可读性**   | 一般                          | 高           |

---

## 六、SSR 安全保证

- **无全局状态**：所有数据存储在组件实例的 `ref` 中，不会跨请求污染。
- **直接监听 `route.query`**：保证服务端和客户端初始值一致。
- **不使用 `nextTick`**：避免在 SSR 中因异步更新导致 DOM 不匹配。

---

## 七、完整代码

将以下代码保存为 `composables/useRouteQuery.ts`：

```ts
// composables/useRouteQuery.ts
import { useRoute, useRouter } from "vue-router";
import type { Ref } from "vue";

/**
 * 基础原始查询参数读写（不暴露给外部，仅内部使用）
 */
function useRouteQueryRaw(name: string) {
  const route = useRoute();
  const router = useRouter();
  const value = ref(route.query[name]);

  // 监听路由变化，同步到内部 ref
  watch(
    () => route.query[name],
    (v) => {
      value.value = v;
    },
  );

  // 监听内部 ref 变化，同步到 URL
  watch(value, (v) => {
    const query = { ...route.query, [name]: v };
    router.push({ query });
  });

  return value;
}

/**
 * 字符串类型查询参数
 * @param name 参数名
 * @param options.defaultValue 默认值（可选）
 */
export function useRouteQueryString(
  name: string,
  options?: { defaultValue?: string },
) {
  const raw = useRouteQueryRaw(name);
  const defaultValue = options?.defaultValue ?? "";

  return computed({
    get: () => (raw.value?.toString() ?? defaultValue) as string,
    set: (v: string) => {
      raw.value = v === defaultValue ? undefined : v;
    },
  }) as Ref<string>;
}

/**
 * 数字类型查询参数
 * @param name 参数名
 * @param options.defaultValue 默认值（可选）
 */
export function useRouteQueryNumber(
  name: string,
  options?: { defaultValue?: number },
) {
  const raw = useRouteQueryRaw(name);
  const defaultValue = options?.defaultValue ?? 0;

  return computed({
    get: () => {
      const val = raw.value;
      if (val === undefined) return defaultValue;
      const num = Number(val);
      return isNaN(num) ? defaultValue : num;
    },
    set: (v: number) => {
      raw.value = v === defaultValue ? undefined : v.toString();
    },
  }) as Ref<number>;
}

/**
 * 字符串数组类型查询参数（URL 中用逗号分隔）
 * @param name 参数名
 */
export function useRouteQueryArray(name: string) {
  const raw = useRouteQueryRaw(name);

  return computed({
    get: () => {
      const val = raw.value;
      if (!val) return [];
      return Array.isArray(val) ? val : (val as string).split(",");
    },
    set: (v: string[]) => {
      raw.value = v.length ? v.join(",") : undefined;
    },
  }) as Ref<string[]>;
}
```

---

## 八、总结

这套封装解决了三个核心问题：

1. **减少重复代码**：从 70 行重复逻辑缩减到 7 行声明。
2. **提升可维护性**：所有状态同步逻辑集中在 composable 中，修改一处全局生效。
3. **保证 SSR 安全**：无全局状态、无 `nextTick` 依赖，彻底避免水合错误。

如果你的项目中也有类似的 URL 状态同步需求，不妨试试这套封装。它已经在我的 Nuxt 项目中稳定运行，希望也能帮到你。
