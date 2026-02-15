<template>
  <div v-if="loggedIn">Welcome</div>
  <UButton
    label="Continue with GitHub"
    variant="solid"
    icon="lucide-github"
    size="lg"
    class="cursor-pointer"
    @click="loginWithGitHub()"
  />
</template>

<script lang="ts" setup>
import useSettingStore from "~/stores/setting";

const settingStore = useSettingStore();

const { loggedIn } = useUserSession();

// 登录 GitHub账号
const loginWithGitHub = () => {
  navigateTo("/api/auth/github", { external: true });
};

if (loggedIn) settingStore.isLoginDialogVisible = false;
</script>
