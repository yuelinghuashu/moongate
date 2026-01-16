---
date: 2025-12-11
title: "09-@nuxt/i18n 配置指南"
description: "本文介绍了 @nuxt/i18n 模块的配置方法，并提供了一些常见问题的解决方案。"
tags: ["Nuxt"]
---

# @Nuxt/i18n 国际化配置完整指南与中文实战

本文档基于 `@nuxtjs/i18n` 模块，版本为10.2.1，详细讲解在 Nuxt 4 项目中实现国际化的完整流程，并特别指出中文配置中的常见“痛点”及解决方案。

## 一、快速开始

### 1.1 安装模块

```bash
pnpm install @nuxt/i18n
```

### 1.2 基础配置 (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  modules: ["@nuxtjs/i18n"],

  i18n: {
    // 语言环境配置（核心）
    locales: [
      {
        code: "zh_cn", // 程序内部标识符（URL路径使用）
        name: "简体中文", // 显示名称
        language: "zh-CN", // 用于HTML lang属性的标准语言标签
        file: "zh_cn.json", // 对应的语言文件
      },
      {
        code: "en",
        name: "English",
        language: "en-US",
        file: "en-US.json",
      },
      {
        code: "ja",
        name: "日本語",
        language: "ja-JP",
        file: "ja-JP.json",
      },
    ],

    // 默认语言设置（必须与某个code完全匹配）
    defaultLocale: "zh_cn",

    // 语言文件目录
    langDir: "locales",

    // 路由策略
    strategy: "prefix_except_default", // 推荐：默认语言无前缀

    // 浏览器语言检测
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },
});
```

### 1.3 语言文件结构

创建语言文件目录和文件：

```text
project-root/
├── i18n/
│   └── locales/
│       ├── zh-CN.json    # 简体中文
│       ├── en-US.json    # 美式英文
│       └── ja-JP.json    # 日文
├── nuxt.config.ts
└── app.vue
```

### 1.4 创建语言文件

**`locales/zh-CN.json`**:

```json
{
  "welcome": "欢迎使用我们的应用",
  "about": "关于我们",
  "user": {
    "profile": "用户资料",
    "settings": "设置"
  }
}
```

**`locales/en-US.json`**:

```json
{
  "welcome": "Welcome to our app",
  "about": "About Us",
  "user": {
    "profile": "User Profile",
    "settings": "Settings"
  }
}
```

### 1.5 动态区域设置

```vue
<script setup lang="ts">
import * as locales from "@nuxt/ui/locale";

const { locale } = useI18n();
</script>

<template>
  <UApp :locale="locales[locale]">
    <NuxtPage />
  </UApp>
</template>
```

### 1.6 动态方向设置

```vue
<script setup lang="ts">
import * as locales from "@nuxt/ui/locale";

const { locale } = useI18n();

const lang = computed(() => locales[locale.value].code);
const dir = computed(() => locales[locale.value].dir);

useHead({
  htmlAttrs: {
    lang,
    dir,
  },
});
</script>

<template>
  <UApp :locale="locales[locale]">
    <NuxtPage />
  </UApp>
</template>
```

## 二、中文配置的特别痛点与解决方案

### 3.1 痛点一：语言标识符不一致

**问题**：中文有多种标识符格式（`zh`、`zh-CN`、`zh_CN`、`zh_cn`），容易混淆。

**解决方案**：

- **`code`字段**：用于URL路径和程序内部标识，推荐使用 **`zh_cn`**（全小写下划线）

```typescript
{ code: 'zh_cn', name: '简体中文' }
```

**`language`/`iso`字段**：用于HTML `lang`属性和SEO，使用标准 **`zh-CN`**（连字符格式）

```typescript
{ code: 'zh_cn', language: 'zh-CN' }
```

**`defaultLocale`**：必须与 `code` 值**完全一致**

```typescript
defaultLocale: "zh_cn"; // 正确
defaultLocale: "zh-CN"; // 错误！会导致配置不匹配
```

### 3.2 痛点二：默认语言配置错误

**问题**：`defaultLocale` 设置错误导致只有中文页面报错。

**解决方案**：

1. **严格匹配**：确保 `defaultLocale` 值与中文配置的 `code` 值**一字不差**
2. **配置验证**：

```typescript
// 正确的完整示例
locales: [
  { code: 'zh_cn', language: 'zh-CN', file: 'zh_cn.json' }
],
defaultLocale: 'zh_cn', // 必须与上面的code完全相同
strategy: 'prefix_except_default'
```

### 3.3 痛点三：语言文件加载失败

**问题**：控制台报错 `Cannot find module './locales/zh.json'`。

**解决方案**：

1. **检查文件路径**：确认 `langDir` 配置正确
2. **验证JSON格式**：语言文件必须是**严格有效的JSON**

```json
// 正确
{ "welcome": "欢迎" }

// 错误（有注释）
{
  // 欢迎语
  "welcome": "欢迎"
}

// 错误（有尾随逗号）
{ "welcome": "欢迎", }
```

## 四、高级配置

### 4.1 子域名国际化（像Vue官网一样）

```typescript
i18n: {
  locales: [
    {
      code: 'zh_cn',
      domain: 'cn.your-app.com', // 生产环境子域名
      language: 'zh-CN',
      file: 'zh-CN.json'
    },
    {
      code: 'en',
      domain: 'your-app.com', // 主域名作为默认语言
      language: 'en-US',
      file: 'en-US.json'
    }
  ],
  differentDomains: true, // 启用子域名模式
  defaultLocale: 'en', // 默认语言对应主域名
  detectBrowserLanguage: false // 子域名模式下通常禁用
}
```
