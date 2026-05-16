// server/api/comment/timeline.get.ts
import { db } from '~/../server/database/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const { permalink } = getQuery(event)
  if (!permalink) throw createError({ status: 400, statusText: '缺少 permalink' })

  // 1. 获取所有评论（带作者信息）
  const commentsData = await db
    .selectFrom('comments')
    .leftJoin('users', 'users.id', 'comments.user_id')
    .select([
      'comments.id',
      sql`'comment'`.as('type'),
      'comments.content',
      'comments.created_at',
      'users.username',
      'users.is_admin',
      sql`NULL`.as('target_id'),
      sql`NULL`.as('target_type'),
    ])
    .where('comments.permalink', '=', permalink as string)
    .execute()

  console.log(commentsData)

  // 2. 获取所有回复（带作者信息，包括回复的回复）
  const repliesData = await db
    .selectFrom('replies')
    .leftJoin('users', 'users.id', 'replies.user_id')
    .select([
      'replies.id',
      sql`'reply'`.as('type'),
      'replies.content',
      'replies.created_at',
      'users.username',
      'users.is_admin',
      'replies.target_id',
      'replies.target_type',
    ])
    .where('replies.permalink', '=', permalink as string)
    .execute()

  // 3. 合并并按时间排序
  const timeline = [...commentsData, ...repliesData].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // 4. 可选：为每条回复补充 reply_to 的简要信息（被回复的用户名、内容片段）
  // 为了性能，可以额外构建两个 Map，或者交给前端处理。这里给出后端一次性构建的示例：

  // 构建所有评论和回复的映射（id -> 基本信息）
  const objectMap = new Map<number, { username: string | null; content: string }>()
  for (const c of commentsData) {
    objectMap.set(c.id, { username: c.username, content: c.content })
  }
  for (const r of repliesData) {
    objectMap.set(r.id, { username: r.username, content: r.content })
  }

  // 为每条回复附加 replyTo 信息
  const enrichedTimeline = timeline.map(item => {
    if (item.type === 'reply' && item.target_id) {
      const target = objectMap.get(item.target_id)
      if (target) {
        return {
          ...item,
          reply_to: {
            type: item.target_type,
            username: target.username,
            excerpt: target.content.substring(0, 100) + (target.content.length > 100 ? '…' : ''),
          },
        }
      }
    }
    return item
  })

  return {
    success: true,
    status: 200,
    message: '获取评论成功',
    data: enrichedTimeline,
  }
})