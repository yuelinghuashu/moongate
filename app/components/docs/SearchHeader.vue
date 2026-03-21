<template>
  <form
    class="flex items-center justify-between search"
    :class="isDesktop ? '' : 'flex-col'"
  >
    <UInput
      :model-value="search"
      :placeholder="t('search.inputPlaceholder')"
      size="lg"
      class="w-full"
      @update:model-value="$emit('update:search', $event)"
    >
      <template v-if="search?.length" #trailing>
        <UButton
          color="neutral"
          variant="ghost"
          icon="lucide-circle-x"
          aria-label="Clear input"
          @click="$emit('update:search', '')"
        />
      </template>
    </UInput>

    <div
      class="flex justify-between items-center w-full"
      :class="isDesktop ? 'ml-2 flex-1' : 'mt-2'"
    >
      <USelect
        :model-value="option"
        :items="tm('search.option')"
        label-key="name"
        value-key="id"
        size="lg"
        :placeholder="t('search.optionPlaceholder')"
        class="flex-1"
        @update:model-value="$emit('update:option', $event)"
      />

      <USelect
        :model-value="viewMode"
        :items="tm('search.viewMode')"
        label-key="name"
        value-key="id"
        size="lg"
        :placeholder="t('search.viewModePlaceholder')"
        class="ml-2"
        @update:model-value="$emit('update:viewMode', $event)"
      />

      <UButton
        label="筛选"
        size="lg"
        variant="solid"
        class="ml-2"
        @click="$emit('toggle-filter')"
      />
    </div>
  </form>
</template>

<script setup>
const { t } = useI18n();
const { tm } = useI18nSafe();

defineProps({
  search: { type: String, default: "" },
  option: { type: Number, default: 1 },
  viewMode: { type: Number, default: 1 },
  isDesktop: { type: Boolean, default: true },
});

defineEmits([
  "update:search",
  "update:option",
  "update:viewMode",
  "toggle-filter",
]);
</script>
