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
      <div class="flex justify-end mb-8">
        <UButton
          v-if="loggedIn"
          :disabled="isCommentDisabled"
          :label="t('comment.actions.send')"
          size="lg"
          @click="commentStore.submitComment()"
        />

        <div v-else class="flex items-center gap-2">
          <p>{{ t("comment.status.login_to_comment") }}</p>
          <SharedLogin />
        </div>
      </div>
    </ClientOnly>

    <div class="mt-4 min-h-50">
      <!-- 评论列表 -->
      <DocsCommentList v-if="commentStore.commentList" />
      <div v-else class="text-center">{{ t("comment.status.noComments") }}</div>
    </div>
  </details>
</template>

<script lang="ts" setup>
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

const _ = containerRef;

const isCommentDisabled = computed(() => (commentStore.comment ? false : true));

// 当 permalink 变化时重新获取评论
watch(
  () => prop.permalink,
  (newPermalink) => {
    commentStore.getCommentList(newPermalink);
  },
  { immediate: true },
);
</script>
