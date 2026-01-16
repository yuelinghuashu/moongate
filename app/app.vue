<script lang="ts" setup>
import * as allLocale from "@nuxt/ui/locale";
const { locale } = useI18n();

// 设置动态语言
const lang = computed(() => allLocale[locale.value].code);
const dir = computed(() => allLocale[locale.value].dir);

useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.svg" }],
  htmlAttrs: {
    lang,
    dir,
  },
});

const title = "Where Moon Meets Code";
const description =
  "推开月之门，进入一个由代码构筑的探索空间。这里记录着关于全栈开发、系统思考以及如何优雅解决复杂问题的沉思与笔记。";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
});
</script>

<template>
    <UApp :locale="allLocale[locale]">
      <!-- 内容组件 -->
      <UMain>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UMain>
    </UApp>
</template>

<style scoped></style>
