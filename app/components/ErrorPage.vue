<template>
  <UError
    :error="{
      statusCode: 404,
      statusMessage: t('errorPage.statusMessage'),
      message: t('errorPage.message'),
    }"
  >
    <template #links>
      <UButton
        :label="t('errorPage.backToHome')"
        size="xl"
        @click="navigateTo('/')"
        class="cursor-pointer"
      ></UButton>
    </template>
  </UError>
</template>

<script lang="ts" setup>
const { t } = useI18n();
</script>
