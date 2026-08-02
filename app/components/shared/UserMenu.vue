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

// 用户下拉菜单列表
const items = [
  {
    label: t("user.profile"),
    icon: "tabler:user",
    active:
      user && user.value?.login
        ? route.path === localePath(`/${user.value.login}/profile`)
        : false,
    onClick() {
      navigateTo(localePath(`/${user.value?.login}/profile`));
    },
  },
  {
    label: t("user.logout"),
    icon: "tabler:logout",
    onClick() {
      logout();
    },
  },
];
</script>
