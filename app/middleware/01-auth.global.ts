// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // 0. 白名单：RSS 相关路由
  const isRssRoute =
    to.path === '/rss.xml' ||
    to.path === '/feed.xml' ||
    to.path === '/feed.atom' ||
    to.path === '/feed.json' ||
    to.path.startsWith('/api/feed') ||
    to.name?.toString().includes('rss') ||
    to.name?.toString().includes('feed')

  if (isRssRoute) {
    return
  }

  // 1. 检查路由是否标记了需要保护
  if (!to.meta.requiresAuth) {
    return
  }

  // 2. 验证逻辑
  const { loggedIn, user, fetch } = useUserSession()
  const localePath = useLocalePath()

  if (import.meta.server) {
    await fetch()
  }

  const username = to.params.user as string

  if (!loggedIn.value || user.value?.login !== username) {
    return navigateTo(localePath('/404'))
  }

  // 3. 如果是用户主页，跳转到 profile
  if (to.path === localePath(`/${username}`)) {
    return navigateTo(localePath(`/${username}/profile`))
  }
})