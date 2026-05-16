import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import type { Database } from './types'

const config = useRuntimeConfig()

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: config.databaseUrl,
  })
})

// 创建单例实例
export const db = new Kysely<Database>({
  dialect,
})

// 关闭连接（用于应用关闭时）
export async function destroyDb() {
  await db.destroy()
}