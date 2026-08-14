// server/routes/feed.xml.ts
import { useRuntimeConfig } from '#imports'
import {
  FEED_CONSTANTS,
  buildDocLink,
  buildDocId,
  docContentToCdata,
  formatDateUtc,
  getFeedDocs,
  xmlCdata,
  xmlEscape,
} from '../utils/feed'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl, apiUrl } = useRuntimeConfig().public

  try {
    const docs = await getFeedDocs(apiUrl)

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
    <title>${FEED_CONSTANTS.title}</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description>${FEED_CONSTANTS.description}</description>
    <language>${FEED_CONSTANTS.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`

    for (const doc of docs) {
      try {
        // 转换全文
        const fullContent = docContentToCdata(doc)

        // 构建链接和标识
        const link = buildDocLink(siteUrl, doc)
        const guid = buildDocId(doc, link)

        // 安全处理日期
        const pubDate = formatDateUtc(doc.date)

        // 安全获取字段（CDATA 内容需用 cdataEscape 处理，避免 ]]> 破坏 XML）
        const title = xmlCdata(doc.title || '无标题')
        const description = xmlCdata(doc.description || '')

        // 安全处理 tags（同样需要 cdataEscape）
        const tags = doc.tags || []
        const tagsXml = tags.length > 0
          ? tags.map(tag => `<category><![CDATA[${xmlCdata(tag)}]]></category>`).join('\n      ')
          : ''

        rss += `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <content:encoded><![CDATA[${fullContent}]]></content:encoded>
      <description><![CDATA[${description}]]></description>
      ${tagsXml}
      ${doc.level ? `<dc:subject>${xmlEscape(doc.level)}</dc:subject>` : ''}
      ${doc.series ? `<dc:relation><![CDATA[series:${xmlCdata(doc.series)}]]></dc:relation>` : ''}
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
    <title>${FEED_CONSTANTS.title}</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description>${FEED_CONSTANTS.description}</description>
    <language>${FEED_CONSTANTS.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`
}