<!-- 语言栏选项框组件 -->
<template>
  <Popover>
    <!-- 语言选项按钮 -->
    <Icon name="tabler-language" class="cursor-pointer" />
    <template #content>
      <ul class="flex flex-col">
        <li
          v-for="item in locales"
          :key="item.code"
          class="p-2 nav-link text-center"
          :class="{ active: item.code === locale }"
        >
          <NuxtLink
            rel="noopener noreferrer"
            class="cursor-pointer"
            @click="setLanguage(item.code)"
          >
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
    </template>
  </Popover>
</template>

<script lang="ts" setup>
import { Popover } from "moongate-vue";
import useSettingStore from "~/stores/setting";

const { locales, locale } = useI18n();
const { setLanguage } = useSettingStore();
</script>
