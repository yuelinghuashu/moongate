// stores/comment.ts
import { validateComment } from "~/../utils/commentValidator";

interface Comment {
  id: number;
  type: "comment" | "reply";
  content: string;
  created_at: string;
  user?: {
    username: string;
    is_admin?: boolean;
  };
  reply_to?: {
    id: number;
    type: string;
    username: string;
    excerpt: string;
  };
}

interface ValidationResult {
  valid: boolean;
  message: string;
}

export const useCommentStore = defineStore("comment", () => {
  // ==================== 状态 ====================
  const comment = ref<string>("");
  const permalink = ref<string>("");
  const commentList = ref<Comment[]>([]);
  const loading = ref<boolean>(false);
  const submitting = ref<boolean>(false);

  // 回复相关状态（组件级状态，但集中管理）
  const replyContent = ref<string>("");
  const replyingTo = ref<{ id: number; type: string } | null>(null);
  const replyError = ref<string>("");

  // ==================== 工具函数 ====================
  const validateContent = (content: string): ValidationResult => {
    if (!content?.trim()) {
      return { valid: false, message: "评论内容不能为空" };
    }
    const result = validateComment(content);
    return {
      valid: result.valid,
      message: result.valid ? "" : result.message || "评论包含敏感词",
    };
  };

  const wrapVueCodeIfNeeded = (content: string): string => {
    const hasCodeBlock = /```[\s\S]*?```/.test(content);
    const hasVueCode = /<template>|<script\s+setup>/.test(content);

    if (hasVueCode && !hasCodeBlock) {
      return "```vue\n" + content + "\n```";
    }
    return content;
  };

  // ==================== 回复管理 ====================
  /**
   * 设置回复目标
   */
  const setReplyingTo = (id: number | null, type?: string) => {
    if (id === null) {
      replyingTo.value = null;
      replyContent.value = "";
      replyError.value = "";
    } else if (type) {
      replyingTo.value = { id, type };
      replyContent.value = "";
      replyError.value = "";
    }
  };

  /**
   * 更新回复内容（用于实时验证）
   */
  const updateReplyContent = (content: string) => {
    replyContent.value = content;
    const { message } = validateContent(content);
    replyError.value = message;
  };

  /**
   * 获取回复验证结果
   */
  const getReplyValidation = () => {
    return validateContent(replyContent.value);
  };

  /**
   * 清空回复状态
   */
  const clearReply = () => {
    replyContent.value = "";
    replyingTo.value = null;
    replyError.value = "";
  };

  // ==================== API 请求 ====================
  const getCommentList = async (newPermalink?: string): Promise<void> => {
    if (newPermalink) permalink.value = newPermalink;
    if (!permalink.value) return;

    loading.value = true;
    try {
      const { data } = await $fetch("/api/comment/timeline", {
        method: 'GET',
        query: { permalink: permalink.value },
      });
      commentList.value = data || [];
    } catch (error) {
      console.error("获取评论列表失败：", error);
    } finally {
      loading.value = false;
    }
  };

  const submitComment = async (): Promise<boolean> => {
    const { valid, message } = validateContent(comment.value);
    if (!valid) {
      console.error(message);
      return false;
    }

    if (submitting.value) return false;

    submitting.value = true;
    const contentToSave = wrapVueCodeIfNeeded(comment.value);

    try {
      const response = await $fetch("/api/comment/post", {
        method: "POST",
        body: {
          content: contentToSave,
          permalink: permalink.value,
        },
      });

      if (response.success) {
        comment.value = "";
        await getCommentList();
        return true;
      } else {
        console.error("评论失败：", response.message);
        return false;
      }
    } catch (error) {
      console.error("网络错误，请稍后重试", error);
      return false;
    } finally {
      submitting.value = false;
    }
  };

  const submitReply = async (): Promise<boolean> => {
    if (!replyingTo.value) return false;

    const { valid, message } = validateContent(replyContent.value);
    if (!valid) {
      replyError.value = message;
      return false;
    }

    if (submitting.value) return false;

    submitting.value = true;

    try {
      const response = await $fetch("/api/reply/post", {
        method: "POST",
        body: {
          target_id: replyingTo.value.id,
          target_type: replyingTo.value.type,
          content: replyContent.value,
          permalink: permalink.value,
        },
      });

      if (response.success) {
        clearReply();
        await getCommentList();
        return true;
      } else {
        console.error("回复失败：", response.message);
        replyError.value = response.message || "回复失败";
        return false;
      }
    } catch (error) {
      console.error("网络错误，请稍后重试", error);
      replyError.value = "网络错误，请稍后重试";
      return false;
    } finally {
      submitting.value = false;
    }
  };

  // ==================== 导出 ====================
  return {
    // 状态
    comment,
    commentList,
    permalink,
    loading,
    submitting,
    // 回复状态
    replyContent,
    replyingTo,
    replyError,
    // 方法
    getCommentList,
    submitComment,
    submitReply,
    validateContent,
    setReplyingTo,
    updateReplyContent,
    getReplyValidation,
    clearReply,
  };
});

export default useCommentStore;