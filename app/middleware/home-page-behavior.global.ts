/**
 * 首页重定向中间件
 * 
 * 功能：根据用户设置决定是否跳过欢迎页面，直接进入文章列表
 * 
 * 场景：
 * 1. 用户访问根路径 '/' 时
 * 2. 根据设置中的 homepageBehavior 判断：
 *    - 31: 显示欢迎页面（默认）
 *    - 32: 跳过欢迎页面，直接进入文章列表
 * 
 * 注意：此中间件仅在客户端执行，避免服务端渲染时访问客户端状态
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // 🔒 安全检查：仅在客户端环境下执行
  if (import.meta.client) {
    // 📦 获取 Nuxt 应用实例，用于访问全局状态
    const nuxtApp = useNuxtApp()

    // 🎯 获取用户设置：从 Pinia store 中读取首页行为设置
    const { homepageBehavior } = nuxtApp.$pinia?.state.value?.global?.settings

    // 🌐 获取当前语言设置：从 i18n 插件获取当前语言
    const locale = nuxtApp.$i18n?.locale

    // 🛣️ 检查当前访问的路径是否为根路径
    // 支持两种根路径格式：
    // 1. 默认根路径: '/'
    // 2. 带语言前缀的根路径: '/zh_cn', '/en', '/ja'
    if (to.path === '/' || to.path === `/${locale.value}`) {
      try {
        // ⚙️ 判断是否需要跳过欢迎页面
        // 设置值说明：
        // - 31: "显示入口页" (Show landing page)
        // - 32: "跳过入口页" (Skip landing page)
        if (homepageBehavior === 32) {
          // 🔀 根据当前语言生成正确的重定向路径
          // 中文用户: 重定向到 '/articles'
          // 其他语言用户: 重定向到 '/语言代码/articles'
          return navigateTo(locale.value === 'zh_cn' ? '/articles' : `/${locale.value}/articles`)
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