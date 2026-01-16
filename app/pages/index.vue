<template>
  <div class="index-container">
    <!-- 页面英雄区 -->
      <UPageHero
      :title="$t('title')"
      :description="$t('description')"
      :links="[
        {
          // label: 'Get started',
          label: 'Accessing the gate',
          to: '/articles',
          target: '_self',
          trailingIcon: 'i-lucide-arrow-right',
          size: 'xl',
          variant: buttonType,
          color: buttonColor,
        },
      ]"
    </UPageHero>
  </div>
</template>

<script lang="ts" setup>
import useGlobalStore from "~/stores/global";

const { buttonType, buttonColor } = useGlobalStore();

</script>

<style scoped>
.index-container {
  display: flex;
  flex-direction: column;
}
</style>
