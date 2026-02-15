<template>
  <!-- 页面英雄区 -->
  <UPageHero
    :title="t('title')"
    :description="t('description')"
    :links="[
      {
        label: '// Accessing the gate',
        to: localePath('/articles'),
        target: '_self',
        trailingIcon: 'lucide-arrow-right',
        size: 'xl',
        variant: 'solid',
        color: 'primary',
      },
    ]"
  />
</template>

<script lang="ts" setup>
const { t } = useI18n();
const localePath = useLocalePath();

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
