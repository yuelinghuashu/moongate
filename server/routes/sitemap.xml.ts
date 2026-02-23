// server/routes/sitemap.xml.ts
export default defineEventHandler(async (event) => {
  const siteUrl = useRuntimeConfig().public.siteUrl

  try {
    // 1. 获取文章数据
    const articles = await queryCollection(event, 'articles')
      .select('path', 'date') // 增加date用于lastmod
      .order('date', 'DESC')
      .all()
    const about = await queryCollection(event, 'about')
      .select('path')
      .all()

    // 获取当前时间作为lastmod（实际应用中可用最新文章的date）
    const lastmod = articles[0]?.date
      ? new Date(articles[0].date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    // 2. 构建URL数组（带优先级和更新频率）
    const urlEntries = [
      { loc: `${siteUrl}`, priority: '1.0', changefreq: 'daily', lastmod },
      { loc: `${siteUrl}/articles`, priority: '0.9', changefreq: 'weekly', lastmod },
      { loc: `${siteUrl}/about`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${siteUrl}/404`, priority: '0.1', changefreq: 'yearly' },
      ...articles.map(article => ({
        loc: `${siteUrl}${article.path}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: article.date ? new Date(article.date).toISOString().split('T')[0] : lastmod
      })),
      ...about.map(about => ({
        loc: `${siteUrl}${about.path}`,
        priority: '0.6',
        changefreq: 'monthly'
      })),
    ]

    // 3. 生成XML
    const xmlLines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    urlEntries.forEach(entry => {
      xmlLines.push('  <url>')
      xmlLines.push(`    <loc>${entry.loc}</loc>`)
      if (entry.lastmod) xmlLines.push(`    <lastmod>${entry.lastmod}</lastmod>`)
      if (entry.changefreq) xmlLines.push(`    <changefreq>${entry.changefreq}</changefreq>`)
      if (entry.priority) xmlLines.push(`    <priority>${entry.priority}</priority>`)
      xmlLines.push('  </url>')
    })

    xmlLines.push('</urlset>')
    const sitemap = xmlLines.join('\n')

    // 4. 设置响应头（优化后）
    setResponseHeader(event, 'content-type', 'application/xml')
    // sitemap 一天更新一次足够了
    setResponseHeader(event, 'Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200')
    setResponseHeader(event, 'ETag', `"${Buffer.from(sitemap).length}"`)

    return sitemap
  } catch (error) {
    console.error('生成Sitemap失败:', error)

    // 失败时返回最小化版本
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
  </url>
</urlset>`

    setResponseHeader(event, 'content-type', 'application/xml')
    // 失败时缓存时间短一些
    setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
    return fallbackSitemap
  }
})