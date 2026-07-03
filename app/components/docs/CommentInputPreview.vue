<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-6">
    <!-- 左侧预览 -->
    <div class="bg-ui-bg-elevated">
      <div class="text-xs font-mono text-ui-text-muted mb-2 tracking-wider">
        // {{ t("comment.input.preview") }}
      </div>
      <DocsMarkdownRenderer :content="modelValue" />
    </div>

    <!-- 右侧输入 -->
    <div>
      <div class="text-xs font-mono text-ui-text-muted mb-2 tracking-wider">
        // {{ t("comment.input.input") }}
      </div>
      <Textarea
        class="auto-grow"
        :placeholder="t('comment.input.placeholder')"
        :model-value="localValue"
        @update:model-value="handleInput"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Textarea } from "moongate-vue";
import { useDebounceFn } from "@vueuse/core";
const { t } = useI18n();

// defineModel 返回的是一个可写的 ref
const modelValue = defineModel<string>({ default: "" });

// 其他配置参数用 defineProps
const { debounceTime = 300 } = defineProps<{
  debounceTime?: number;
}>();

// 本地输入值，用于即时预览
const localValue = ref(modelValue.value);

// 监听外部变化
watch(modelValue, (val) => {
  localValue.value = val;
});

// 防抖更新
const debouncedUpdate = useDebounceFn((value: string) => {
  modelValue.value = value;
}, debounceTime);

const handleInput = (value: string) => {
  localValue.value = value;
  debouncedUpdate(value);
};
</script>

<style scoped>
.auto-grow {
  field-sizing: content;
  resize: none;
}
</style>
