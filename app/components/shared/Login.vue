<template>
  <div>
    <div v-if="isLoggedIn">Welcome, {{ user?.username }}</div>
    <Button
      v-else
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
  </div>
</template>

<script lang="ts" setup>
import { Button } from "moongate-vue";
const { t } = useI18n();
const { isLoggedIn, user } = useAuth()

const isLoading = ref(false);

const loginWithGitHub = async () => {
  isLoading.value = true;
  navigateTo('/auth/github', { external: true });
};
</script>