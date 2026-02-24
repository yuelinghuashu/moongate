import { desc, eq } from "drizzle-orm"
import { useDB } from "~~/server/db"
import { comments } from "~~/server/db/schema"


export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  console.log(query)

  if (!query.permalink) return { success: false, status: 400, message: '文档标识不能为空', data: [] }

  try {
    // 查询当前文档下的评论
    const result = await useDB().query.comments.findMany({
      where: eq(comments.permalink, query.permalink as string),
      orderBy: [desc(comments.created_at)],
      with: {
        user: {
          columns: { username: true, is_admin: true }
        }
      }
    })
    if (result.length <= 0) return { success: true, status: 200, message: '评论为空', data: [] }

    return { success: true, status: 200, message: '评论获取成功', data: result }

  } catch (error) {
    console.error(error)
    return { success: false, status: 500, message: '评论获取失败', data: [] }
  }
})