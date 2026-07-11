// server/routes/robots.txt.ts
import crypto from 'crypto'

export default defineEventHandler((event) => {
  // 1. 设置正确的响应头
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')

  // 2. 获取配置
  const { siteUrl } = useRuntimeConfig().public

  // 3. 构建 robots.txt 内容
  const robotsTxtContent = `# robots.txt for MoonGate
# Generated: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`.trim()

  // 4. 计算内容的 ETag（基于内容而不是时间戳）
  const etag = `"${crypto.createHash('md5').update(robotsTxtContent).digest('hex')}"`

  // 5. 设置缓存头
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  setResponseHeader(event, 'CDN-Cache-Control', 'public, max-age=2592000')
  setResponseHeader(event, 'ETag', etag)

  return robotsTxtContent
})