import {
  FEED_CONSTANTS,
  buildDocLink,
  buildDocId,
  docContentToCdata,
  formatDateIso,
  getFeedDocs,
  xmlCdata,
  xmlEscape,
} from '../utils/feed'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl, apiUrl } = useRuntimeConfig().public

  try {
    const docs = await getFeedDocs(apiUrl)

    // 获取最新更新时间
    const updated = docs[0]?.date
      ? formatDateIso(docs[0].date)
      : new Date().toISOString()

    // 构建 Atom XML
    let atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${FEED_CONSTANTS.title}</title>
  <subtitle>${FEED_CONSTANTS.subtitle}</subtitle>
  <link href="${xmlEscape(siteUrl)}/feed.atom" rel="self"/>
  <link href="${xmlEscape(siteUrl)}" rel="alternate"/>
  <id>${xmlEscape(siteUrl)}</id>
  <updated>${updated}</updated>
  <author>
    <name>${FEED_CONSTANTS.title}</name>
  </author>
`

    for (const doc of docs) {
      // 转换全文
      const content = docContentToCdata(doc)

      // 安全处理日期
      const published = formatDateIso(doc.date)

      const link = buildDocLink(siteUrl, doc)
      const id = buildDocId(doc, link)

      // 转义特殊字符
      const title = xmlCdata(doc.title || '无标题')
      const description = xmlCdata(doc.description || '')

      atom += `
  <entry>
    <title>${title}</title>
    <link href="${xmlEscape(link)}"/>
    <id>${xmlEscape(id)}</id>
    <published>${published}</published>
    <updated>${published}</updated>
    <summary>${description}</summary>
    <content type="html"><![CDATA[${content}]]></content>
  </entry>
`
    }

    atom += `\n</feed>`

    setResponseHeader(event, 'content-type', 'application/atom+xml; charset=utf-8')
    return atom
  } catch (error) {
    console.error('生成 Atom Feed 失败:', error)
    // 返回最小化的 feed
    const minimalFeed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${FEED_CONSTANTS.title}</title>
  <subtitle>${FEED_CONSTANTS.subtitle}</subtitle>
  <link href="${xmlEscape(siteUrl)}/feed.atom" rel="self"/>
  <link href="${xmlEscape(siteUrl)}" rel="alternate"/>
  <id>${xmlEscape(siteUrl)}</id>
  <updated>${new Date().toISOString()}</updated>
  <author>
    <name>${FEED_CONSTANTS.title}</name>
  </author>
</feed>`

    setResponseHeader(event, 'content-type', 'application/atom+xml; charset=utf-8')
    return minimalFeed
  }
}, {
  maxAge: 60 * 60,
  name: 'atom-feed',
  getKey: () => 'static'
})