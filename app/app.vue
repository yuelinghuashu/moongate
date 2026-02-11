<script lang="ts" setup>
import * as allLocale from "@nuxt/ui/locale";
const { locale } = useI18n();

// 设置动态语言
const lang = computed(() => allLocale[locale.value].code);
const dir = computed(() => allLocale[locale.value].dir);

useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "favicon.svg" }],
  htmlAttrs: {
    lang,
    dir,
  },
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

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3P4XXTRN7Z"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-3P4XXTRN7Z');
</script>

<style scoped></style>
