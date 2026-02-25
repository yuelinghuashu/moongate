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
      <div>
        <NuxtLink
          :to="localePath('/')"
          rel="noopener noreferrer"
          class="text-2xl nav-link"
          >MOONGATE</NuxtLink
        >
      </div>
    </template>

    <template #default>
      <NavigationBar v-if="isDesktop" orientation="horizontal" />
    </template>

    <!-- 辅助图标栏 -->
    <template #right>
      <!-- 目录图标 -->
      <UButton
        v-if="isOutlineIconVisible"
        :ui="{ leadingIcon: 'toolbar-icon-btn' }"
        variant="ghost"
        icon="tabler:list"
        class="cursor-pointer"
        @click="toggleOutline()"
      />

      <ClientOnly>
        <!-- 主题图标 -->
        <UButton
          variant="ghost"
          class="cursor-pointer"
          :ui="{ leadingIcon: 'toolbar-icon-btn' }"
          :icon="colorMode.value === 'dark' ? 'tabler:moon' : 'tabler:sun'"
          @click="
            settingStore.setTheme(colorMode.value === 'dark' ? 'light' : 'dark')
          "
        />
      </ClientOnly>

      <!-- 语言栏选项框 -->
      <SharedLanguagePopover />

      <!-- 用户图标按钮 -->
      <SharedUserMenu v-if="loggedIn" />

      <!-- 登录图标按钮 -->
      <UButton
        v-else
        :ui="{ leadingIcon: 'toolbar-icon-btn' }"
        icon="lucide:log-in"
        variant="ghost"
        class="cursor-pointer"
        @click="
          settingStore.isLoginDialogVisible = !settingStore.isLoginDialogVisible
        "
      />
    </template>

    <!-- 移动抽屉，只在移动端显示 -->
    <template #body>
      <NavigationBar orientation="vertical" />
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
import useSettingStore from "~/stores/setting";

const settingStore = useSettingStore();
const colorMode = useColorMode();
const localePath = useLocalePath();
const { isDesktop } = useResponsive();
const route = useRoute();
const { loggedIn } = useUserSession();
const { isOutlineIconVisible, toggleOutline } = useOutline();

watchEffect(() => {
  if (route.path.match(/^\/(?:[a-z_-]+\/)?(docs|about)\/.+/)) {
    isOutlineIconVisible.value = true;
  } else {
    isOutlineIconVisible.value = false;
  }
});
</script>

<script setup>

</script>
