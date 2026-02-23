// server/routes/robots.txt.ts
export default defineEventHandler((event) => {
  // 1. 设置正确的响应头
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')



  // 2. 获取配置（优先从runtimeConfig读取）
  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl

  // 3. 构建robots.txt内容
  const robotsTxtContent = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`.trim()

  // 设置缓存头 - robots.txt不经常变化
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  // CDN缓存1个月
  setResponseHeader(event, 'CDN-Cache-Control', 'public, max-age=2592000')
  // 添加ETag用于验证
  setResponseHeader(event, 'ETag', `"${Buffer.from(robotsTxtContent).length}-${Date.now()}"`)

  return robotsTxtContent
})