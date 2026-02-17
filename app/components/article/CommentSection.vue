<!-- 评论组件 -->
<template>
  <details ref="containerRef" @toggle="onDetailsToggle($event)">
    <summary class="text-center">{{ t("comment.section") }}</summary>

    <!-- 评论输入框 -->
    <UTextarea
      ref="commentInputRef"
      v-model="comment"
      autoresize
      :maxrows="6"
      variant="outline"
      class="w-full mt-4 mb-2"
      :placeholder="t('comment.placeholder')"
    />

    <!-- 评论按钮 -->
    <div class="text-right">
      <UButton
        :disabled="comment.trim().length === 0"
        :label="t('comment.sendLabel')"
      />
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
              text: '评论功能暂无，请等待后续开发',
            },
          ]"
          role="user"
          variant="outline"
          :ui="{ container: 'pb-0' }"
        />
      </div>
    </div>
  </details>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const { containerRef, onDetailsToggle } = useDetailsScroll();

const _ = containerRef;

// 获取评论输入框模板引用
const commentInputRef = useTemplateRef("commentInputRef");

// 注册快捷键
defineShortcuts({
  "/": () => commentInputRef.value?.textareaRef?.focus(),
});

// 评论内容
const comment = ref<string>("");

// ==================== 事件处理 ====================
</script>
