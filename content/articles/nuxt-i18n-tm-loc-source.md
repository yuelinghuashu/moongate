---
title: Nuxt i18n 的 `$tm` 函数：环境差异问题与解决方案
description: 介绍了 Nuxt.js 项目中使用 @nuxtjs/i18n 模块的 $tm 函数（或组合式 API 中的 tm()）时，一个常见的问题是：在开发环境 (nuxt dev) 下运行正常的代码，在生产环境构建 (nuxt build) 后运行会报错或渲染异常。
date: 2026-01-22
tags: [Nuxt.js, i18n]
---

# Nuxt i18n 的 `$tm` 函数：环境差异问题与解决方案

## 核心问题

在 Nuxt.js 项目中使用 `@nuxtjs/i18n` 模块的 `$tm` 函数（或组合式 API 中的 `tm()`）时，一个常见的问题是：**在开发环境 (`nuxt dev`) 下运行正常的代码，在生产环境构建 (`nuxt build`) 后运行会报错或渲染异常**。

典型的错误信息是：

```text
Cannot read properties of undefined (reading 'source')
```

## 问题根源

问题的本质在于 `@nuxtjs/i18n` 模块底层在处理语言文件时，**开发与生产环境采用了不同的编译策略**，导致 `$tm` 函数返回的数据结构不一致。

### 数据结构差异

假设你的语言文件 (`locales/zh-CN.json`) 中包含：

```json
{
  "navigationBar": [{ "id": 1, "name": "文章", "link": "/articles" }]
}
```

在不同的环境下，`tm('navigationBar')` 返回的数据结构可能不同：

| 环境         | 可能的数据结构                                                                                               | 访问方式               |
| ------------ | ------------------------------------------------------------------------------------------------------------ | ---------------------- |
| **开发环境** | 嵌套的 AST 结构： <br>`{ id: 1, name: { loc: { source: "文章" } }, link: { loc: { source: "/articles" } } }` | `item.name.loc.source` |
| **生产环境** | 简单的扁平结构： <br>`{ id: 1, name: "文章", link: "/articles" }`                                            | `item.name`            |

这种差异会导致在模板中访问数据的代码在一个环境下工作，在另一个环境下失败。

## 解决方案：环境判断与数据适配

最直接有效的解决方案是在代码中**显式判断当前环境，并根据环境选择正确的数据访问路径**。

### 1. 核心判断方法

使用 `import.meta.env.DEV` 判断当前是否为开发环境：

```typescript
const isDev = import.meta.env.DEV; // 开发环境为 true，生产环境为 false
```

### 2. 在组件中直接应用

在你的 Vue 组件中，可以这样使用三元表达式进行适配：

```vue
<template>
  <nav>
    <ul>
      <li v-for="item in tm('navigationBar')" :key="item.id">
        <!-- 根据环境选择正确的访问路径 -->
        <NuxtLink :to="isDev ? item.link?.loc?.source : item.link">
          {{ isDev ? item.name?.loc?.source : item.name }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
// 导入环境判断
const isDev = import.meta.env.DEV;

// 获取翻译函数
const { tm } = useI18n();
</script>
```

## 为什么这是有效方案？

1. **直接明了**：明确承认环境差异，用代码逻辑适配，而非试图改变框架行为
2. **稳定可靠**：不依赖复杂的模块配置，减少因配置错误或版本变化导致的问题
3. **性能影响小**：环境判断只在构建时确定，运行时几乎没有额外开销

## 总结

通过简单的环境判断和三元表达式，可以有效解决 `@nuxtjs/i18n` 的 `$tm` 函数在不同环境下数据结构不一致的问题。这种方法避免了深入复杂的模块配置，以最小的成本实现了跨环境的稳定性，是经过实践验证的有效方案。
