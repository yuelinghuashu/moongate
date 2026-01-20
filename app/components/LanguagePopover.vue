<template>
  <!-- 语言栏选项框组件 -->
  <UPopover mode="hover" arrow>
    <!-- 语言选项按钮 -->
    <UButton icon="i-tabler:language" color="neutral" variant="ghost" />
    <template #content="">
      <ul class="w-25 text-center">
        <li
          v-for="item in locales"
          :key="item.code"
          class="p-2 nav-link"
          :class="{ active: item.code === locale }"
        >
          <NuxtLink class="cursor-pointer" @click="setLanguage(item.code)">
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
    </template>
  </UPopover>
</template>

<script lang="ts" setup>
import useGlobalStore from "~/stores/global";

const { locales, locale } = useI18n();
const { setLanguage } = useGlobalStore();
</script>
