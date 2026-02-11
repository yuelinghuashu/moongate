import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      // 指定此集合内内容的类型
      type: 'page',
      source: 'articles/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
        tags: z.array(z.string()),
      })
    }),
    about: defineCollection({
      type: 'page',
      source: 'about/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
      })
    })
  }
})