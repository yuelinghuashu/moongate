// server/plugins/feed.ts
import type { NitroApp } from 'nitropack'

export default defineNitroPlugin((nitroApp: NitroApp) => {
  // 使用内容项钩子，在每个 feed 项生成后被调用
  nitroApp.hooks.hook('feedme:handle:content:item', ({ item, context }) => {
    // 从 runtimeConfig 获取域名
    const siteUrl = useRuntimeConfig().public.siteUrl

    // 如果 item.link 存在且以 '/' 开头，则补全域名
    if (item.link && item.link.startsWith('/')) {
      item.link = siteUrl + item.link
    }
  })
})