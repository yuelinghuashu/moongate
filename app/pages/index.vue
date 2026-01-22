<template>
  <!-- 页面英雄区 -->
  <UPageHero
    :ui="{ container: 'mx-0' }"
    :title="t('title')"
    :description="t('description')"
    :links="[
      {
        // label: 'Get started',
        label: 'Accessing the gate',
        to: locale === 'zh_cn' ? '/articles' : `/${locale}/articles`,
        target: '_self',
        trailingIcon: 'i-lucide-arrow-right',
        size: 'xl',
        variant: buttonType,
        color: buttonColor,
      },
    ]"
  />
</template>

<script lang="ts" setup>
import useGlobalStore from "~/stores/global";

const { buttonType, buttonColor } = useGlobalStore();
const { t, locale } = useI18n();
</script>

<style></style>
