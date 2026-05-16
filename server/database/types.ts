import type { ColumnType, Generated, Selectable, Insertable, Updateable } from 'kysely'

// 数据库表结构
export interface Database {
  users: UsersTable
  comments: CommentsTable
  replies: RepliesTable
}

// 用户表
export interface UsersTable {
  id: Generated<number>
  github_id: string
  username: string
  is_admin: boolean | null
  created_at: ColumnType<Date, string | undefined, never>
}

// 评论表
export interface CommentsTable {
  id: Generated<number>
  user_id: number | null
  content: string
  permalink: string
  created_at: ColumnType<Date, string | undefined, never>
}

// 回复表
export interface RepliesTable {
  id: Generated<number>
  target_id: number
  target_type: 'comment' | 'reply'
  user_id: number | null
  content: string
  permalink: string
  created_at: ColumnType<Date, string | undefined, never>
}

// 导出操作类型
export type User = Selectable<UsersTable>
export type NewUser = Insertable<UsersTable>
export type UserUpdate = Updateable<UsersTable>

export type Comment = Selectable<CommentsTable>
export type NewComment = Insertable<CommentsTable>
export type CommentUpdate = Updateable<CommentsTable>

export type Reply = Selectable<RepliesTable>
export type NewReply = Insertable<RepliesTable>
export type ReplyUpdate = Updateable<RepliesTable>