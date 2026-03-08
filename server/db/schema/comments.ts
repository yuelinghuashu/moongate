import { pgTable, serial, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core'
import { users } from './users'


export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  permalink: varchar('permalink', { length: 255 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
})


export type CommentSelect = typeof comments.$inferSelect;
export type CommentInsert = typeof comments.$inferInsert;