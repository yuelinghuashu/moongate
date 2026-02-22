// server/plugins/feed.ts
import type { NitroApp } from 'nitropack'
import type { NitroCtx, Feed } from "nuxt-module-feed";

export default defineNitroPlugin((nitroApp: NitroApp) => {
  nitroApp.hooks.hook('feed:generate', async ({ feed, options }: NitroCtx) => {
    // 根据不同的 feed 路径（如 /feed.xml, /feed.atom）分别构建
    switch (options.path) {
      case '/feed.xml':
      case '/feed.atom':
      case '/feed.json':
        await createFeedFromContent(feed)
        break
      // 可以扩展其他自定义 feed
      default:
        break
    }
  })

  async function createFeedFromContent(feed: Feed) {
    // 获取当前请求事件（用于 serverQueryContent）
    const event = useEvent()
    // 获取运行时配置
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl
    const siteName = config.public.siteName
    const siteDescription = config.public.siteDescription

    // 从 Nuxt Content 获取文章
    const articles = await queryCollection(event, 'articles').order('date', 'DESC').all()

    // 设置 Feed 元数据（与官方示例一致）
    feed.options = {
      id: siteUrl,
      title: siteName,
      description: siteDescription,
      link: siteUrl,
      language: 'zh-CN',
      image: `${siteUrl}/logo-144x144.png`,   // 如有 logo 可保留
      favicon: `${siteUrl}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}`,
      generator: 'nuxt-module-feed',
      feedLinks: {
        rss: `${siteUrl}/feed.xml`,
        atom: `${siteUrl}/feed.atom`,
        json: `${siteUrl}/feed.json`,
      },
      author: {
        name: siteName,
        link: siteUrl,
      },
    }

    // 添加文章条目（只使用已有字段，不转换全文）
    articles.forEach((article) => {
      // 跳过无效条目
      if (!article.title && !article.permalink) return

      feed.addItem({
        title: article.title,
        id: `${siteUrl}${article.permalink}`,
        link: `${siteUrl}${article.path}`,
        description: article.description || article.description,
        // 不放入全文，避免 Markdown 转换
        date: new Date(article.date || Date.now()),
        // 可选：如果有分类或作者字段
      })
    })

    // 可以添加全局分类或贡献者（如官方示例）
    feed.addCategory('Nuxt')
    feed.addContributor({
      name: siteName,
      link: `${siteUrl}/about`,
    })
  }
})
