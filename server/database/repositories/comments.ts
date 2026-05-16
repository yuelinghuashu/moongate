import { db } from '../db'
import type { NewComment, CommentUpdate } from '../types'

export async function findCommentById(id: number) {
  return await db
    .selectFrom('comments')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}

export async function findCommentsByPermalink(permalink: string) {
  return await db
    .selectFrom('comments')
    .where('permalink', '=', permalink)
    .selectAll()
    .orderBy('created_at', 'asc')
    .execute()
}

export async function createComment(comment: NewComment) {
  return await db
    .insertInto('comments')
    .values({
      ...comment,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateComment(id: number, updateWith: CommentUpdate) {
  return await db
    .updateTable('comments')
    .set(updateWith)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
}

export async function deleteComment(id: number) {
  // 先删除该评论下的所有回复（因为外键没有 ON DELETE CASCADE）
  await db
    .deleteFrom('replies')
    .where('target_id', '=', id)
    .where('target_type', '=', 'comment')
    .execute()

  return await db
    .deleteFrom('comments')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
}