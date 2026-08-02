import { contentToHtml, safeParseDate } from '../../app/utils/docs'
import { fetchDocs } from '../utils/docs'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl, apiUrl } = useRuntimeConfig().public

  try {
    const docs = await fetchDocs(apiUrl, { includeContent: true })

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
        return {
          id: doc.permalink || `${siteUrl}/docs/${doc.slug}`,
          url: `${siteUrl}/docs/${doc.slug}`,
          title: doc.title || '无标题',
          content_html: contentToHtml(doc),
          summary: doc.description || '',
          date_published: safeParseDate(doc.date).toISOString(),
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