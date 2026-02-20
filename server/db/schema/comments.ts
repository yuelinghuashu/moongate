import { pgTable, serial, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core'
import { users } from './users'


export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  permalink: varchar('permalink', { length: 255 }).notNull(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parent_id: integer('parent_id').references((): any => comments.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
})


export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;