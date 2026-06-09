<template>
  <ClientOnly>
    <Container size="sm" style="padding: 0">
      <div class="space-y-3">
        <h2 class="text-base font-medium">{{ t("settings.theme.name") }}</h2>
        <div :class="['flex', isDesktop ? ' gap-2' : 'flex-col space-y-2']">
          <Radio
            v-for="item in tm('settings.theme.options')"
            :key="item.id"
            v-model="settings.appearance.theme"
            :label="item.name"
            :value="item.name"
            @update:model-value="(theme) => setTheme(theme)"
          />
        </div>
      </div>

      <Divider class="my-6" />

      <div class="space-y-3">
        <h2 class="text-base font-medium">{{ t("settings.language.name") }}</h2>
        <div :class="['flex', isDesktop ? ' gap-2' : 'flex-col space-y-2']">
          <Radio
            v-for="item in tm('settings.language.options')"
            :key="item.id"
            v-model="settings.appearance.language"
            :label="item.name"
            :value="item.code"
            @update:model-value="(lang) => setLanguage(lang)"
          />
        </div>
      </div>

      <Divider class="my-6" />

      <div class="space-y-3">
        <h2 class="text-base font-medium">{{ t("settings.homePage.name") }}</h2>
        <div :class="['flex', isDesktop ? ' gap-2' : 'flex-col space-y-2']">
          <Radio
            v-for="item in tm('settings.homePage.options')"
            :key="item.id"
            v-model="settings.homepageBehavior"
            :label="item.name"
            :value="item.id"
          />
        </div>
      </div>
    </Container>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { Radio, Divider, Container } from "moongate-vue";
import useSettingStore from "~/stores/setting";
const { t } = useI18n();
const { tm } = useI18nSafe();
const { isDesktop } = useResponsive();

const { settings, setTheme, setLanguage } = useSettingStore();

// pages/settings.vue 或对应的路由文件
useSeoMeta({
  title: "设置 | Settings",
  description: "管理主题、语言及进入偏好，定制你的 Moongate 阅读体验。",
  robots: "noindex, follow", // 不索引此页，但继续跟踪页面链接
  ogTitle: "博客设置",
  ogDescription: "个性化你的 Moongate 浏览方式。",
});
</script>

<style scoped></style>
