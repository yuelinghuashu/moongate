<!-- 评论组件 -->
<template>
  <details ref="containerRef" @toggle="onDetailsToggle($event)">
    <summary class="text-center">{{ t("comment.section") }}</summary>

    <!-- 评论输入框 -->
    <UTextarea
      ref="commentInputRef"
      v-model="comment"
      autoresize
      :rows="1"
      :maxrows="15"
      variant="outline"
      class="w-full mt-4 mb-2"
      :placeholder="t('comment.placeholder')"
    />

    <!-- 评论按钮 -->
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <UKbd value="ENTER" />
        <span>&nbsp;{{ t("comment.newLine") }}</span>
      </div>

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

    <!-- 评论列表 -->

    <div
      v-if="commentList?.data.length"
      class="max-h-150 overflow-y-auto mt-4 space-y-2"
    >
      <div
        v-for="item in commentList?.data"
        :key="item.id"
        class="flex flex-row items-start gap-2"
        :class="item.user?.username === user.login ? 'flex-row-reverse' : ''"
      >
        <!-- 头像（始终在最左边/最右边） -->
        <UUser
          :name="item.user?.username"
          :description="
            item.user?.is_admin ? t('comment.admin') : t('comment.commenter')
          "
          :ui="{
            description: item.user?.username === user.login ? 'text-right' : '',
          }"
        />

        <!-- 评论内容 -->
        <ArticleMarkdownRenderer
          :content="item.content"
          class="max-w-[70%] max-h-120 overflow-auto"
        />
      </div>
    </div>
    <div v-else class="text-center mt-4">{{ t("comment.noComments") }}</div>
  </details>
</template>

<script lang="ts" setup>
import type { ApiResponse } from "~/utils/type";
import { watchDebounced } from "@vueuse/core";

const { t } = useI18n();
const { containerRef, onDetailsToggle } = useDetailsScroll();
const { loggedIn, user } = useUserSession();

const prop = defineProps({
  permalink: {
    type: String,
    required: true,
  },
});

const _ = containerRef;

// 获取评论输入框模板引用
const commentInputRef = useTemplateRef("commentInputRef");

// 注册快捷键
defineShortcuts({
  "/": () => commentInputRef.value?.textareaRef?.focus(),
});

onMounted(() => {
  if (sessionStorage.getItem(`comment-draft-${prop.permalink}`)?.length) {
    comment.value =
      sessionStorage.getItem(`comment-draft-${prop.permalink}`) || "";
  }
});

// 评论内容
const comment = ref<string>("");

// ==================== 事件处理 ====================
/**
 * 获取评论列表
 */
const { data: commentList, refresh } = await useFetch("/api/comment/get", {
  method: "get",
  query: { permalink: prop.permalink },
});
// console.log(commentList.value?.data);
const content = commentList.value.data.map((item) => item.content);
console.log(content);

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
    const response = await $fetch<ApiResponse>("/api/comment/post", {
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
watchDebounced(
  comment,
  (newValue) => {
    if (newValue.trim())
      sessionStorage.setItem(`comment-draft-${prop.permalink}`, newValue);
    else sessionStorage.removeItem(`comment-draft-${prop.permalink}`);
  },
  { debounce: 500 },
);
</script>
