<template>
  <form
    class="flex items-center justify-between search"
    :class="isDesktop ? '' : 'flex-col'"
  >
    <Input
      :model-value="search"
      :placeholder="t('docs.inputPlaceholder')"
      class="w-full"
      @update:model-value="$emit('update:search', $event)"
    />

    <div
      class="flex justify-between items-center w-full"
      :class="isDesktop ? 'ml-2 flex-1' : 'mt-2'"
    >
      <Select
        :model-value="option"
        :options="tm('docs.option')"
        label-key="name"
        value-key="id"
        class="min-w-40"
        :placeholder="t('docs.optionPlaceholder')"
        @update:model-value="$emit('update:option', $event)"
      />

      <Select
        :model-value="viewMode"
        :options="tm('docs.viewMode')"
        label-key="name"
        value-key="id"
        :placeholder="t('docs.viewModePlaceholder')"
        class="ml-2 min-w-25"
        @update:model-value="$emit('update:viewMode', $event)"
      />

      <!-- 过滤按钮：触发筛选面板显示/隐藏 -->
      <Button
        type="button"
        :label="t('docs.filter')"
        class="ml-2!"
        @click="$emit('toggle-filter')"
      />
    </div>
  </form>
</template>

<script setup>
import { Button, Select, Input } from "moongate-vue";
const { t, tm } = useI18nSafe();

const props = defineProps({
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
