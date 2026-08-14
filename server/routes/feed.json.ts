import {
  FEED_CONSTANTS,
  buildDocLink,
  buildDocId,
  docContentToCdata,
  formatDateIso,
  getFeedDocs,
} from '../utils/feed'

export default defineCachedEventHandler(async (event) => {
  const { siteUrl, apiUrl } = useRuntimeConfig().public

  try {
    const docs = await getFeedDocs(apiUrl)

    // 构建 JSON Feed
    const feed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: FEED_CONSTANTS.title,
      home_page_url: siteUrl,
      feed_url: `${siteUrl}/feed.json`,
      description: FEED_CONSTANTS.description,
      language: FEED_CONSTANTS.language,
      authors: [{
        name: FEED_CONSTANTS.title,
        url: siteUrl
      }],
      items: docs.map((doc) => {
        const link = buildDocLink(siteUrl, doc)
        const id = buildDocId(doc, link)

        return {
          id,
          url: link,
          title: doc.title || '无标题',
          content_html: docContentToCdata(doc),
          summary: doc.description || '',
          date_published: formatDateIso(doc.date),
          language: FEED_CONSTANTS.language,
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
      title: FEED_CONSTANTS.title,
      home_page_url: siteUrl,
      feed_url: `${siteUrl}/feed.json`,
      description: FEED_CONSTANTS.description,
      language: FEED_CONSTANTS.language,
      authors: [{ name: FEED_CONSTANTS.title, url: siteUrl }],
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