import { findUserById } from '~/../server/database/repositories/users'
import { createComment } from '~/../server/database/repositories/comments'
import { validateComment } from '~/../utils/commentValidator'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)

  // 1. 验证 session
  if (!session.user?.id) {
    return { success: false, status: 401, message: '请先登录' }
  }

  // 2. 查询用户是否存在
  const user = await findUserById(session.user.id)

  if (!user) {
    await clearUserSession(event)
    return { success: false, status: 401, message: '用户不存在' }
  }

  // 3. 验证评论内容
  const content = body.content?.trim()
  if (!content) {
    return { success: false, status: 400, message: '评论内容不能为空' }
  }

  const { valid, message } = validateComment(content)
  if (!valid) {
    return { success: false, status: 400, message: message || '评论包含敏感词' }
  }

  // 4. 查询文档是否存在
  if (!body.permalink) {
    return { success: false, status: 400, message: '永久链接不能为空' }
  }

  const doc = await queryCollection(event, 'docs')
    .where('permalink', '=', body.permalink)
    .first()

  if (!doc) {
    return { success: false, status: 404, message: '文档不存在' }
  }

  // 5. 保存评论到数据库
  try {
    const newComment = await createComment({
      user_id: user.id,
      content: body.content.trim(),
      permalink: body.permalink,
    })

    return {
      success: true,
      status: 201,
      message: '评论存储成功',
      data: { ...newComment }
    }
  } catch (error) {
    console.error('评论存储失败', error)
    return { success: false, status: 500, message: '评论存储失败' }
  }
})