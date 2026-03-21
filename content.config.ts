import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      // 指定此集合内内容的类型
      type: 'page',
      source: 'docs/*.md',
      schema: z.object({
        permalink: z.string(),
        title: z.string(),
        description: z.string(),
        date: z.date(),
        tags: z.array(z.string()),
        level: z.string()
      })
    }),
    about: defineCollection({
      type: 'page',
      source: 'about/*.md',
      schema: z.object({
        permalink: z.string(),
        title: z.string(),
        description: z.string(),
        date: z.date(),
      })
    })
  }
})