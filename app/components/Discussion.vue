<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <USeparator :label="t('discussionSection')" />
  <UTextarea
    ref="discussionInput"
    v-model="discussion"
    autoresize
    :maxrows="6"
    variant="outline"
    class="w-full"
    placeholder="请输入你的评论 (Enter 发送，Shift+Enter 换行)"
    @keydown.enter.prevent="handleKeydown($event)"
  />

  <div class="flex justify-between items-center mt-3">
    <div class="text-sm text-gray-500 flex items-center gap-1">
      <span class="mr-2">{{ t("shortcut") }}</span>
      <UKbd value="Enter" class="text-xs" />
      <span class="mr-2">{{ t("send") }}</span>
      <UKbd value="Shift" class="text-xs" />
      <span>+</span>
      <UKbd value="Enter" class="text-xs" />
      <span>{{ t("newLine") }}</span>
    </div>
    <UButton
      :disabled="!discussion"
      variant="solid"
      class="cursor-pointer"
      @click="sendDiscussion()"
      >{{ t("sendDiscussion") }}</UButton
    >
  </div>

  <div class="mt-4">
    <div v-if="0" class="text-center">暂无评论</div>
    <div v-else class="flex items-center gap-4">
      <UUser name="MoonGate" description="网站创始人" size="3xl" />
      <UChatMessage
        id="1"
        :parts="[
          {
            type: 'text',
            id: '1',
            text: 'Hello! Welcome To MOONGATE',
          },
        ]"
        role="user"
        variant="outline"
        :ui="{ container: 'pb-0' }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n();

// 获取评论输入框模板引用
const discussionInput = useTemplateRef("discussionInput");
// 注册快捷键
defineShortcuts({
  "/": () => discussionInput.value?.textareaRef?.focus(),
});

// 评论内容
const discussion = ref<string>("");

// 评论操作按钮
const actions = ref([
  {
    label: "Copy to clipboard",
    icon: "i-lucide-copy",
  },
]);

// 监听快捷键，发送评论
const handleKeydown = (e: KeyboardEvent) => {
  if (e.shiftKey && e.key === "Enter") {
    discussion.value += "\n";
  } else if (e.key === "Enter") {
    sendDiscussion();
  }
};

// 点击按钮，发送评论事件
const sendDiscussion = () => {
  if (!discussion.value) return;
  console.log(discussion.value);
  discussion.value = "";
};
</script>
