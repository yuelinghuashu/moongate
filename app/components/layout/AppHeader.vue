<template>
  <Header
    sticky
    class="border-b border-muted"
    style="background-color: var(--ui-bg)"
  >
    <Container size="xl">
      <div class="flex items-center justify-between">
        <!-- 头部左侧标题：固定最小宽度 -->
        <div class="flex items-center">
          <Icon
            v-if="!isDesktop"
            name="tabler:menu-2"
            class="mr-2 text-2xl"
            @click="isMenuVisible = !isMenuVisible"
          />
          <NuxtLink
            :to="localePath('/')"
            rel="noopener noreferrer"
            class="text-2xl nav-link"
            style="padding-left: 0"
          >
            MOONGATE
          </NuxtLink>
        </div>

        <!-- 头部居中导航栏：自动占满 -->
        <div v-if="isDesktop" class="flex-1 flex justify-center">
          <NavigationBar orientation="horizontal" />
        </div>

        <!-- 右侧辅助图标栏：固定最小宽度，内容右对齐 -->
        <div class="flex items-center justify-end gap-2 min-w-[180px]">
          <ClientOnly>
            <Icon
              v-if="isOutlineIconVisible"
              name="tabler:list"
              class="cursor-pointer h-5"
              @click="toggleOutline()"
            />

            <Divider v-if="isOutlineIconVisible" vertical />

            <Icon
              :name="colorMode.value === 'dark' ? 'tabler:moon' : 'tabler:sun'"
              class="cursor-pointer h-5"
              @click="
                settingStore.setTheme(
                  colorMode.value === 'dark' ? 'light' : 'dark',
                )
              "
            />
          </ClientOnly>

          <Divider vertical />

          <SharedLanguagePopover class="h-5" />

        </div>
      </div>

      <!-- 移动抽屉，只在移动端显示 -->
      <ClientOnly>
        <Drawer
          v-model="isMenuVisible"
          :title="t('nav.title')"
          size="sm"
          placement="left"
        >
          <NavigationBar orientation="vertical" />
        </Drawer>
      </ClientOnly>
    </Container>
  </Header>
</template>

<script lang="ts" setup>
import { Divider, Header, Container, Drawer } from "moongate-vue";
import useSettingStore from "~/stores/setting";

const { t } = useI18n();
const settingStore = useSettingStore();
const colorMode = useColorMode();
const localePath = useLocalePath();
const { isDesktop } = useResponsive();
const route = useRoute();
const { isOutlineIconVisible, toggleOutline } = useOutline();
watchEffect(() => {
  if (route.path.match(/^\/(?:[a-z_-]+\/)?(docs|about)\/.+/)) {
    isOutlineIconVisible.value = true;
  } else {
    isOutlineIconVisible.value = false;
  }
});

// 移动抽屉状态
const isMenuVisible = ref(false);

// 监听路由变化，自动关闭抽屉
watch(
  () => route.path,
  () => {
    isMenuVisible.value = false;
  },
);
</script>
