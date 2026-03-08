import { relations } from 'drizzle-orm';
import { users, comments, replies } from './index';

// comments 表的关系
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.user_id],
    references: [users.id],
  }),
  // 指向此评论的回复（通过 target_id 和 target_type 筛选）
  // 注意：这只是一个定义，实际查询时需在 where 中添加 target_type = 'comment'
  repliesFrom: many(replies, {
    relationName: 'commentTarget',
  }),
}));

// users 表的关系（不变）
export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
  replies: many(replies),
}));

// replies 表的关系
export const repliesRelations = relations(replies, ({ one }) => ({
  user: one(users, {
    fields: [replies.user_id],
    references: [users.id],
  }),
  // 当 target_type = 'comment' 时，指向被引用的评论
  targetComment: one(comments, {
    fields: [replies.target_id],
    references: [comments.id],
    relationName: 'commentTarget', // 与 commentsRelations 中的 repliesFrom 对应
  }),
  // 当 target_type = 'reply' 时，指向被引用的回复
  targetReply: one(replies, {
    fields: [replies.target_id],
    references: [replies.id],
    relationName: 'replyTarget',
  }),
}));