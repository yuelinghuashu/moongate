<template>
  <UFooter>
    <template #left>
      <div>© {{ dayjs().format("YYYY") }} MOONGATE</div>
    </template>
    <template #right>
      <NuxtLink to="https://github.com/yuelinghuashu/moongate" target="_blank">
        <UIcon name="i-tabler-brand-github" />
      </NuxtLink>
    </template>
  </UFooter>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
</script>
