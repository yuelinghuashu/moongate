import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      // 指定此集合内内容的类型
      type: 'page',
      source: 'docs/*.md',
      schema: z.object({
        title: z.string(),          // 标题
        description: z.string(),    // 描述
        date: z.date(),             // 日期
        permalink: z.string(),      // 固定链接（唯一标识）
        level: z.string(),          // 技术深度（P1~P5）
        series: z.string(),         // 系列名称
        platform: z.string(),       // 所属平台
        tags: z.array(z.string()),  // 标签列表  
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