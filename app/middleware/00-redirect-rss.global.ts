// middleware/00-redirect-rss.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // 匹配形如：
  // /en/feed.xml, /zh-CN/rss.json, /fr/atom.xml, /de/feed.atom, /es/rss.rss 等
  const feedRegex = /^\/([\w-]+)\/(rss|feed|atom)\.(xml|json|atom|rss)$/i
  const match = to.path.match(feedRegex)

  if (match) {
    // match[1] 是语言代码（未使用），match[2] 是文件名（如 rss/feed/atom），match[3] 是扩展名
    const [, , fileName, ext] = match
    // 重定向到无语言前缀的版本，例如 /rss.xml
    return navigateTo(`/${fileName}.${ext}`, { redirectCode: 301 })
  }
})