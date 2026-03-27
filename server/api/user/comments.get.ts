// server/api/user/comments.get.ts
import { desc, eq, sql } from "drizzle-orm";
import { useDB } from "~~/server/db";
import { comments, replies } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session.user?.id) {
    throw createError({ status: 401, statusText: "未登录" });
  }

  const db = useDB();

  // 1. 获取当前用户的所有主评论
  const userComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      created_at: comments.created_at,
      permalink: comments.permalink,
      type: sql`'comment'`.as('type'),
    })
    .from(comments)
    .where(eq(comments.user_id, session.user.id))
    .orderBy(desc(comments.created_at));

  // 2. 获取当前用户的所有回复
  const userReplies = await db
    .select({
      id: replies.id,
      content: replies.content,
      created_at: replies.created_at,
      permalink: replies.permalink,
      target_id: replies.target_id,
      target_type: replies.target_type,
      type: sql`'reply'`.as('type'),
    })
    .from(replies)
    .where(eq(replies.user_id, session.user.id))
    .orderBy(desc(replies.created_at));

  // 收集所有 permalink（现均非空）
  const permalinks = [
    ...userComments.map(c => c.permalink),
    ...userReplies.map(r => r.permalink)
  ];

  // 3. 批量查询文章标题（使用 Nuxt Content）
  let docMap = new Map<string, string>();
  if (permalinks.length > 0) {
    const docs = await queryCollection(event, 'docs')
      .where('permalink', 'IN', permalinks)
      .select('permalink', 'title')
      .all();
    docMap = new Map(docs.map(doc => [doc.permalink, doc.title]));
  }

  // 4. 格式化并附加文章标题
  const formattedComments = userComments.map(c => ({
    ...c,
    articleTitle: docMap.get(c.permalink) || '未知文章',
  }));

  const formattedReplies = userReplies.map(r => ({
    ...r,
    articleTitle: docMap.get(r.permalink) || '未知文章',
  }));

  // 5. 合并并按时间倒序排序
  const allItems = [...formattedComments, ...formattedReplies].sort((a, b) => {
    const aTime = a.created_at?.getTime() ?? 0;
    const bTime = b.created_at?.getTime() ?? 0;
    return bTime - aTime;
  });

  return allItems;
});