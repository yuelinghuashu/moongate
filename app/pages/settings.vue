<template>
  <ClientOnly>
    <div class="flex justify-center">
      <UForm class="space-y-6">
        <UFormField :label="t('settings.theme.name')" class="text-xl">
          <URadioGroup
            v-model="settings.appearance.theme"
            :items="tm('settings.theme.options')"
            label-key="name"
            value-key="name"
            orientation="horizontal"
            size="xl"
            @update:model-value="(theme) => setTheme(theme)"
          />
        </UFormField>
        <UFormField :label="t('settings.language.name')" class="text-xl">
          <URadioGroup
            v-model="settings.appearance.language"
            :items="tm('settings.language.options')"
            label-key="name"
            value-key="code"
            orientation="horizontal"
            size="xl"
            @update:model-value="(lang) => setLanguage(lang)"
          />
        </UFormField>
        <UFormField :label="t('settings.homePage.name')" class="text-xl">
          <URadioGroup
            v-model="settings.homepageBehavior"
            :items="tm('settings.homePage.options')"
            label-key="name"
            value-key="id"
            orientation="horizontal"
            size="xl"
          />
        </UFormField>
      </UForm>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
import useSettingStore from "~/stores/setting";
const { t } = useI18n();
const { tm } = useI18nSafe();

const { settings, setTheme, setLanguage } = useSettingStore();

// pages/settings.vue 或对应的路由文件
useSeoMeta({
  title: "博客设置 | Moongate",
  description: "管理主题、语言及进入偏好，定制你的 Moongate 阅读体验。",
  robots: "noindex, follow", // 不索引此页，但继续跟踪页面链接
  ogTitle: "博客设置",
  ogDescription: "个性化你的 Moongate 浏览方式。"
});
</script>

<style scoped>
@media (max-width: 768px) {
  :deep(fieldset) {
    flex-direction: column;
  }
}
</style>
