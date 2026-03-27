<template>
  <h1 class="text-2xl">Wecome {{ route.params.user }}</h1>
</template>

<script lang="ts" setup>
const route = useRoute();

definePageMeta({
  requiresAuth: true, // 标记需要保护
});
</script>
