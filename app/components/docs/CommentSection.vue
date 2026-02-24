<!-- 评论组件 -->
<template>
  <details ref="containerRef" @toggle="onDetailsToggle($event)">
    <summary class="text-center">{{ t("comment.section") }}</summary>

    <!-- 评论与预览组件 -->
    <ClientOnly>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-6">
        <!-- 左侧预览 -->
        <div class="bg-ui-bg-elevated p-4">
          <div class="text-xs font-mono text-ui-text-muted mb-2 tracking-wider">
            // {{ t("comment.preview") }}
          </div>
          <DocsMarkdownRenderer
            class="text-ui-text/90 text-base leading-relaxed"
            :content="comment"
          />
        </div>

        <!-- 右侧输入 -->
        <div class="bg-ui-bg">
          <div class="text-xs font-mono text-ui-text-muted mb-2 tracking-wider">
            // {{ t("comment.input") }}
          </div>
          <UTextarea
            v-model="comment"
            autoresize
            :rows="5"
            variant="none"
            :placeholder="t('comment.placeholder')"
            class="w-full bg-transparent border-0 focus:ring-0 p-0 text-ui-text placeholder:text-ui-text-muted/50 font-mono text-sm"
          />
        </div>
      </div>
    </ClientOnly>

    <!-- 评论按钮 -->
    <div class="flex justify-end mb-8">
      <ClientOnly v-if="loggedIn">
        <UButton
          :disabled="comment.trim().length === 0"
          :label="t('comment.sendLabel')"
          size="lg"
          @click="submitComment()"
        />
      </ClientOnly>

      <div v-else class="flex items-center gap-2">
        <p>{{ t("comment.login_to_comment") }}</p>
        <SharedLogin />
      </div>
    </div>

    <div class="mt-4 min-h-50">
      <!-- 评论列表 -->
      <DocsCommentList
        v-if="commentList?.data.length"
        :comment-list="commentList.data"
      />
      <div v-else class="text-center">{{ t("comment.noComments") }}</div>
    </div>
  </details>
</template>

<script lang="ts" setup>
import { watchDebounced } from "@vueuse/core";

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

onMounted(() => {
  if (sessionStorage.getItem(`comment-draft-${prop.permalink}`)?.length) {
    comment.value =
      sessionStorage.getItem(`comment-draft-${prop.permalink}`) || "";
  }
});

// 评论内容
const comment = ref<string>("");

// 监听评论内容变化，并保存到本地缓存
watch(
  () => comment.value,
  () => {
    sessionStorage.setItem(`comment-draft-${prop.permalink}`, comment.value);
  },
);

// ==================== 事件处理 ====================
/**
 * 获取评论列表
 */
const { data: commentList, refresh } = await useFetch("/api/comment/get", {
  method: "get",
  query: { permalink: prop.permalink },
});

/**
 * 提交评论
 */
const submitComment = async () => {
  if (comment.value.trim().length === 0) return false;

  let contentToSave = comment.value;

  // 检测是否包含 Vue 代码但没有代码块包裹
  const hasCodeBlock = /```[\s\S]*?```/.test(contentToSave);
  const hasVueCode = /<template>|<script\s+setup>/.test(contentToSave);

  if (hasVueCode && !hasCodeBlock) {
    contentToSave = "```vue\n" + contentToSave + "\n```";
  }

  try {
    const response = await $fetch("/api/comment/post", {
      method: "post",
      body: {
        content: contentToSave,
        permalink: prop.permalink,
      },
    });

    // 清空评论内容
    comment.value = "";

    if (response.success && response.data) await refresh();
    else console.error("评论失败：" + response.message);
  } catch (error) {
    // 网络错误或其他未知错误
    console.error("网络错误，请稍后重试", error);
  }
};

/**
 * 监听评论内容变化，并保存到本地缓存
 */
watchDebounced(comment, () => {}, { debounce: 500 });
</script>
