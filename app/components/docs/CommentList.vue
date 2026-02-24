<!-- 评论列表组件 -->
<template>
  <div class="max-h-150 overflow-y-auto mt-4 space-y-2">
    <div
      v-for="item in prop.commentList"
      :key="item.id"
      class="flex flex-row items-start gap-2"
      :class="
        user && item.user?.username === user.login ? 'flex-row-reverse' : ''
      "
    >
      <!-- 头像（始终在最左边/最右边） -->
      <UUser
        :name="item.user?.username"
        :description="
          item.user?.is_admin ? t('comment.admin') : t('comment.commenter')
        "
        :ui="{
          description:
            user && item.user?.username === user.login ? 'text-right' : '',
        }"
      />
      <!-- 评论内容 -->
      <docsMarkdownRenderer
        :content="item.content"
        class="max-w-[70%] max-h-120 overflow-auto"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const { user } = useUserSession();
const { t } = useI18n();

const prop = defineProps({
  commentList: {
    type: Array,
    required: true,
  },
});
</script>
