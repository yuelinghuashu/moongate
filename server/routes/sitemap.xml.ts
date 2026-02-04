// server/routes/sitemap.xml.ts
export default defineEventHandler(async (event) => {
  const siteUrl = useRuntimeConfig().public.siteUrl

  try {
    // 1. 获取文章数据
    const data = await queryCollection(event, 'articles').select('title').all()

    // 2. 构建URL数组
    const urls = [
      `${siteUrl}/`,
      `${siteUrl}/about`,
      ...data.map(article => `${siteUrl}/articles/${article.title}`),
    ]

    // 3. 生成XML（关键修改：添加换行和缩进）
    const xmlLines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    // 添加每个URL条目
    urls.forEach(url => {
      xmlLines.push('  <url>')
      xmlLines.push(`    <loc>${url}</loc>`)
      xmlLines.push('  </url>')
    })

    // 闭合标签
    xmlLines.push('</urlset>')

    // 组合成最终字符串（用换行符连接）
    const sitemap = xmlLines.join('\n')

    // 4. 设置响应头
    setResponseHeader(event, 'content-type', 'application/xml')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

    return sitemap
  } catch (error) {
    console.error('生成Sitemap失败:', error)

    // 失败时返回最小化版本（同样格式化）
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
  </url>
</urlset>`

    setResponseHeader(event, 'content-type', 'application/xml')
    return fallbackSitemap
  }
})