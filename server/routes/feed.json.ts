import { minimarkToHtml } from '../../utils/minimarkToHtml'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl, apiUrl } = useRuntimeConfig().public

  try {
    const response = await $fetch(`${apiUrl}/api/docs?content=false&limit=1000`)
    const docs = response.data || []

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
      items: docs.map((doc) => {
        // 转换全文
        let contentHtml = ''
        if (doc.content) {
          try {
            contentHtml = minimarkToHtml(doc.content)
          } catch (e) {
            console.error('转换失败:', e)
            contentHtml = doc.description || ''
          }
        }

        // 安全处理日期
        let datePublished
        try {
          const dateObj = new Date(doc.date)
          datePublished = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString()
        } catch (e) {
          datePublished = new Date().toISOString()
        }

        return {
          id: doc.permalink || `${siteUrl}/docs/${doc.slug}`,
          url: `${siteUrl}/docs/${doc.slug}`,
          title: doc.title || '无标题',
          content_html: contentHtml,
          summary: doc.description || '',
          date_published: datePublished,
          language: 'zh-CN',
          tags: doc.tags || [],
          // 额外字段
          _slug: doc.slug,
          _level: doc.level,
          _series: doc.series
        }
      })
    }

    setResponseHeader(event, 'content-type', 'application/feed+json; charset=utf-8')
    return feed
  } catch (error) {
    console.error('生成 JSON Feed 失败:', error)

    // 返回最小化的 JSON Feed
    const minimalFeed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: 'MoonGate',
      home_page_url: siteUrl,
      feed_url: `${siteUrl}/feed.json`,
      description: 'Where Moon Meets Code',
      language: 'zh-CN',
      authors: [{ name: 'MoonGate', url: siteUrl }],
      items: []
    }

    setResponseHeader(event, 'content-type', 'application/feed+json; charset=utf-8')
    return minimalFeed
  }
}, {
  maxAge: 60 * 60,
  name: 'json-feed',
  getKey: () => 'static'
})