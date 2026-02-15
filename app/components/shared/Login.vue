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
const { loggedIn } = useUserSession();

// 登录 GitHub账号
const loginWithGitHub = () => {
  navigateTo("/api/auth/github", { external: true });
};
</script>
