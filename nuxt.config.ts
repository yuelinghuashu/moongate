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
    'nuxt-auth-utils',
    'nuxt-shiki',
  ],
  ssr: true,
  devtools: {
    enabled: false
  },
  runtimeConfig: {
    oauth: {
      github: {
        clientId: '',
        clientSecret: '',
      }
    },
    databaseUrl: '',
    public: {
      siteUrl: process.env.SITE_URL,
    }
  },
  vite: {
    plugins: [
      removeConsole({ includes: ['log'] }) // 移除console.log
    ]
  },
  content: {
    build: {
      markdown: {
        toc: {
          depth: 4,
          searchDepth: 3
        },
        highlight: {
          langs: ['json', 'js', 'ts', 'html', 'css', 'vue', 'shell', 'mdc', 'md', 'yaml', 'xml', 'mermaid'],
        },
        theme: {
          default: 'material-theme-lighter',
          light: 'material-theme-lighter',
          dark: 'material-theme-palenight'
        }
      },
    },
    shiki: {
      // 配置你需要的主题和语言
      bundledThemes: ['material-theme-lighter', 'material-theme-palenight'],
      bundledLangs: [
        'javascript', 'typescript','js', 'html', 'css',
        'vue', 'python', 'bash', 'json', 'markdown',
        'xml', 'yaml', 'shell', 'diff'
      ],
      defaultTheme: 'material-theme-lighter',
      dynamic: true, // 懒加载语言
    },
    experimental: {
      nativeSqlite: true
    }
  },
  css: ['~/assets/css/main.css'],
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