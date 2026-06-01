<template>
  <div
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
      class="flex justify-between items-center w-full gap-2"
      :class="{ 'ml-2': isDesktop }"
    >
      <Select
        :model-value="option"
        :options="tm('docs.option')"
        label-key="name"
        value-key="id"
        class="min-w-40 px-0"
        :placeholder="t('docs.optionPlaceholder')"
        @update:model-value="$emit('update:option', $event)"
      />

      <Select
        :model-value="viewMode"
        :options="tm('docs.viewMode')"
        label-key="name"
        value-key="id"
        :placeholder="t('docs.viewModePlaceholder')"
        class="min-w-25 px-0"
        @update:model-value="$emit('update:viewMode', $event)"
      />

      <!-- 过滤按钮：触发筛选面板显示/隐藏 -->
      <Button :label="t('docs.filter')" @click="$emit('toggle-filter')" />
    </div>
  </div>
</template>

<script setup>
import { Button, Select, Input } from "moongate-vue";
const { t, tm } = useI18nSafe();

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
