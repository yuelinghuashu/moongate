// server/api/store-redirect.post.ts
export default defineEventHandler(async (event) => {
  const { redirect } = await readBody(event)
  // 将来源页存入 session（临时存储，不要覆盖已有用户数据）
  await setUserSession(event, { redirect })
  return { ok: true }
})