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
