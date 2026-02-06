<template>
  <nav class="text-center">
    <ul :class="props.orientation === 'horizontal' ? 'flex' : ''">
      <li
        v-for="item in tm('navigationBar')"
        :key="item.id"
        :class="{
          active: route.fullPath.includes(item.link?.loc?.source),
        }"
      >
        <NuxtLink
          :to="item.link?.loc?.source"
          class="block px-4 py-2"
          active-class="nav-link active"
        >
          {{ item.name?.loc?.source }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
const { tm } = useI18n();
const route = useRoute();

const props = defineProps({
  orientation: {
    type: String,
    default: "horizontal",
  },
});
</script>
