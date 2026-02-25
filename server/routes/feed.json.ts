import { minimarkToHtml } from '../../utils/minimarkToHtml'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig().public

  const docs = await queryCollection(event, 'docs')
    .order('date', 'DESC')
    .all()

  // 构建 JSON Feed
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'MoonGate',
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/feed.json`,
    description: 'Where Moon Meets Code',
    language: 'zh-CN',
    authors: [{
      name: 'MoonGate',
      url: siteUrl
    }],
    items: await Promise.all(docs.map(async (doc) => {
      // 转换全文
      let contentHtml = ''
      if (doc.body?.value) {
        try {
          contentHtml = minimarkToHtml(doc.body.value)
        } catch (e) {
          console.error('转换失败:', e)
          contentHtml = doc.description || ''
        }
      }

      return {
        id: `${siteUrl}${doc.path}`,
        url: `${siteUrl}${doc.path}`,
        title: doc.title,
        content_html: contentHtml,
        summary: doc.description || '',
        date_published: new Date(doc.date).toISOString(),
        language: 'zh-CN',
        tags: doc.tags || []
      }
    }))
  }

  setResponseHeader(event, 'content-type', 'application/feed+json; charset=utf-8')
  return feed
}, {
  maxAge: 60 * 60,
  name: 'json-feed',
  getKey: () => 'static'
})