<!-- 评论组件 -->
<template>
  <details ref="containerRef" @toggle="onDetailsToggle($event)">
    <summary class="text-center">{{ t("comment.section") }}</summary>

    <!-- 评论与预览组件 -->
    <ClientOnly>
      <DocsCommentInputPreview
        v-model="commentStore.comment"
        :debounce-time="500"
        :permalink="prop.permalink"
        storage-type="none"
      />
    </ClientOnly>

    <!-- 评论按钮 -->
    <ClientOnly>
      <div class="flex items-start">
        <!-- 错误信息区域，占据弹性空间，内部内容为错误信息或空 -->
        <div class="flex-1">
          <div v-if="commentError" class="mt-2 text-xs font-mono text-ui-error">
            // {{ commentError }}
          </div>
        </div>

        <!-- 右侧按钮区域，始终右对齐 -->
        <div class="flex justify-end mb-8">
          <UButton
            v-if="loggedIn"
            :disabled="isCommentDisabled"
            :label="t('comment.actions.send')"
            size="lg"
            @click="handleSubmitComment"
          />
          <div v-else class="flex items-center gap-2">
            <p>{{ t("comment.status.login_to_comment") }}</p>
            <SharedLogin />
          </div>
        </div>
      </div>

      <div class="mt-4 min-h-50">
        <!-- 评论列表（已集成回复功能） -->
        <DocsCommentList v-if="commentStore.commentList?.length" />
        <div v-else class="text-center">
          {{ t("comment.status.noComments") }}
        </div>
      </div>
    </ClientOnly>
  </details>
</template>

<script lang="ts" setup>
import { watchDebounced } from "@vueuse/core";
import useCommentStore from "~/stores/comment";

const commentStore = useCommentStore();
const { t } = useI18n();
const { containerRef, onDetailsToggle } = useDetailsScroll();
const { loggedIn } = useUserSession();

const prop = defineProps({
  permalink: {
    type: String,
    required: true,
  },
});

// ==================== 状态 ====================
/** 主评论验证错误信息 */
const commentError = ref("");

// ==================== 计算属性 ====================
/** 主评论按钮是否可用 */
const isCommentDisabled = computed(() => {
  const content = commentStore.comment;
  if (!content?.trim()) return true;
  const { valid } = commentStore.validateContent(content);
  return !valid || commentStore.submitting;
});

// ==================== 事件处理 ====================
/** 提交主评论 */
const handleSubmitComment = async () => {
  const { valid, message } = commentStore.validateContent(commentStore.comment);
  if (!valid) {
    commentError.value = message;
    return;
  }
  commentError.value = "";
  await commentStore.submitComment();
};

// ==================== 实时验证主评论 ====================
/** 监听主评论内容变化，实时更新错误提示 */
watchDebounced(
  () => commentStore.comment,
  (content) => {
    if (!content?.trim()) {
      commentError.value = "";
      return;
    }
    const { message } = commentStore.validateContent(content);
    commentError.value = message;
  },
  { debounce: 300, immediate: true },
);

// ==================== 生命周期 ====================
/** 当 permalink 变化时重新获取评论 */
watch(
  () => prop.permalink,
  (newPermalink) => {
    commentStore.getCommentList(newPermalink);
  },
  { immediate: true },
);

const _ = containerRef;
</script>
