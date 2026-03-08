const useCommentStore = defineStore('comment', () => {

  const comment = ref<string>('') // 当前输入的评论内容
  const permalink = ref<string>('') // 文档唯一标识符
  const commentList = ref()     // 评论列表
  const loading = ref(false)   // 是否正在加载评论列表
  const submiting = ref(false) // 是否正在提交评论

  /**
 * 获取评论列表
 * @param newPermalink 文档唯一标识符
 */
  const getCommentList = async (newPermalink?: string) => {
    if (newPermalink) permalink.value = newPermalink
    if (!permalink.value) return

    loading.value = true
    try {
      const { data } = await $fetch('/api/comment/timeline', {
        query: { permalink: permalink.value }
      })
      commentList.value = data || []
    } catch (error) {
      console.error('获取评论列表失败：' + error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 提交评论
   */
  const submitComment = async () => {
    if (comment.value.trim().length === 0 || submiting.value) return false;

    submiting.value = true;

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
          permalink: permalink.value,
        },
      });

      // 清空评论内容
      comment.value = "";

      if (response.success && response.data) await getCommentList()
      else console.error("评论失败：" + response.message);
    } catch (error) {
      // 网络错误或其他未知错误
      console.error("网络错误，请稍后重试", error);
    } finally {
      submiting.value = false;
    }
  };

  /**
   * 提交回复
   * @param targetId 引用的评论 ID
   * @param targetType 引用的评论类型
   * @param content 回复内容 
   */
  const submitReply = async (targetId: number, targetType: string, content: string) => {
    if (content.trim().length === 0 || submiting.value) return false

    submiting.value = true

    try {
      const response = await $fetch("/api/reply/post", {
        method: "POST",
        body: {
          target_id: targetId,
          target_type: targetType,
          content
        },
      });
      if (response.success) {
        // 刷新评论列表
        await getCommentList()
        return true
      } else {
        console.error('回复失败：' + response.message)
        return false
      }
    } catch (error) {
      console.log("网络错误，请稍后重试", error);
      return false
    } finally {
      submiting.value = false
    }
  };

  return {
    comment,
    commentList,
    permalink,
    submiting,

    getCommentList,
    submitComment,
    submitReply
  }
})

export default useCommentStore;