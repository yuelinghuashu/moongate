<template>
  <div v-if="loggedIn">Welcome</div>
  <UButton
    label="Continue with GitHub"
    variant="solid"
    icon="lucide-github"
    size="lg"
    :loading="isLoading"
    class="cursor-pointer"
    @click="loginWithGitHub()"
  />
</template>

<script lang="ts" setup>
const { loggedIn } = useUserSession();
const route = useRoute();

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
