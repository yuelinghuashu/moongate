import { db } from '~/../server/database/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user?.id) {
    throw createError({ status: 401, statusText: '未登录' })
  }

  // 1. 获取当前用户的所有主评论
  const userComments = await db
    .selectFrom('comments')
    .select([
      'id',
      'content',
      'created_at',
      'permalink',
      sql<'comment'>`'comment'`.as('type'),
    ])
    .where('user_id', '=', session.user.id)
    .orderBy('created_at', 'desc')
    .execute()

  // 2. 获取当前用户的所有回复
  const userReplies = await db
    .selectFrom('replies')
    .select([
      'id',
      'content',
      'created_at',
      'permalink',
      'target_id',
      'target_type',
      sql<'reply'>`'reply'`.as('type'),
    ])
    .where('user_id', '=', session.user.id)
    .orderBy('created_at', 'desc')
    .execute()

  // 收集所有 permalink
  const permalinks = [
    ...userComments.map(c => c.permalink),
    ...userReplies.map(r => r.permalink)
  ]

  // 3. 批量查询文章标题
  let docMap = new Map<string, string>()
  if (permalinks.length > 0) {
    const docs = await queryCollection(event, 'docs')
      .where('permalink', 'IN', permalinks)
      .select('permalink', 'title')
      .all()
    docMap = new Map(docs.map(doc => [doc.permalink, doc.title]))
  }

  // 4. 格式化并附加文章标题
  const formattedComments = userComments.map(c => ({
    ...c,
    articleTitle: docMap.get(c.permalink) || '未知文章',
  }))

  const formattedReplies = userReplies.map(r => ({
    ...r,
    articleTitle: docMap.get(r.permalink) || '未知文章',
  }))

  // 5. 合并并按时间倒序排序
  const allItems = [...formattedComments, ...formattedReplies].sort((a, b) => {
    const aTime = a.created_at?.getTime() ?? 0
    const bTime = b.created_at?.getTime() ?? 0
    return bTime - aTime
  })

  return allItems
})