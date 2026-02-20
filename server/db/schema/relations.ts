import { relations } from 'drizzle-orm';
import { users, comments } from './index';  // 从 index 导入表定义

// comments 表的关系
export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.user_id],    // comments 表的 user_id
    references: [users.id]          // 关联到 users 表的 id
  })
}));

// users 表的关系（可选，以后可能要用）
export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments)  // 一个用户有多条评论
}));