<template>
  <div class="max-h-150 overflow-y-auto mt-4 space-y-4">
    <!-- 评论卡片 -->
    <div
      v-for="item in commentStore.commentList"
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

      <!-- 主容器 - 根据评论归属决定左右布局 -->
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

        <!-- 内容主体区 - 添加宽度控制和溢出滚动 -->
        <div class="flex-1 min-w-0 space-y-2">
          <!-- 作者信息行 - 自动调整内部顺序 -->
          <div
            class="flex items-center gap-2"
            :class="isOwnComment(item) ? 'flex-row-reverse' : ''"
          >
            <!-- 用户名（加粗突出）- 添加文本截断防止过长 -->
            <span
              class="font-mono text-xs font-bold text-ui-text truncate max-w-37.5"
            >
              {{ item.user?.username }}
            </span>

            <!-- 角色徽章（半透明像素风格） -->
            <span
              class="text-[9px] px-1 bg-ui-primary/10 text-ui-primary border border-ui-primary/20 whitespace-nowrap"
            >
              {{ getUserRole(item) }}
            </span>
          </div>

          <!-- 评论内容容器 - 处理宽度和高度溢出 -->
          <div
            class="w-full"
            :class="isOwnComment(item) ? 'flex justify-end' : ''"
          >
            <!-- 内容包装器 - 控制整体位置但不影响内部代码块 -->
            <div
              class="text-ui-text/90 text-sm leading-relaxed wrap-break-word overflow-auto max-h-75"
              :class="isOwnComment(item) ? 'text-right' : ''"
              style="max-width: 80%; min-width: 200px"
            >
              <!-- 用 div 包裹 Markdown 渲染器，并强制代码块左对齐 -->
              <div
                class="[&_pre]:text-left [&_code]:text-left [&_pre_code]:text-left"
              >
                <docsMarkdownRenderer :content="item.content" />
              </div>
            </div>
          </div>

          <!-- 操作栏 -->
          <div class="flex items-center gap-2 justify-end">
            <button
              class="text-xs text-ui-primary hover:text-ui-primary/80 transition-colors whitespace-nowrap cursor-pointer"
              @click="toggleReply(item.id, item.type)"
            >
              {{ t("comment.actions.reply") }}
            </button>
          </div>

          <div
            v-if="
              replyingTo &&
              replyingTo.id === item.id &&
              replyingTo.type === item.type
            "
          >
            <DocsCommentInputPreview
              v-model="reply"
              :permalink="commentStore.permalink"
            />
            <div class="text-right">
              <UButton
                v-if="loggedIn"
                :disabled="isReplyCommentDisabled || commentStore.submiting"
                :label="t('comment.actions.send')"
                size="lg"
                @click="handleReply()"
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

// 回复内容
const reply = ref("");

// 当前回复目标
const replyingTo = ref<{ id: number; type: string } | null>(null);

// 回复按钮是否可用
const isReplyCommentDisabled = computed(() => (reply.value ? false : true));

// 判断是否自己的评论
const isOwnComment = (item) => {
  return user.value && item.user?.username === user.value.login;
};

// 获取用户角色描述
const getUserRole = (item) => {
  return item.user?.is_admin
    ? t("comment.badge.admin")
    : t("comment.badge.commenter");
};

// 点击回复按钮，控制回复框显示/隐藏
const toggleReply = (id: number, type: string) => {
  if (replyingTo.value?.id === id && replyingTo.value?.type === type) {
    replyingTo.value = null;
  } else {
    replyingTo.value = { id, type };
  }
  reply.value = "";
};

// 发送回复
const handleReply = async () => {
  if (!replyingTo.value) return;
  const success = await commentStore.submitReply(
    replyingTo.value.id,
    replyingTo.value.type,
    reply.value,
  );
  if (success) {
    replyingTo.value = null;
    reply.value = "";
  }
};

// 监听评论列表更新，自动滚动到最新评论
const scrollToElement = (id: number, type: string) => {
  const el = document.getElementById(`${type}-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("highlight-flash");
    setTimeout(() => el.classList.remove("highlight-flash"), 1000);
  }
};
</script>

<style scoped>
/* 高亮动画 */
.highlight-flash {
  background-color: color-mix(in srgb, var(--ui-primary), transparent 90%);
  transition: background-color 0.3s ease;
}
</style>
