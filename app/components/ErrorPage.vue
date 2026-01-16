<template>
  <UError
    :error="{
      statusCode: 404,
      statusMessage: $tm('errorPage.statusMessage.loc.source'),
      message: $tm('errorPage.message.loc.source'),
    }"
  >
    <template #links>
      <UButton
        size="xl"
        @click="navigateTo(locale === 'zh_cn' ? `/` : `/${locale}`)"
        >{{$tm('errorPage.backToHome.loc.source')}}</UButton
      >
    </template>
  </UError>
</template>

<script lang="ts" setup>
const { locale } = useI18n();
</script>
