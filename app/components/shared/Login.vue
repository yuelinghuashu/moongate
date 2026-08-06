<template>
  <div>
    <div v-if="isLoggedIn">Welcome, {{ user?.login || user?.username }}</div>
    <Button
      v-else
      :label="t('user.login')"
      :loading="isLoading"
      show-label-while-loading
      :loading-label="t('user.loggingIn')"
      @click="loginWithGitHub()"
    >
      <template #icon>
        <Icon name="tabler:brand-github" />
      </template>
    </Button>
  </div>
</template>

<script lang="ts" setup>
import { Button } from "moongate-vue";
const { t } = useI18n();
const { isLoggedIn, user } = useAuth()

const isLoading = ref(false);

const loginWithGitHub = async () => {
  isLoading.value = true;
  try {
    await navigateTo('/auth/github', { external: true });
  } catch (error) {
    console.error("GitHub 登录跳转失败:", error);
    isLoading.value = false; // 导航失败时恢复 loading 状态
  }
};
</script>