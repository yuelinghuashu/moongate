// server/api/comment/timeline.get.ts
import { eq, sql } from 'drizzle-orm'
import { useDB } from '~~/server/db'
import { comments, replies, users } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const { permalink } = getQuery(event)
  if (!permalink) throw createError({ status: 400, statusText: '缺少 permalink' })

  const db = useDB()

  // 1. 获取所有评论（带作者信息）
  const commentsData = await db.select({
    id: comments.id,
    content: comments.content,
    user_id: comments.user_id,
    created_at: comments.created_at,
    user: {
      username: users.username,
      is_admin: users.is_admin,
    }
  })
    .from(comments)
    .leftJoin(users, eq(comments.user_id, users.id))
    .where(eq(comments.permalink, permalink as string))
    .orderBy(comments.created_at)

  // 2. 获取所有回复（带作者信息，同时包含 target 字段）
  const repliesData = await db.select({
    id: replies.id,
    content: replies.content,
    user_id: replies.user_id,
    created_at: replies.created_at,
    target_id: replies.target_id,
    target_type: replies.target_type,
    user: {
      username: users.username,
      is_admin: users.is_admin,
    }
  })
    .from(replies)
    .leftJoin(users, eq(replies.user_id, users.id))
    // 限制回复属于当前文章：通过递归 CTE 或简化条件（见下文说明）
    .where(sql`${replies.target_id} IN (SELECT id FROM comments WHERE permalink = ${permalink})
                OR ${replies.target_id} IN (SELECT id FROM replies r2 WHERE r2.target_id IN (SELECT id FROM comments WHERE permalink = ${permalink}))`)
    .orderBy(replies.created_at)

  // 3. 构建所有可引用对象的映射（评论 + 回复）
  const commentMap = new Map(
    commentsData.map(c => [c.id, {
      content: c.content,
      username: c.user?.username,
      type: 'comment' as const,
    }])
  )

  const replyMap = new Map(
    repliesData.map(r => [r.id, {
      content: r.content,
      username: r.user?.username,
      type: 'reply' as const,
    }])
  )

  // 4. 格式化评论数据（添加 type 字段）
  const formattedComments = commentsData.map(c => ({
    id: c.id,
    type: 'comment' as const,
    content: c.content,
    user: c.user,
    created_at: c.created_at,
  }))

  // 5. 格式化回复数据，并补充 reply_to 信息
  const formattedReplies = repliesData.map(r => {
    let target = null
    if (r.target_type === 'comment') {
      target = commentMap.get(r.target_id)
    } else {
      target = replyMap.get(r.target_id)
    }

    return {
      id: r.id,
      type: 'reply' as const,
      content: r.content,
      user: r.user,
      created_at: r.created_at,
      target_id: r.target_id,        // 保留原始目标信息（可选）
      target_type: r.target_type,
      reply_to: target ? {
        id: r.target_id,
        type: target.type,
        username: target.username,
        excerpt: target.content.substring(0, 100) + (target.content.length > 100 ? '…' : '')
      } : null,
    }
  })

  // 6. 合并并按时间排序
  const timeline = [...formattedComments, ...formattedReplies].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return {
    success: true,
    status: 200,
    message: '获取评论成功',
    data: timeline,
  }
})