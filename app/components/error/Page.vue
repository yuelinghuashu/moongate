<!-- 错误页面组件 -->
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
        variant="ghost"
        class="cursor-pointer"
        @click="navigateTo(localePath('/'))"
      />
    </template>
  </UError>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const localePath = useLocalePath();
</script>
