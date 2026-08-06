<template>
  <h1 class="text-2xl">Welcome {{ user?.login || user?.username }}</h1>
</template>

<script lang="ts" setup>
  const { user } = useAuth()
</script>