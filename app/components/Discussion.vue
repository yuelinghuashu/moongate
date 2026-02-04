<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 分隔线 -->
  <USeparator :label="t('discussionSection')" />

  <!-- 评论输入框 -->
  <UTextarea
    ref="discussionInput"
    v-model="discussion"
    autoresize
    :maxrows="6"
    variant="outline"
    class="w-full mt-4 mb-2"
    placeholder="请输入你的评论"
  />
  <!-- 评论按钮 -->
  <div class="text-right">
    <UButton :label="t('sendDiscussion')" />
  </div>

  <!-- 评论列表 -->
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
</script>
