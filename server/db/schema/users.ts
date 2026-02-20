import { pgTable, serial, varchar, boolean, timestamp } from 'drizzle-orm/pg-core'


export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  github_id: varchar('github_id', { length: 39 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull(),
  is_admin: boolean('is_admin').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;