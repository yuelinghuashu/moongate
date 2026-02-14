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
      <NavigationBar v-if="isDesktop" orientation="horizontal" />
    </template>

    <!-- 辅助图标栏 -->
    <template #right>
      <ClientOnly>
        <!-- 目录图标 -->
        <UButton
          v-if="
            settingStore.isOutlineIconVisible &&
            route.path.match(/^\/(articles|about)\/.+/)
          "
          icon="i-tabler:list"
          variant="ghost"
          class="cursor-pointer"
          @click="isOutlineVisible = !isOutlineVisible"
        />
        
        <!-- 主题图标 -->
        <UButton
          variant="ghost"
          class="cursor-pointer"
          :icon="colorMode.value === 'dark' ? 'tabler:moon' : 'tabler:sun'"
          @click="
            settingStore.setTheme(colorMode.value === 'dark' ? 'light' : 'dark')
          "
        />
      </ClientOnly>

      <!-- 语言栏选项框 -->
      <SharedLanguagePopover />
    </template>

    <!-- 移动抽屉，只在移动端显示 -->
    <template #body>
      <NavigationBar orientation="vertical" />
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
import { useLocalStorage } from "@vueuse/core";
import useSettingStore from "~/stores/setting";

const settingStore = useSettingStore();
const colorMode = useColorMode();
const localePath = useLocalePath();
const { isDesktop } = useResponsive();
const route = useRoute();

// 目录是否可见
const isOutlineVisible = useLocalStorage("isOutlineVisible", false);
</script>
