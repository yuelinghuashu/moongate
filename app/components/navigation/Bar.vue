<!-- 导航栏组件 -->
<template>
  <nav class="text-center">
    <ul :class="props.orientation === 'horizontal' ? 'flex' : ''">
      <li
        v-for="item in tm('navigationBar')"
        :key="item.id"
        :class="{
          active: route.fullPath.includes(item.link),
        }"
      >
        <NuxtLink
          :to="item.link"
          class="px-4 py-2 nav-link"
          rel="noopener noreferrer"
          active-class="active"
        >
          {{ item.name }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
const { tm } = useI18nSafe();
const route = useRoute();

const props = defineProps({
  orientation: {
    type: String,
    default: "horizontal",
  },
});
</script>
