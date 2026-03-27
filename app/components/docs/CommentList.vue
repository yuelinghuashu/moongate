<template>
  <div class="max-h-150 overflow-y-auto mt-4 space-y-4">
    <div
      v-for="item in props.items"
      :id="`${item.type}-${item.id}`"
      :key="item.id"
      class="group relative py-6 border-b border-ui-border/30 hover:bg-ui-bg-hover transition-all"
    >
      <!-- 引用块（仅回复） -->
      <div
        v-if="item.type === 'reply'"
        class="mb-2 pl-3 text-sm text-ui-text-muted border-l-2 border-ui-border/50 cursor-pointer"
        @click="scrollToElement(item.reply_to.id, item.reply_to.type)"
      >
        <span class="font-medium">@{{ item.reply_to.username }}</span
        >：
        <span class="italic">{{ item.reply_to.excerpt }}</span>
      </div>

      <!-- 主容器 -->
      <div
        class="flex items-start gap-4"
        :class="isOwnComment(item) ? 'flex-row-reverse' : ''"
      >
        <!-- 时间元数据区 -->
        <div
          class="w-20 shrink-0 font-mono text-[10px] text-ui-text-muted mt-1 leading-tight"
        >
          <div class="text-ui-primary/60">
            {{ dayjs(item.created_at).format("MM-DD HH:mm") }}
          </div>
        </div>

        <!-- 内容主体区 -->
        <div class="flex-1 min-w-0 space-y-2">
          <!-- 作者信息行 -->
          <div
            class="flex items-center gap-2"
            :class="isOwnComment(item) ? 'flex-row-reverse' : ''"
          >
            <span
              class="font-mono text-xs font-bold text-ui-text truncate max-w-37.5"
            >
              {{ item.user?.username }}
            </span>
            <span
              class="text-[9px] px-1 bg-ui-primary/10 text-ui-primary border border-ui-primary/20 whitespace-nowrap"
            >
              {{ getUserRole(item) }}
            </span>
          </div>

          <!-- 评论内容 -->
          <div
            class="w-full"
            :class="isOwnComment(item) ? 'flex justify-end' : ''"
          >
            <div
              class="text-ui-text/90 text-sm leading-relaxed wrap-break-word overflow-auto max-h-75"
              :class="isOwnComment(item) ? 'text-right' : ''"
              style="max-width: 80%; min-width: 200px"
            >
              <div
                class="[&_pre]:text-left [&_code]:text-left [&_pre_code]:text-left"
              >
                <DocsMarkdownRenderer :content="item.content" />
              </div>
            </div>
          </div>

          <!-- 操作栏 -->
          <div class="flex items-center gap-2 justify-end">
            <button
              class="text-xs text-ui-primary hover:text-ui-primary/80 transition-colors whitespace-nowrap cursor-pointer"
              @click="handleToggleReply(item.id, item.type)"
            >
              {{ t("comment.actions.reply") }}
            </button>
          </div>

          <!-- 回复输入框 -->
          <div
            v-if="
              commentStore.replyingTo &&
              commentStore.replyingTo.id === item.id &&
              commentStore.replyingTo.type === item.type
            "
          >
            <DocsCommentInputPreview
              v-model="replyLocal"
              :permalink="commentStore.permalink"
            />
            <div
              v-if="commentStore.replyError"
              class="mt-2 text-xs font-mono text-ui-error"
            >
              // {{ commentStore.replyError }}
            </div>
            <div class="text-right mt-2">
              <UButton
                v-if="loggedIn"
                :disabled="isReplyDisabled"
                :label="t('comment.actions.send')"
                size="lg"
                @click="handleSubmitReply"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import useCommentStore from "~/stores/comment";

const commentStore = useCommentStore();
const { user, loggedIn } = useUserSession();
const { t } = useI18n();

const props = defineProps({
  items: { type: Array, required: true },
});

// 本地绑定回复内容
const replyLocal = computed({
  get: () => commentStore.replyContent,
  set: (val) => commentStore.updateReplyContent(val),
});

// 计算属性：回复按钮是否可用
const isReplyDisabled = computed(() => {
  const { valid } = commentStore.getReplyValidation();
  return (
    !commentStore.replyContent?.trim() || !valid || commentStore.submitting
  );
});

// 工具函数
const isOwnComment = (item: any): boolean => {
  return user.value && item.user?.username === user.value.login;
};

const getUserRole = (item: any): string => {
  return item.user?.is_admin
    ? t("comment.badge.admin")
    : t("comment.badge.commenter");
};

// 事件处理
const handleToggleReply = (id: number, type: string): void => {
  if (
    commentStore.replyingTo?.id === id &&
    commentStore.replyingTo?.type === type
  ) {
    commentStore.clearReply();
  } else {
    commentStore.setReplyingTo(id, type);
  }
};

const handleSubmitReply = async (): Promise<void> => {
  await commentStore.submitReply();
};

// 滚动到引用元素
const scrollToElement = (id: number, type: string): void => {
  const el = document.getElementById(`${type}-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("highlight-flash");
    setTimeout(() => el.classList.remove("highlight-flash"), 1000);
  }
};
</script>

<style scoped>
.highlight-flash {
  background-color: color-mix(in srgb, var(--ui-primary), transparent 90%);
  transition: background-color 0.3s ease;
}
</style>
