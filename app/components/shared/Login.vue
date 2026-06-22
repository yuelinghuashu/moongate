<template>
  <div v-if="loggedIn">Welcome</div>
  <Button
    :label="t('user.login')"
    :loading="isLoading"
    show-label-while-loading
    :loading-label="t('user.loggingIn')"
    @click="loginWithGitHub()"
  >
    <template #icon>
      <Icon name="lucide-github" />
    </template>
  </Button>
</template>

<script lang="ts" setup>
import { Button } from "moongate-vue";
const { loggedIn } = useUserSession();
const route = useRoute();
const { t } = useI18n();
const isLoading = ref(false);

// 登录 GitHub账号
const loginWithGitHub = async () => {
  isLoading.value = true;

  // 将当前完整路径保存到 session
  await $fetch("/api/store-redirect", {
    method: "POST",
    body: { redirect: route.fullPath },
  });

  // 跳转到 GitHub OAuth
  navigateTo("/api/auth/github", { external: true });
};

watch(
  () => loggedIn.value,
  () => {
    if (loggedIn.value) isLoading.value = false;
  },
);
</script>
