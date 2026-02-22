// server/api/store-redirect.post.ts
import { parseURL } from 'ufo'

export default defineEventHandler(async (event) => {
  const { redirect } = await readBody(event);

  // 解析路径，确保是内部路径
  const parsed = parseURL(redirect)
  if (!redirect || !parsed.pathname || parsed.host) {
    return { ok: false }
  }

  await setUserSession(event, { redirect });
  return { ok: true };
})