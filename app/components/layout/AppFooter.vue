<template>
  <UFooter>
    <template #left>
      <i class="toolbar-icon-btn"> © {{ dayjs().format("YYYY") }} MOONGATE </i>
    </template>
    <template #right>
      <NuxtLink
        to="https://github.com/yuelinghuashu/moongate"
        target="_blank"
        rel="noopener noreferrer"
        class="mr-1"
      >
        <UIcon name="tabler-brand-github" />
      </NuxtLink>
      <NuxtLink
        to="https://moongate.top/feed.xml"
        target="_blank"
        rel="noopener noreferrer"
      >
        <UIcon name="tabler:rss" />
      </NuxtLink>
    </template>
  </UFooter>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
</script>
