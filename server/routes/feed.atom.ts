import { minimarkToHtml } from '../../utils/minimarkToHtml'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig().public

  const docs = await queryCollection(event, 'docs')
    .order('date', 'DESC')
    .all()

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
    if (doc.body?.value) {
      try {
        content = minimarkToHtml(doc.body.value)
      } catch (e) {
        console.error('转换失败:', e)
        content = doc.description || ''
      }
    }

    const link = `${siteUrl}${doc.path}`
    const published = new Date(doc.date).toISOString()
    const id = link // 或使用 doc.permalink

    atom += `
  <entry>
    <title>${doc.title}</title>
    <link href="${link}"/>
    <id>${id}</id>
    <published>${published}</published>
    <updated>${published}</updated>
    <summary>${doc.description || ''}</summary>
    <content type="html"><![CDATA[${content}]]></content>
  </entry>
`
  }

  atom += `\n</feed>`

  setResponseHeader(event, 'content-type', 'application/atom+xml; charset=utf-8')
  return atom
}, {
  maxAge: 60 * 60,
  name: 'atom-feed',
  getKey: () => 'static'
})