<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-6">
    <!-- 左侧预览 -->
    <div class="bg-ui-bg-elevated">
      <div class="text-xs font-mono text-ui-text-muted mb-2 tracking-wider">
        // {{ t("comment.input.preview") }}
      </div>
      <DocsMarkdownRenderer
        class="text-ui-text/90 text-base leading-relaxed"
        :content="localValue"
      />
    </div>

    <!-- 右侧输入 -->
    <div class="bg-ui-bg">
      <div class="text-xs font-mono text-ui-text-muted mb-2 tracking-wider">
        // {{ t("comment.input.input") }}
      </div>
      <UTextarea
        :model-value="localValue"
        autoresize
        :rows="5"
        variant="none"
        :placeholder="t('comment.input.placeholder')"
        class="w-full bg-transparent border-0 focus:ring-0 p-0 text-ui-text placeholder:text-ui-text-muted/50 font-mono text-sm"
        @update:model-value="(value) => handleInput(value)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDebounceFn } from "@vueuse/core";
const { t } = useI18n();

const props = defineProps({
  modelValue: { type: String, default: "" }, // v-model 绑定的值
  debounceTime: { type: Number, default: 300 }, // 防抖延迟（毫秒），默认 300ms
  permalink: { type: String, required: true }, // 用于构建存储 key
  storageType: {
    type: String,
    default: "none",
    validator: (val: string) => ["session", "local", "none"].includes(val),
  },
});

const emit = defineEmits(["update:modelValue"]);

// 创建一个 ref 来存储本地输入值
const localValue = ref(props.modelValue);

// 监听父组件 prop 变化，同步到本地
watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal;
});

// 用防抖函数包装 emit
const debouncedEmit = useDebounceFn((value: string) => {
  emit("update:modelValue", value);
}, props.debounceTime);

// 当输入框的文本改变时
const handleInput = (value: string) => {
  localValue.value = value; // 立即更新预览
  debouncedEmit(value); // 防抖更新父组件
};
</script>
