import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './server/db/schema.ts',  // 注意路径变化
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL,
  },
})