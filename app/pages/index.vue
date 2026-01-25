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

const title = "Where Moon Meets Code";
const description =
  "推开月之门，进入一个由代码构筑的探索空间。这里记录着关于全栈开发、系统思考以及如何优雅解决复杂问题的沉思与笔记。";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
});
</script>

<style></style>
