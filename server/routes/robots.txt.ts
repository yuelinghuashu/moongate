// server/routes/robots.txt.ts
export default defineEventHandler((event) => {
  // 1. 设置正确的响应头
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')

  // 设置缓存头 - robots.txt不经常变化
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400') // 缓存24小时
  setResponseHeader(event, 'CDN-Cache-Control', 'public, max-age=604800') // CDN缓存7天

  // 2. 获取配置（优先从runtimeConfig读取）
  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl

  // 3. 构建robots.txt内容
  const robotsTxtContent = `User-agent: *
Allow: /

# 静态资源 - 有助于SEO页面渲染评估
Allow: /*.css$
Allow: /*.js$
Allow: /*.json$
Allow: /*.xml$

# 如果你的博客有这些路径，确保允许访问
Allow: /articles/
Allow: /about/

Allow: /api/sitemap.xml  # 如果sitemap也是动态生成的

# 可选的：禁止无关或可能浪费资源的路径
Disallow: /api/auth/      # 如果存在认证接口

# 最重要的：sitemap位置
Sitemap: ${baseUrl}/sitemap.xml

# 额外的搜索引擎指令（可选）
# Bing, Yandex等也支持Sitemap指令
Sitemap: ${baseUrl}/sitemap-index.xml
`.trim()

  return robotsTxtContent
})