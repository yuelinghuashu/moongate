<template>
  <ErrorPage />
</template>

<script lang="ts" setup>
if (import.meta.server) {
  const event = useRequestEvent();
  if (event) {
    setResponseStatus(event, 404);
  }
}
</script>
