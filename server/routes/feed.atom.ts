import { contentToHtml, safeParseDate } from '../../app/utils/docs'
import { escapeXml } from '../../app/utils/xml'
import { fetchDocs } from '../utils/docs'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl, apiUrl } = useRuntimeConfig().public

  try {
    const docs = await fetchDocs(apiUrl, { includeContent: true })

    // 获取最新更新时间
    const updated = docs[0]?.date
      ? new Date(docs[0].date).toISOString()
      : new Date().toISOString()

    // 构建 Atom XML
    let atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>MoonGate</title>
  <subtitle>Where Moon Meets Code</subtitle>
  <link href="${siteUrl}/feed.atom" rel="self"/>
  <link href="${siteUrl}" rel="alternate"/>
  <id>${siteUrl}</id>
  <updated>${updated}</updated>
  <author>
    <name>MoonGate</name>
  </author>
`

    for (const doc of docs) {
      // 转换全文
      const content = contentToHtml(doc)

      // 安全处理日期
      const published = safeParseDate(doc.date).toISOString()

      const link = `${siteUrl}/docs/${doc.slug}`
      const id = doc.permalink || link

      // 转义特殊字符
      const title = escapeXml(doc.title || '无标题')
      const description = escapeXml(doc.description || '')

      atom += `
  <entry>
    <title>${title}</title>
    <link href="${link}"/>
    <id>${id}</id>
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
  <title>MoonGate</title>
  <subtitle>Where Moon Meets Code</subtitle>
  <link href="${siteUrl}/feed.atom" rel="self"/>
  <link href="${siteUrl}" rel="alternate"/>
  <id>${siteUrl}</id>
  <updated>${new Date().toISOString()}</updated>
  <author>
    <name>MoonGate</name>
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