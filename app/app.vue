<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
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

  //  Google tag (gtag.js) — 使用 defer 避免阻塞渲染
  script: [
    {
      src: "https://www.googletagmanager.com/gtag/js?id=G-3P4XXTRN7Z",
      async: true,
      defer: true,
    },
    {
      innerHTML: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-3P4XXTRN7Z');`,
      defer: true,
    },
  ],
});
</script>
