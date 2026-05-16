<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4">
    <Container class="text-center">
      <div class="text-9xl font-bold text-primary mb-4">404</div>
      <h1 class="text-3xl font-semibold mb-2">
        {{ t("errorPage.statusMessage") }}
      </h1>
      <p class="text-dim mb-8">{{ t("errorPage.message") }}</p>
      <Button variant="filled" color="primary" size="md" @click="goHome">
        {{ t("errorPage.backToHome") }}
      </Button>
    </Container>
  </div>
</template>

<script setup lang="ts">
import { Button, Container } from "moongate-vue";

const { t } = useI18n();
const localePath = useLocalePath();

const goHome = () => {
  navigateTo(localePath("/"));
};
</script>
