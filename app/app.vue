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

  //  Google tag (gtag.js)
  //  外部脚本用 async（defer 对 async 脚本无意义）；行内脚本不接受 defer——
  //  浏览器本来就忽略行内脚本的 defer，而 useHead 的类型也不允许，去掉即可。
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
