import { eq, sql } from "drizzle-orm"
import { useDB } from "~~/server/db"
import { replies, users, comments } from "~~/server/db/schema"
import { validateComment } from '~/../utils/commentValidator'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)

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

  // 5. 验证目标是否存在，并获取根评论的 permalink（此时必然有值）
  let rootPermalink: string;
  const db = useDB();

  if (body.target_type === 'comment') {
    const comment = await db.select().from(comments).where(eq(comments.id, body.target_id)).limit(1);
    if (!comment.length) throw createError({ status: 404, statusText: '评论不存在' });
    rootPermalink = comment[0].permalink;
  } else {
    // 目标是回复，使用递归 CTE 获取根评论的 permalink
    const result = await db.execute(sql`
      WITH RECURSIVE reply_chain AS (
        SELECT id, target_id, target_type
        FROM replies
        WHERE id = ${body.target_id}
        UNION ALL
        SELECT r.id, r.target_id, r.target_type
        FROM replies r
        JOIN reply_chain rc ON rc.target_id = r.id AND rc.target_type = 'reply'
      )
      SELECT c.permalink
      FROM reply_chain rc
      JOIN comments c ON c.id = rc.target_id AND rc.target_type = 'comment'
      LIMIT 1
    `);
    if (!result.rows.length) {
      throw createError({ status: 404, statusText: '目标评论或回复不存在' });
    }
    rootPermalink = result.rows[0].permalink as string;
  }

  // 6. 保存回复到数据库，同时存储 permalink
  try {
    const [newReply] = await db.insert(replies).values({
      user_id: user.id,
      target_id: body.target_id,
      target_type: body.target_type,
      content: body.content.trim(),
      permalink: rootPermalink,
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