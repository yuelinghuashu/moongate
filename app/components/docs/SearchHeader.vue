<template>
  <div
    class="flex items-center justify-between search"
    :class="isDesktop ? '' : 'flex-col'"
  >
    <Input
      v-model="search"
      :placeholder="t('docs.inputPlaceholder')"
      class="w-full"
    />

    <div
      class="flex justify-between items-center w-full gap-2"
      :class="{ 'ml-2': isDesktop }"
    >
      <Select
        v-model="searchMode"
        :options="tm('docs.searchMode')"
        label-key="name"
        value-key="value"
        class="min-w-40 px-0"
        :placeholder="t('docs.searchModePlaceholder')"
      />

      <Select
        v-model="viewMode"
        :options="tm('docs.viewMode')"
        label-key="name"
        value-key="id"
        :placeholder="t('docs.viewModePlaceholder')"
        class="min-w-25 px-0"
      />

      <!-- 过滤按钮：触发筛选面板显示/隐藏 -->
      <Button :label="t('docs.filter')" @click="emit('toggle-filter')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Button, Select, Input } from "moongate-vue";
const { t, tm } = useI18nSafe();

const search = defineModel<string>("search", { default: "" });
const searchMode = defineModel<string>("searchMode", { default: "all" });
const viewMode = defineModel<number>("viewMode", { default: 1 });

// 只读 props
defineProps({
  isDesktop: { type: Boolean, default: true },
});

const emit = defineEmits(["toggle-filter"]);
</script>
