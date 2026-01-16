<template>
  <nav class="text-center">
    <ul>
      <li
        v-for="item in $tm('navigationBar')"
        :key="item.id"
        class="py-4 nav-link"
        :class="{ active: route.fullPath.includes(item.link.loc.source) }"
        @click="navigateTo(item.link.loc.source)"
      >
        <NuxtLink
          :to="locale === 'zh_cn' ? '/' : `/${locale}`"
          class="text-xl cursor-pointer"
        >
          {{ item.name.loc.source }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
const { locale } = useI18n();
const route = useRoute();
</script>
