import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      // 指定此集合内内容的类型
      type: 'page',
      source: 'articles/*',
    }),
    about: defineCollection({
      type: 'page',
      source: 'about/*',
    })
  }
})