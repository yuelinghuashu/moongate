import { eq } from "drizzle-orm";
import { useDB } from "~~/server/db";
import { comments, users } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const session = await getUserSession(event);

  console.log('body', body);
  console.log('session', session);

  // 1. 验证 session
  if (!session.user?.id) return { success: false, status: 401, message: '请先登录' };

  // 2. 查询用户是否存在
  const user = await useDB().query.users.findFirst({
    where: eq(users.id, session.user.id)
  })

  // 如果用户不存在，则清理 session 并返回 401
  if (!user) {
    // 清理无效 session
    await clearUserSession(event);
    return { success: false, status: 401, message: '用户不存在' }
  }

  // 3. 验证评论内容
  if (!body.content?.trim()) return { success: false, status: 400, message: '评论内容不能为空' }

  // 4. 查询永久链接是否存在
  if (!body.permalink) return { success: false, status: 400, message: '永久链接不能为空' }

  // 5. 保存评论到数据库
  try {
    const [comment] = await useDB().insert(comments).values({
      user_id: user.id, // 用数据库里查到的 user.id，不是 session 的
      content: body.content.trim(),
      permalink: body.permalink,
    }).returning()

    return {
      success: true,
      status: 201,
      message: '评论存储成功',
      data: { ...comment }
    }

  } catch (error) {
    console.error('评论存储失败', error);
    return { success: false, status: 500, message: '评论存储失败' }
  }
})