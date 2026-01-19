---
date: 2025-12-28
title: 08-@nuxt/content 配置实战：从入门到优雅渲染
description: 记录了我从零开始配置 @nuxt/content 模块，并集成 Tailwind CSS v4 和 Typography 插件来优雅渲染 Markdown 内容的完整过程。
tags: Nuxt
---

# Nuxt Content 配置实战：从入门到优雅渲染

## 概述

这篇文章记录了我从零开始配置 Nuxt Content 模块，并集成 Tailwind CSS v4 和 Typography 插件来优雅渲染 Markdown 内容的完整过程。如果你也厌倦了在配置上耗费数小时却一行业务代码都没写的挫败感，这篇实战指南或许能帮你少走弯路。

> **核心收获**：现代前端配置虽复杂，但每一次“踩坑”都是对底层原理和问题解决能力的深度投资。

## 1. 环境与项目初始化

### 1.1 创建 Nuxt 项目

```bash
# 使用官方脚手架创建项目
pnpm create nuxt <My-Project>
cd <My-Project>

# 安装基础依赖（如果你使用 pnpm）
pnpm install
```

### 1.2 安装多个必备模块

```
# 安装 Nuxt Content 模块
pnpm add @nuxt/content

# 安装 better-sqlite3 模块
pnpm add better-sqlite3

# 安装 Tailwind CSS模块
pnpm add tailwindcss @tailwindcss/vite

# 安装 @tailwindcss/typography模块
pnpm add -D @tailwindcss/typography
```

### 1.3 处理可能存在的better-sqlite3模块的兼容问题

- 在项目根目录创建 `pnpm-workspace.yaml` 配置文件，内容如下

```yaml
# 在项目根目录创建 pnpm-workspace.yaml 配置文件，内容如下
onlyBuiltDependencies:
  - better-sqlite3

# 或者直接使用pnpm add <package> --allow-build=<package> 命令来安装，这个命令会自动帮你配置文件，并把包名添加到 onlyBuiltDependencies 配置里
pnpm add better-sqlite3 --allow-build=better-sqlite3
```

- 对`better-sqlite3`模块进行重新编译，并确保二进制文件被放置在正确的位置。

```bash
pnpm rebuild better-sqlite3
```

- 尝试启动你的Nuxt项目

```bash
pnpm run dev
```

## 2. 基础配置

### 2.1 配置 CSS 文件

```css
/* 在项目根目录创建一个 `./app/assets/css/main.css` 文件 */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

### 2.2 配置 `nuxt.config.ts`

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: ["@nuxt/content"],
  devtools: { enabled: true },
  compatibilityDate: "2025-07-15",
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### 2.3 创建内容目录和第一篇文档

在项目根目录创建 `content/` 文件夹，然后创建第一篇文章，文件暂命名为home.md

````markdown
# 欢迎来到我的博客

这是我的第一篇使用 **Nuxt Content** 构建的文章。

## 特性亮点

- ✅ 支持 Markdown 语法
- ✅ 内置代码高亮
- ✅ 前端框架无缝集成

## 代码示例

```javascript
// 这是一个 JavaScript 示例
export default function greet(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to ${name}'s blog`;
}
```
````

## 3. 创建文章渲染页面

```vue
<!-- 在app/pages的目录下创建文件名为[...slug].vue的文件，将以下代码粘贴到此文件中 -->
<script setup lang="ts">
const route = useRoute();

const { data: page } = await useAsyncData("page-" + route.path, () => {
  return queryCollection("content").path(route.path).first();
});

console.log(page.value);

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}
</script>

<template>
  <!-- class="prose" 是美化渲染样式的关键！ -->
  <ContentRenderer v-if="page" :value="page" class="prose" />
</template>
```

## 总结

### 1. 配置心得

1. **版本一致性**：确保所有依赖版本兼容，特别是 Nuxt、Content 模块和 Tailwind CSS 的版本匹配。
2. **渐进式配置**：不要一次性配置所有功能，先确保基础渲染正常，再逐步添加高级功能。
3. **善用官方文档**：遇到问题时，首先查看各模块的官方文档，注意版本差异。

### 2. 避坑指南

- **问题**：Tailwind CSS v4 配置失败
  - **原因**：仍在使用 v3 的 PostCSS 配置方式
  - **解决**：完全切换到 `@tailwindcss/vite` 插件方式，删除旧配置文件
- **问题**：样式未生效
  - **检查点**：
    1. `compatibilityDate` 是否已设置
    2. CSS 导入路径是否正确
    3. 是否清除了构建缓存（`.nuxt` 和 `node_modules/.vite`）

- **问题**：@nuxt/content与better-sqlite3模块冲突
  - **原因**：使用pnpm管理Nuxt项目时，特别是涉及到`@nuxt/content`模块和`better-sqlite3`这样的原生模块时，可能会遇到二进制文件路径解析的问题。

  - **解决**：通过创建`pnpm-workspace.yaml`配置文件并执行`pnpm rebuild better-sqlite3`命令，可以简单高效地解决这个问题。这个解决方案不仅适用于Nuxt项目，也适用于任何使用pnpm管理并依赖`better-sqlite3`的Node.js项目。它保留了pnpm的优势（如节省磁盘空间、更快的安装速度），同时解决了与原生模块的兼容性问题。

### 3. 性能建议

1. **按需引入**：只安装需要的 Tailwind CSS 插件
2. **代码分割**：利用 Nuxt 的自动代码分割功能
3. **图片优化**：使用 `@nuxt/image` 模块优化内容中的图片

---

> **写在最后**：虽然配置过程可能充满挑战，但一旦完成，你将获得一个强大、现代且完全可控的内容管理系统。每一次配置问题的解决，都是对现代前端工具链理解的深化。现在，去创建你的内容吧！
