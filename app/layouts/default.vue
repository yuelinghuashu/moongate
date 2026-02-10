<!-- eslint-disable vue/no-useless-template-attributes -->
<template>
  <div>
    <!-- 头部 -->
    <UHeader mode="drawer" :menu="{ direction: 'left' }" toggle-side="left">
      <!-- 网站标题 -->
      <template #title>
        <ClientOnly>
          <NuxtLink
            :to="locale === 'zh_cn' ? '/' : `/${locale}/`"
            class="text-2xl"
            >MOONGATE</NuxtLink
          >
        </ClientOnly>
      </template>

      <template #default>
        <NavigationBar orientation="horizontal" />
      </template>

      <!-- 辅助图标栏 -->
      <template #right>
        <ClientOnly>
          <UButton
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            :icon="colorMode.value === 'dark' ? 'tabler:moon' : 'tabler:sun'"
            @click="setTheme(colorMode.value === 'dark' ? 'light' : 'dark')"
          />
          <LanguagePopover />
        </ClientOnly>
      </template>

      <!-- 移动抽屉，只在移动端显示 -->
      <template #body>
        <NavigationBar orientation="vertical" />
      </template>
    </UHeader>

    <!-- 主体 -->
    <UPage
      :ui="{
        center:
          'w-full max-w-(--ui-container) mx-auto mt-8 px-4 sm:px-6 lg:px-8',
      }"
    >
      <!-- 内容区域 -->
      <template #default>
        <slot />
      </template>
    </UPage>
  </div>
</template>

<script lang="ts" setup>
import useGlobalStore from "~/stores/global";

const { setTheme } = useGlobalStore();
const { locale } = useI18n();
const colorMode = useColorMode();
</script>

<style scoped></style>
