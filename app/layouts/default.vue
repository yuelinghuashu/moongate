<template>
  <div class="min-h-screen flex flex-col">
    <LayoutAppHeader />

    <Main class="mt-4">
      <Container size="xl">
        <slot />
      </Container>
    </Main>

    <LayoutAppFooter />
  </div>
</template>

<script lang="ts" setup>
import { Main, Container } from "moongate-vue";
</script>

<style scoped></style>
