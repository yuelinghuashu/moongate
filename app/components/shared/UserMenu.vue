<template>
  <UDropdownMenu :items="items">
    <UButton icon="lucide:user" variant="ghost" class="cursor-pointer" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";
const localePath = useLocalePath();
const { user, clear } = useUserSession();
const { t } = useI18n();

const items = computed<DropdownMenuItem[]>(() => [
  {
    label: t("user.profile"),
    icon: "i-lucide-user",
    onSelect() {
      navigateTo(localePath(`/${user.value?.login}/profile`))
    },
  },
  {
    label: t("user.logout"),
    icon: "i-lucide-log-out",
    onSelect() {
      clear()
    },
  },
])
</script>
