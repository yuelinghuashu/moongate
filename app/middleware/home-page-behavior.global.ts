// 是否跳过首页行为
export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const nuxtApp = useNuxtApp()
    const { homepageBehavior } = nuxtApp.$pinia?.state.value?.global?.settings
    const locale = nuxtApp.$i18n?.locale

    if (to.path === '/' || to.path === `/${locale.value}`) {
      try {
        if (homepageBehavior === 32) {
          return navigateTo(locale.value === 'zh_cn' ? '/articles' : `/${locale.value}/articles`)
        }
      } catch (error) {
        console.warn('无法访问 Pinia 状态:', error)
      }
    }
  }

  return
})