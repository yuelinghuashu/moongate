// server/routes/sitemap.xml.ts
import { escapeXml } from '../../app/utils/xml'
import { fetchDocs } from '../utils/docs'

interface AboutPage {
  slug?: string
  path?: string
}

interface AboutResponse {
  data?: AboutPage[]
}

export default defineEventHandler(async (event) => {
  const { siteUrl, apiUrl } = useRuntimeConfig().public

  try {
    // 1. 获取文档数据
    const docs = await fetchDocs(apiUrl, { includeContent: false })

    // 获取 about 页面数据
    const aboutResponse = await $fetch<AboutResponse>(`${apiUrl}/api/about`)
    const about = aboutResponse.data || []

    // 获取当前时间作为 lastmod
    const lastmod = docs[0]?.date
      ? new Date(docs[0].date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    // 2. 构建 URL 数组（带优先级和更新频率）
    const urlEntries = [
      {
        loc: `${siteUrl}`,
        priority: '1.0',
        changefreq: 'daily',
        lastmod
      },
      {
        loc: `${siteUrl}/docs`,
        priority: '0.9',
        changefreq: 'weekly',
        lastmod
      },
      {
        loc: `${siteUrl}/about`,
        priority: '0.5',
        changefreq: 'monthly'
      },
      {
        loc: `${siteUrl}/404`,
        priority: '0.1',
        changefreq: 'yearly'
      },
      // 文档页面 - 使用 slug 构建链接
      ...docs.map((doc) => ({
        loc: `${siteUrl}/docs/${doc.slug}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: doc.date ? new Date(doc.date).toISOString().split('T')[0] : lastmod
      })),
      // 英文译文页面 - 仅存在英文译文的文档
      ...docs
        .filter((doc) => doc.hasTranslation)
        .map((doc) => ({
          loc: `${siteUrl}/en/docs/${doc.slug}`,
          priority: '0.8',
          changefreq: 'monthly',
          lastmod: doc.date ? new Date(doc.date).toISOString().split('T')[0] : lastmod
        })),
      // about 页面
      ...about.map((page) => ({
        loc: `${siteUrl}/about/${page.slug || page.path}`,
        priority: '0.6',
        changefreq: 'monthly'
      })),
    ]

    // 3. 生成 XML（优化性能）
    const xmlLines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    // 批量生成 URL 节点
    for (const entry of urlEntries) {
      xmlLines.push('  <url>')
      xmlLines.push(`    <loc>${escapeXml(entry.loc)}</loc>`)
      if (entry.lastmod) {
        xmlLines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`)
      }
      if (entry.changefreq) {
        xmlLines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`)
      }
      if (entry.priority) {
        xmlLines.push(`    <priority>${escapeXml(entry.priority)}</priority>`)
      }
      xmlLines.push('  </url>')
    }

    xmlLines.push('</urlset>')
    const sitemap = xmlLines.join('\n')

    // 4. 设置响应头
    setResponseHeader(event, 'content-type', 'application/xml')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200')
    setResponseHeader(event, 'ETag', `"${Buffer.from(sitemap).length}"`)

    return sitemap
  } catch (error) {
    console.error('生成 Sitemap 失败:', error)

    // 失败时返回最小化版本
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    setResponseHeader(event, 'content-type', 'application/xml')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
    return fallbackSitemap
  }
})