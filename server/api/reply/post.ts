import { eq } from "drizzle-orm"
import { useDB } from "~~/server/db"
import { replies, users, comments } from "~~/server/db/schema"
import { validateComment } from '~/../utils/commentValidator'


export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)

  console.log('body', body)
  console.log('session', session)

  // 1. 参数校验
  if (!body.target_id || !['comment', 'reply'].includes(body.target_type) || !body.content?.trim()) {
    throw createError({ status: 400, statusText: '参数错误' });
  }

  // 2. 验证 session
  if (!session.user?.id) throw createError({ status: 401, statusText: '请先登录' });

  // 3. 查询用户是否存在
  const user = await useDB().query.users.findFirst({
    where: eq(users.id, session.user.id)
  })

  // 4. 验证回复内容
  const content = body.content?.trim();
  if (!content) {
    return { success: false, status: 400, message: '回复内容不能为空' };
  }

  const { valid, message } = validateComment(content);
  if (!valid) {
    return { success: false, status: 400, message: message || '回复包含敏感词' };
  }

  // 5. 验证目标是否存在（并可选检查是否属于当前文档）
  if (body.target_type === 'comment') {
    const comment = await useDB().select().from(comments).where(eq(comments.id, body.target_id)).limit(1);
    if (!comment.length) throw createError({ status: 404, statusText: '评论不存在' });
  } else {
    const reply = await useDB().select().from(replies).where(eq(replies.id, body.target_id)).limit(1);
    if (!reply.length) throw createError({ status: 404, statusText: '回复不存在' });
  }

  // 6. 保存评论到数据库
  try {
    const [newReply] = await useDB().insert(replies).values({
      user_id: user.id, // 用数据库里查到的 user.id，不是 session 的
      target_id: body.target_id,
      target_type: body.target_type,
      content: body.content.trim(),
    }).returning()

    return {
      success: true,
      status: 201,
      message: '回复成功',
      data: newReply
    }

  } catch (error) {
    console.error('回复存储失败', error);
    throw createError({ status: 500, statusText: '服务器内部错误' });
  }
})