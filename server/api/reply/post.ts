// server/api/reply/post.ts
import { findUserById } from '~/../server/database/repositories/users'
import { findCommentById } from '~/../server/database/repositories/comments'
import { findReplyById, createReply } from '~/../server/database/repositories/replies'
import { validateComment } from '~/../utils/commentValidator'


export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)

  // 参数校验
  const { target_id, target_type, content, permalink } = body
  if (!target_id || !['comment', 'reply'].includes(target_type) || !content?.trim() || !permalink) {
    throw createError({ status: 400, statusText: '参数错误（缺少 target_id/target_type/content/permalink）' })
  }

  // 登录校验
  if (!session.user?.id) throw createError({ status: 401, statusText: '请先登录' })
  const user = await findUserById(session.user.id)
  if (!user) throw createError({ status: 401, statusText: '用户不存在' })

  // 内容校验
  const trimmedContent = content.trim()
  const { valid, message } = validateComment(trimmedContent)
  if (!valid) throw createError({ status: 400, statusText: message || '回复包含敏感词' })

  // 验证目标对象存在
  if (target_type === 'comment') {
    const comment = await findCommentById(target_id)
    if (!comment) throw createError({ status: 404, statusText: '评论不存在' })
  } else {
    const reply = await findReplyById(target_id)
    if (!reply) throw createError({ status: 404, statusText: '回复不存在' })
  }

  // 直接创建回复，存入客户端传来的 permalink（即当前文档的永久链接）
  const newReply = await createReply({
    user_id: user.id,
    target_id,
    target_type,
    content: trimmedContent,
    permalink,               // 关键：直接使用客户端传入的文档 permalink
  })

  return {
    success: true,
    status: 201,
    message: '回复成功',
    data: newReply,
  }
})