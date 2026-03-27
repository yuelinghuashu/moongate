<template>
  <UDropdownMenu :items="items">
    <UButton
      :ui="{ leadingIcon: 'toolbar-icon-btn' }"
      icon="lucide:user"
      variant="ghost"
      class="cursor-pointer"
    />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";
const localePath = useLocalePath();
const { user, clear } = useUserSession();
const { t } = useI18n();
const route = useRoute();

// 用户下拉菜单列表
const items = computed<DropdownMenuItem[]>(() => [
  {
    label: t("user.profile"),
    icon: "lucide-user",
    active:
      user && user.value?.login
        ? route.path === localePath(`/${user.value.login}/profile`)
        : false,
    onSelect() {
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
    onSelect() {
      clear();
    },
  },
]);
</script>
