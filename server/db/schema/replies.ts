import { pgTable, serial, timestamp, integer, text } from 'drizzle-orm/pg-core'
import { users } from './users'
import { targetTypeEnum } from './enums';


export const replies = pgTable('replies', {
  id: serial('id').primaryKey(),
  target_id: integer('target_id').notNull(),
  target_type: targetTypeEnum('target_type').notNull().default('comment'),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
})


export type ReplySelect = typeof replies.$inferSelect;
export type ReplyInsert = typeof replies.$inferInsert;