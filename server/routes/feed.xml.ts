// server/routes/feed.xml.ts
import { minimarkToHtml } from '../../utils/minimarkToHtml'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl, apiUrl } = useRuntimeConfig().public

  try {
    console.log('开始获取文档...')
    const response = await $fetch(`${apiUrl}/api/docs?content=false&limit=1000`)
    const docs = response.data || []
    console.log(`获取到 ${docs.length} 篇文章`)

    // 如果没有文章，返回最小版本
    if (docs.length === 0) {
      console.warn('没有获取到任何文章')
      return getMinimalRss(siteUrl)
    }

    // 手动拼接 RSS XML - 添加 dc 命名空间
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/" 
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>MoonGate</title>
    <link>${siteUrl}</link>
    <description>Where Moon Meets Code</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`

    for (const doc of docs) {
      try {
        // 转换全文
        let fullContent = ''
        if (doc.content) {
          try {
            const htmlContent = minimarkToHtml(doc.content)
            fullContent = htmlContent ? htmlContent.replace(/]]>/g, ']]]]><![CDATA[>') : ''
          } catch (e) {
            console.error(`文章 "${doc.title}" 转换失败:`, e)
            fullContent = doc.description || ''
          }
        }

        // 构建链接
        const slug = doc.slug || doc.permalink || ''
        const link = slug ? `${siteUrl}/docs/${slug}` : siteUrl
        const guid = doc.permalink || link

        // 安全处理日期
        let pubDate
        try {
          const dateObj = new Date(doc.date)
          pubDate = isNaN(dateObj.getTime()) ? new Date().toUTCString() : dateObj.toUTCString()
        } catch (e) {
          pubDate = new Date().toUTCString()
        }

        // 安全获取字段
        const title = doc.title || '无标题'
        const description = doc.description || ''

        // 安全处理 tags
        const tags = doc.tags || []
        const tagsXml = tags.length > 0
          ? tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ')
          : ''

        rss += `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <content:encoded><![CDATA[${fullContent}]]></content:encoded>
      <description><![CDATA[${description}]]></description>
      ${tagsXml}
      ${doc.level ? `<dc:subject>${doc.level}</dc:subject>` : ''}
      ${doc.series ? `<dc:relation><![CDATA[series:${doc.series}]]></dc:relation>` : ''}
    </item>
`
      } catch (docError) {
        console.error('处理文章时出错:', docError, doc)
        continue
      }
    }

    rss += `
  </channel>
</rss>`

    setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
    return rss
  } catch (error) {
    console.error('生成 RSS Feed 失败:', error)
    setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
    return getMinimalRss(siteUrl)
  }
}, {
  maxAge: 60 * 60,
  name: 'rss-feed',
  getKey: () => 'static'
})

function getMinimalRss(siteUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/" 
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>MoonGate</title>
    <link>${siteUrl}</link>
    <description>Where Moon Meets Code</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`
}