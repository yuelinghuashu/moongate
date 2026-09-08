<template>
  <nav class="text-center">
    <ul :class="orientation === 'horizontal' ? 'flex justify-center' : ''">
      <li v-for="item in tm('nav.items')" :key="item.id">
        <NuxtLink
          :to="localePath(item.link)"
          class="mx-2 min-w-20 nav-link"
          :class="{ active: isNavActive(localePath(item.link)) }"
          rel="noopener noreferrer"
        >
          {{ item.name }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { isNavLinkActive } from "~/utils/nav";

const { tm } = useI18nSafe();
const localePath = useLocalePath();
const route = useRoute();

/** 导航项是否处于激活态：路径段边界匹配（避免子串误命中，见 utils/nav.ts） */
const isNavActive = (href: string) => isNavLinkActive(href, route.path);

defineProps({
  orientation: {
    type: String,
    default: "horizontal",
  },
});
</script>
