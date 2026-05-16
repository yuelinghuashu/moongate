import { db } from '../db'
import type { NewReply, ReplyUpdate } from '../types'

export async function findReplyById(id: number) {
  return await db
    .selectFrom('replies')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}

export async function findRepliesByPermalink(permalink: string) {
  return await db
    .selectFrom('replies')
    .where('permalink', '=', permalink)
    .selectAll()
    .orderBy('created_at', 'asc')
    .execute()
}

export async function createReply(reply: NewReply) {
  return await db
    .insertInto('replies')
    .values({
      ...reply,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateReply(id: number, updateWith: ReplyUpdate) {
  return await db
    .updateTable('replies')
    .set(updateWith)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
}

export async function deleteReply(id: number) {
  // 先删除以此回复为目标的回复（嵌套回复）
  await db
    .deleteFrom('replies')
    .where('target_id', '=', id)
    .where('target_type', '=', 'reply')
    .execute()

  return await db
    .deleteFrom('replies')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
}

// 获取某个目标的所有直接回复（不递归）
export async function findRepliesByTarget(targetId: number, targetType: 'comment' | 'reply') {
  return await db
    .selectFrom('replies')
    .where('target_id', '=', targetId)
    .where('target_type', '=', targetType)
    .selectAll()
    .orderBy('created_at', 'asc')
    .execute()
}