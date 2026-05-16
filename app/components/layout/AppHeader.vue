<template>
  <Header sticky class="border-b border-muted">
    <Container size="xl">
      <div class="flex items-center justify-between">
        <!-- 头部左侧标题：固定最小宽度 -->
        <div class="left flex items-center gap-2 min-w-[180px]">
          <SharedLogo />
          <NuxtLink
            :to="localePath('/')"
            rel="noopener noreferrer"
            class="text-2xl nav-link whitespace-nowrap"
          >
            MOONGATE
          </NuxtLink>
        </div>

        <!-- 头部居中导航栏：自动占满 -->
        <div class="center flex-1 flex justify-center">
          <NavigationBar v-if="isDesktop" orientation="horizontal" />
        </div>

        <!-- 右侧辅助图标栏：固定最小宽度，内容右对齐 -->
        <div class="right flex items-center justify-end gap-2 min-w-[180px]">
          <ClientOnly>
            <Icon
              v-if="isOutlineIconVisible"
              name="tabler:list"
              class="cursor-pointer w-5 h-5"
              @click="toggleOutline()"
            />

            <Divider vertical />

            <Icon
              :name="colorMode.value === 'dark' ? 'tabler:moon' : 'tabler:sun'"
              class="cursor-pointer w-5 h-5"
              @click="
                settingStore.setTheme(
                  colorMode.value === 'dark' ? 'light' : 'dark',
                )
              "
            />
          </ClientOnly>

          <Divider vertical />

          <SharedLanguagePopover />

          <Divider vertical />

          <SharedUserMenu v-if="loggedIn" />

          <Icon
            v-else
            name="lucide:log-in"
            class="cursor-pointer w-5 h-5"
            @click="
              settingStore.isLoginDialogVisible =
                !settingStore.isLoginDialogVisible
            "
          />
        </div>
      </div>
    </Container>
  </Header>
</template>

<!-- 移动抽屉，只在移动端显示 -->
<!-- <template #body>
      <NavigationBar orientation="vertical" />
    </template> -->

<script lang="ts" setup>
import { Divider, Header, Container } from "moongate-vue";
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

<script setup></script>
