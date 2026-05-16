<script lang="ts" setup>
const { locale } = useI18n();

useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [
    { rel: "icon", href: "/favicon.png" },
    {
      rel: "alternate",
      type: "application/rss+xml",
      title: "MoonGate",
      href: "/feed.xml",
    },
    {
      rel: "alternate",
      type: "application/atom+xml",
      title: "MoonGate",
      href: "/feed.atom",
    },
    {
      rel: "alternate",
      type: "application/json",
      title: "MoonGate",
      href: "/feed.json",
    },
  ],

  //  Google tag (gtag.js)
  script: [
    {
      src: "https://www.googletagmanager.com/gtag/js?id=G-3P4XXTRN7Z",
      async: true,
    },
    {
      innerHTML: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-3P4XXTRN7Z');`,
    },
  ],
});
</script>

<template>
  <!-- 内容组件 -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup></script>
