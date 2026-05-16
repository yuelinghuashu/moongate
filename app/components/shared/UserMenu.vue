<template>
  <Popover>
    <Icon name="lucide:user" />
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
const { user, clear } = useUserSession();
const { t } = useI18n();
const route = useRoute();

// 用户下拉菜单列表
const items = [
  {
    label: t("user.profile"),
    icon: "lucide-user",
    active:
      user && user.value?.login
        ? route.path === localePath(`/${user.value.login}/profile`)
        : false,
    onClick() {
      navigateTo(localePath(`/${user.value?.login}/profile`));
    },
  },
  // {
  //   label: t("user.myComments"),
  //   icon: "lucide-message-square",
  //   active:
  //     user && user.value?.login
  //       ? route.path === localePath(`/${user.value.login}/comments`)
  //       : false,
  //   onSelect() {
  //     navigateTo(localePath(`/${user.value?.login}/comments`));
  //   },
  // },
  {
    label: t("user.logout"),
    icon: "i-lucide-log-out",
    onClick() {
      clear();
    },
  },
];
</script>
