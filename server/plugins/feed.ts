// server/plugins/feed.ts
import type { NitroApp } from 'nitropack'

export default ((nitroApp: NitroApp) => {
  // 通用钩子：处理所有 feed 路由
  nitroApp.hooks.hook('feedme:handle', async ({ context: { event }, feed: { obtain } }) => {
    // 只处理我们关心的 feed 路由
    const feedRoutes = ['/feed.xml', '/feed.atom', '/feed.json']
    if (!feedRoutes.includes(event.path)) return

    console.log(`✅ Generating feed for ${event.path}`)
    const siteUrl = useRuntimeConfig().public.siteUrl

    // 创建 feed 对象
    const feed = obtain({
      title: 'MoonGate',
      description: 'Where Moon Meets Code',
      id: siteUrl,
      link: siteUrl,
    })

    // 获取文章数据
    const articles = await queryCollection(event, 'articles').order('date', 'DESC').all()

    // 添加条目
    for (const article of articles) {
      feed.addItem({
        title: article.title,
        id: article.permalink,
        link: `${siteUrl}${article.path}`,
        date: new Date(article.date),
        description: article.description,
      })
    }
  })
})