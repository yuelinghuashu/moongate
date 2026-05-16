<template>
  <div class="max-h-150 overflow-y-auto mt-4 space-y-4">
    <CommentItem
      v-for="item in items"
      :key="`${item.type}-${item.id}`"
      :item="item"
      :is-own="isOwnComment(item)"
      :role-label="getUserRole(item)"
      @reply="handleToggleReply"
      @submit-reply="handleSubmitReply()"
    />
  </div>
</template>

<script setup lang="ts">
import useCommentStore from "~/stores/comment";
import CommentItem from "./CommentItem.vue";

const { t } = useI18n();
const { user } = useUserSession();
const commentStore = useCommentStore();

const props = defineProps<{
  items: any[]
}>()

// 判断是否为当前用户发表的评论（直接使用 item.username）
const isOwnComment = (item: any) => user.value?.login === item.username

// 获取用户角色标签
const getUserRole = (item: any) => 
  item.is_admin ? t("comment.badge.admin") : t("comment.badge.commenter")

const handleToggleReply = (id: number, type: string) => {
  if (commentStore.replyingTo?.id === id && commentStore.replyingTo?.type === type) {
    commentStore.clearReply()
  } else {
    commentStore.setReplyingTo(id, type)
  }
}

const handleSubmitReply = async () => {
  await commentStore.submitReply()
}
</script>