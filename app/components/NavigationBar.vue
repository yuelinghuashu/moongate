<template>
  <nav class="text-center">
    <ul class="flex flex-col">
      <li
        v-for="item in tm('navigationBar')"
        :key="item.id"
        :class="{
          active: route.fullPath.includes(
            isDev ? item.link.loc.source : item.link,
          ),
        }"
      >
        <NuxtLink
          :to="isDev ? item.link.loc.source : item.link"
          class="text-xl cursor-pointer w-full h-full block p-4"
        >
          {{ isDev ? item.name.loc.source : item.name }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
const { tm } = useI18n();
const route = useRoute();
const isDev = import.meta.env.DEV;
</script>
