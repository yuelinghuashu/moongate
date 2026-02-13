<template>
  <UHeader
    mode="drawer"
    :menu="{ direction: 'left' }"
    toggle-side="left"
    :ui="{ left: 'flex items-center gap-1' }"
  >
    <!-- 网站标题 -->
    <template #left>
      <SharedLogo />
      <NuxtLink :to="localePath('/')" class="text-2xl">MOONGATE</NuxtLink>
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
      </ClientOnly>
      <SharedLanguagePopover />
    </template>

    <!-- 移动抽屉，只在移动端显示 -->
    <template #body>
      <NavigationBar orientation="vertical" />
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
import useSettingStore from "~/stores/setting";

const { setTheme } = useSettingStore();
const colorMode = useColorMode();
const localePath = useLocalePath();
</script>
