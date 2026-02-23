import { minimarkToHtml } from '../../utils/minimarkToHtml'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig().public

  const articles = await queryCollection(event, 'articles')
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
    items: await Promise.all(articles.map(async (article) => {
      // 转换全文
      let contentHtml = ''
      if (article.body?.value) {
        try {
          contentHtml = minimarkToHtml(article.body.value)
        } catch (e) {
          console.error('转换失败:', e)
          contentHtml = article.description || ''
        }
      }

      return {
        id: `${siteUrl}${article.path}`,
        url: `${siteUrl}${article.path}`,
        title: article.title,
        content_html: contentHtml,
        summary: article.description || '',
        date_published: new Date(article.date).toISOString(),
        language: 'zh-CN',
        tags: article.tags || []
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