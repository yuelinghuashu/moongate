<template>
  <nav class="text-center">
    <ul :class="orientation === 'horizontal' ? 'flex justify-center' : ''">
      <li v-for="item in tm('navigationBar')" :key="item.id">
        <NuxtLink
          :to="localePath(item.link)"
          class="mx-2 min-w-20 nav-link"
          rel="noopener noreferrer"
        >
          {{ item.name }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
const { tm } = useI18nSafe();
const localePath = useLocalePath();

const props = defineProps({
  orientation: {
    type: String,
    default: "horizontal",
  },
});
</script>
