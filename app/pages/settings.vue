<template>
  <ClientOnly>
    <UForm class="space-y-6 w-100">
      <UFormField :label="t('settings.theme.name')" class="text-xl">
        <URadioGroup
          v-model="settings.appearance.theme"
          :items="tm('settings.theme.options')"
          :label-key="isDev ? 'name.loc.source' : 'name'"
          :value-key="isDev ? 'name.loc.source' : 'name'"
          orientation="horizontal"
          size="xl"
          @update:model-value="(theme) => setTheme(theme)"
        />
      </UFormField>
      <UFormField :label="t('settings.language.name')" class="text-xl">
        <URadioGroup
          v-model="settings.appearance.language"
          :items="tm('settings.language.options')"
          :label-key="isDev ? 'name.loc.source' : 'name'"
          :value-key="isDev ? 'code.loc.source' : 'code'"
          orientation="horizontal"
          size="xl"
          @update:model-value="(lang) => setLanguage(lang)"
        />
      </UFormField>
      <UFormField :label="t('settings.homePage.name')" class="text-xl">
        <URadioGroup
          v-model="settings.homepageBehavior"
          :items="tm('settings.homePage.options')"
          :label-key="isDev ? 'name.loc.source' : 'name'"
          value-key="id"
          orientation="horizontal"
          size="xl"
        />
      </UFormField>
    </UForm>
  </ClientOnly>
</template>

<script lang="ts" setup>
import useGlobalStore from "~/stores/global";
const { tm, t } = useI18n();

const { settings, setTheme, setLanguage } = useGlobalStore();
const isDev = import.meta.env.DEV;
</script>

<style scoped>
@media (max-width: 768px) {
  :deep(fieldset) {
    flex-direction: column;
  }
}
</style>
