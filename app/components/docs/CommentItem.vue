<template>
  <div :id="`${item.type}-${item.id}`" class="group relative py-6 border-b border-ui-border/30 hover:bg-ui-bg-hover transition-all">
    <!-- 引用块（仅回复类型显示） -->
    <div
      v-if="item.type === 'reply' && item.reply_to"
      class="mb-2 pl-3 text-sm text-ui-text-muted border-l-2 border-ui-border/50 cursor-pointer"
      @click="scrollToElement(item.reply_to.id, item.reply_to.type)"
    >
      <span class="font-medium">@{{ item.reply_to.username }}</span>：
      <span class="italic">{{ item.reply_to.excerpt }}</span>
    </div>

    <!-- 主容器：当前用户发表的评论靠右对齐 -->
    <div class="flex items-start gap-4" :class="{ 'flex-row-reverse': isOwn }">
      <!-- 时间元数据区 -->
      <div class="w-20 shrink-0 font-mono text-[10px] text-ui-text-muted mt-1 leading-tight">
        <div class="text-ui-primary/60">{{ dayjs(item.created_at).format("MM-DD HH:mm") }}</div>
      </div>

      <!-- 内容主体区 -->
      <div class="flex-1 min-w-0 space-y-2">
        <!-- 作者信息行 -->
        <div class="flex items-center gap-2" :class="{ 'flex-row-reverse': isOwn }">
          <span class="font-mono text-xs font-bold text-ui-text truncate max-w-37.5">
            {{ item.username }}
          </span>
          <span class="text-[9px] px-1 bg-ui-primary/10 text-ui-primary border border-ui-primary/20">
            {{ roleLabel }}
          </span>
        </div>

        <!-- 评论内容（支持 Markdown 渲染） -->
        <div class="w-full" :class="{ 'flex justify-end': isOwn }">
          <div class="text-ui-text/90 text-sm leading-relaxed wrap-break-word overflow-auto max-h-75" :class="{ 'text-right': isOwn }" style="max-width: 80%; min-width: 200px">
            <div class="[&_pre]:text-left [&_code]:text-left [&_pre_code]:text-left">
              <DocsMarkdownRenderer :content="item.content" />
            </div>
          </div>
        </div>

        <!-- 操作栏 -->
        <div class="flex items-center gap-2 justify-end">
          <button
            class="text-xs text-ui-primary hover:text-ui-primary/80 transition-colors whitespace-nowrap cursor-pointer"
            @click="$emit('reply', item.id, item.type)"
          >
            {{ t("comment.actions.reply") }}
          </button>
        </div>

        <!-- 回复输入框（点击回复按钮后显示） -->
        <div v-if="showReplyInput" class="mt-3">
          <DocsCommentInputPreview
            :model-value="commentStore.replyContent"
            :permalink="commentStore.permalink"
            @update:model-value="handleReplyContentChange"
          />
          <div v-if="commentStore.replyError" class="mt-2 text-xs font-mono text-ui-error">
            // {{ commentStore.replyError }}
          </div>
          <div class="text-right mt-2">
            <Button
              v-if="loggedIn"
              :disabled="isReplyDisabled"
              :label="t('comment.actions.send')"
              @click="$emit('submit-reply')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { Button } from "moongate-vue";
import useCommentStore from "~/stores/comment";

const { t } = useI18n();
const { loggedIn } = useUserSession();
const commentStore = useCommentStore();

const props = defineProps<{
  item: any
  isOwn: boolean
  roleLabel: string
}>()

const emit = defineEmits<{
  reply: [id: number, type: string]
  'submit-reply': []
}>()

// 是否显示回复输入框
const showReplyInput = computed(() => 
  commentStore.replyingTo?.id === props.item.id && 
  commentStore.replyingTo?.type === props.item.type
)

const handleReplyContentChange = (value: string) => {
  commentStore.updateReplyContent(value)
}

const isReplyDisabled = computed(() => {
  const { valid } = commentStore.getReplyValidation()
  return !commentStore.replyContent?.trim() || !valid || commentStore.submitting
})

const scrollToElement = (id: number, type: string) => {
  const el = document.getElementById(`${type}-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" })
    el.classList.add("highlight-flash")
    setTimeout(() => el.classList.remove("highlight-flash"), 1000)
  }
}
</script>

<style scoped>
.highlight-flash {
  background-color: color-mix(in srgb, var(--ui-primary), transparent 90%);
  transition: background-color 0.3s ease;
}
</style>