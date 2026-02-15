<template>
  <h1 class="text-2xl">Wecome {{ route.params.user }}</h1>
</template>

<script lang="ts" setup>
const route = useRoute();
</script>
