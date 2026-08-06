<template>
  <Popover>
    <Icon name="tabler:user" />
    <template #content>
      <div
        v-for="item in items"
        :key="item.label"
        class="flex justify-evenly nav-link"
        @click="item.onClick"
      >
        <Icon :name="item.icon" />
        <span>{{ item.label }}</span>
      </div>
    </template>
  </Popover>
</template>

<script lang="ts" setup>
import { Popover } from "moongate-vue";
const localePath = useLocalePath();
const {user, logout} = useAuth()
const { t } = useI18n();
const route = useRoute();

// 用户下拉菜单列表（computed 确保登录状态变化时响应式更新）
// 用户标识：优先 login（GitHub 用户名），回退到 username
const userSlug = computed(() => user.value?.login || user.value?.username || "");

const items = computed(() => [
  {
    label: t("user.profile"),
    icon: "tabler:user",
    active: userSlug.value
      ? route.path === localePath(`/${userSlug.value}/profile`)
      : false,
    onClick() {
      if (userSlug.value) {
        navigateTo(localePath(`/${userSlug.value}/profile`));
      }
    },
  },
  {
    label: t("user.logout"),
    icon: "tabler:logout",
    onClick() {
      logout();
    },
  },
]);
</script>
