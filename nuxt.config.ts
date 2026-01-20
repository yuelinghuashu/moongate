// https://nuxt.com/docs/api/configuration/nuxt-config
import removeConsole from 'vite-plugin-remove-console'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@nuxt/image',
    "@nuxt/eslint",
    '@nuxt/icon',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  ssr: true,
  devtools: {
    enabled: false
  },
  vite: {
    plugins: [
      removeConsole({ includes: ['log', 'warn', 'error'] }) // 移除所有console
    ]
  },
  content: {
    build: {
      markdown: {
        toc: {
          depth: 4,
          searchDepth: 3
        }
      },
    }
  },
  css: ['~/assets/css/main.css'],
  icon: {
    customCollections: [{
      prefix: 'custom',
      dir: '/public/icons'
    }]
  },
  i18n: {
    locales: [{
      code: 'zh_cn',        // 程序内部标识符（URL路径使用）
      name: '简体中文',      // 显示名称
      language: 'zh-CN',    // 用于HTML lang属性的标准语言标签
      file: 'zh_cn.json'    // 对应的语言文件

    }, {
      code: 'en',
      name: 'English',
      language: 'en-US',
      file: 'en.json',

    }, {
      code: 'ja',
      name: '日本語',
      language: 'ja-JP',
      file: 'ja.json',

    }],
    // 语言文件目录
    langDir: 'locales',
    // 浏览器语言检测
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    // 默认语言设置（必须与某个code完全匹配）
    defaultLocale: 'zh_cn',
    // 路由策略
    strategy: 'prefix_except_default', // 推荐：默认语言无前缀
  },
  routeRules: {
    '/': { prerender: true }
  },
  compatibilityDate: '2024-11-01',
})