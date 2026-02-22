<template>
  <details ref="containerRef" @toggle="onDetailsToggle($event)">
    <summary class="text-center">
      {{ t("coffeeTip") }}
    </summary>
    <div class="flex justify-center gap-4">
      <NuxtImg
        src="/images/ali-pay.jpg"
        alt="Ali Pay"
        class="w-32"
        loading="lazy"
      />
      <NuxtImg
        src="/images/wechat-pay.jpg"
        alt="Wechat Pay"
        class="w-32"
        loading="lazy"
      />
    </div>
  </details>
</template>

<script lang="ts" setup>
const { containerRef, onDetailsToggle } = useDetailsScroll();
const { t } = useI18n();

const _ = containerRef;
</script>
