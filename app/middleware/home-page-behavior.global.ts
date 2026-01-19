/**
 * 首页重定向中间件
 * 
 * 功能：根据用户设置决定是否跳过欢迎页面，直接进入文章列表
 * 
 * 场景：
 * 1. 用户访问根路径 '/' 或者 /${locale.value}/ 时
 * 2. 根据设置中的 homepageBehavior 判断：
 *    - 31: 显示欢迎页面（默认）
 *    - 32: 跳过欢迎页面，直接进入文章列表
 * 
 * 注意：此中间件仅在客户端执行，避免服务端渲染时访问客户端状态
 */
export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const nuxtApp = useNuxtApp()
    const locale = nuxtApp.$i18n.locale
    const { homepageBehavior } = nuxtApp.$pinia?.state.value?.global?.settings

    if (to.path === '/' || to.path === `/${locale.value}/`) {
      try {
        // ⚙️ 判断是否需要跳过欢迎页面
        // 设置值说明：
        // - 31: "显示入口页" (Show landing page)
        // - 32: "跳过入口页" (Skip landing page)
        if (homepageBehavior === 32) {
          return navigateTo('/articles')
        }
      } catch (error) {
        // ⚠️ 错误处理：如果访问状态失败，记录警告但不中断流程
        // 用户仍然可以正常访问首页
        console.warn('无法访问 Pinia 状态:', error)
      }
    }
  }

  // ✅ 不需要重定向时，返回 undefined 或 null 让路由继续
  return
})