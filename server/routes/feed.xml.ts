// server/routes/feed.xml.ts
import { minimarkToHtml } from '../../utils/minimarkToHtml'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig().public

  const docs = await queryCollection(event, 'docs')
    .order('date', 'DESC')
    .all()

  // 手动拼接 RSS XML
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>MoonGate</title>
    <link>${siteUrl}</link>
    <description>Where Moon Meets Code</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`

  for (const doc of docs) {
    // 将 MinimarkTree 转换为 HTML
    let fullContent = ''
    if (doc.body.value) {
      try {
        fullContent = minimarkToHtml(doc.body.value).replace(/]]>/g, ']]]]><![CDATA[>') // 转义 CDATA 结束符
      } catch (e) {
        console.error('转换失败:', e)
        fullContent = doc.description || ''
      }
    }

    const link = `${siteUrl}${doc.path}`
    const date = new Date(doc.date).toUTCString()

    rss += `
    <item>
      <title><![CDATA[${doc.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${date}</pubDate>
      <content:encoded><![CDATA[${fullContent}]]></content:encoded>
      <description><![CDATA[${doc.description || ''}]]></description>
    </item>
`
  }

  rss += `
  </channel>
</rss>`

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return rss
}, {
  maxAge: 60 * 60, // 缓存1小时（单位：秒）
  name: 'rss-feed', // 缓存名称
  getKey: () => 'static' // 固定key，所有请求共享缓存
})