<template>
  <ClientOnly>
    <UForm class="space-y-6 w-100">
      <UFormField :label="$t('settings.theme.name.loc.source')" class="text-xl">
        <URadioGroup
          v-model="settings.appearance.theme"
          :items="$tm('settings.theme.options')"
          label-key="name.loc.source"
          value-key="name.loc.source"
          orientation="horizontal"
          size="xl"
          @update:model-value="(theme) => setTheme(theme)"
        />
      </UFormField>
      <UFormField
        :label="$t('settings.language.name.loc.source')"
        class="text-xl"
      >
        <URadioGroup
          v-model="settings.appearance.language"
          :items="$tm('settings.language.options')"
          label-key="name.loc.source"
          value-key="code.loc.source"
          orientation="horizontal"
          size="xl"
          @update:model-value="(lang) => setLanguage(lang)"
        />
      </UFormField>
      <UFormField
        :label="$t('settings.homePage.name.loc.source')"
        class="text-xl"
      >
        <URadioGroup
          v-model="settings.homepageBehavior"
          :items="$tm('settings.homePage.options')"
          label-key="name.loc.source"
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
const { locales } = useI18n();

const { settings, setTheme, setLanguage } = useGlobalStore();
</script>

<style scoped>
@media (max-width: 768px) {
  :deep(fieldset) {
    flex-direction: column;
  }
}
</style>
