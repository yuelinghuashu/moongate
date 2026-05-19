<template>
  <div class="mb-4 text-xs font-mono text-muted">
    <div class="flex justify-between items-center gap-3 mb-1">
      <div class="flex gap-3">
        <span>// Created At {{ formattedDate }}</span>
        <span>// {{ level }}</span>
      </div>
      <Button
        :label="buttonText"
        variant="outline"
        :class="copied ? 'text-primary' : 'text-muted hover:text-primary'"
        :disabled="copied"
        @click="handleShare"
      />
    </div>
    <div class="wrap-break-word">// {{ tagsFormatted }}</div>
  </div>
</template>

<script lang="ts" setup>
import { Button } from "moongate-vue";
import dayjs from "dayjs";

const props = defineProps({
  date: { type: String, required: true },
  level: { type: String, required: true },
  tags: { type: Array, default: () => [] },
});

// 分享按钮的 UI 状态：是否已复制成功
const copied = ref(false);

// 定时器 ID，用于清理自动恢复的延迟任务
let timeoutId: ReturnType<typeof setTimeout> | null = null;

// 按钮文字：复制成功后临时切换为提示文案
const buttonText = computed(() => (copied.value ? "// Copied" : "// SHARE"));

// 点击分享按钮
const handleShare = async () => {
  if (copied.value) return;

  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;

    // 3 秒后自动恢复按钮文字
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      copied.value = false;
    }, 3000);
  } catch (error) {
    console.error("复制失败", error);
  }
};

// 格式化日期
const formattedDate = computed(() => dayjs(props.date).format("YYYY-MM-DD"));

// 格式化标签
const tagsFormatted = computed(() => props.tags.join(" · "));
</script>