import { minimarkToHtml } from '../../utils/minimarkToHtml'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl, apiUrl } = useRuntimeConfig().public

  try {
    const response = await $fetch(`${apiUrl}/api/docs?content=false&limit=1000`)
    const docs = response.data || []

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
      let content = ''
      if (doc.content) {
        try {
          content = minimarkToHtml(doc.content)
        } catch (e) {
          console.error('转换失败:', e)
          content = doc.description || ''
        }
      }

      // 安全处理日期
      let published
      try {
        const dateObj = new Date(doc.date)
        if (isNaN(dateObj.getTime())) {
          console.warn('无效日期:', doc.date, '使用当前时间')
          published = new Date().toISOString()
        } else {
          published = dateObj.toISOString()
        }
      } catch (e) {
        console.warn('日期处理失败:', e, '使用当前时间')
        published = new Date().toISOString()
      }

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

// 工具函数：转义 XML 特殊字符
function escapeXml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}