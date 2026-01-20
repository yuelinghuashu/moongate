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

      <!-- 辅助图标栏 -->
      <template #right>
        <ClientOnly>
          <UButton
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            :icon="
              colorMode.value === 'dark' ? 'tabler:moon' : 'tabler:sun'
            "
            @click="
              setTheme(
                colorMode.value === 'dark' || colorMode.value === 'system'
                  ? 'light'
                  : 'dark',
              )
            "
          />
          <LanguagePopover />
        </ClientOnly>
      </template>

      <!-- 移动抽屉，只在移动端显示 -->
      <template #body>
        <NavigationBar />
      </template>
    </UHeader>

    <!-- 主体 -->
    <UPage class="flex mt-8">
      <!-- 左侧导航栏 -->
      <template #left>
        <NavigationBar class="page-left h-fit sticky top-25" />
      </template>

      <!-- 内容区域 -->
      <template #default>
        <div>
          <slot />
        </div>
      </template>

      <template
        v-if="route.path === '/' || route.path === `/${locale}/`"
        #right
      />
    </UPage>
  </div>
</template>

<script lang="ts" setup>
import useGlobalStore from "~/stores/global";

const { setTheme } = useGlobalStore();
const route = useRoute();
const { locale } = useI18n();
const colorMode = useColorMode();
</script>

<style scoped>
@media (max-width: 768px) {
  .page-left {
    display: none;
  }
}
</style>
