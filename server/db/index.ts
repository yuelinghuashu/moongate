import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const config = useRuntimeConfig()


// 创建连接池
const pool = new Pool({
  connectionString: config.databaseUrl,
})

// 导出获取数据库实例的函数
export const useDB = () => drizzle(pool, { schema })