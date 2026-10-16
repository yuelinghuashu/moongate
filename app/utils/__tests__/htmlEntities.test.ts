import { describe, it, expect } from 'vitest'
import { decodeHtmlEntities } from '../htmlEntities'

describe('decodeHtmlEntities', () => {
  it('还原命名实体', () => {
    expect(decodeHtmlEntities('a&lt;b&gt;c')).toBe('a<b>c')
    expect(decodeHtmlEntities('&quot;x&quot; &apos;y&apos;')).toBe('"x" \'y\'')
    expect(decodeHtmlEntities('a&amp;b')).toBe('a&b')
  })

  it('还原数字实体（十进制与十六进制）', () => {
    // Markdown 渲染器对单引号产出 &#39;，Go 清洗器会把 &quot; 规整为 &#34;
    expect(decodeHtmlEntities('&#39;x&#39;')).toBe("'x'")
    expect(decodeHtmlEntities('&#34;hi&#34;')).toBe('"hi"')
    expect(decodeHtmlEntities('&#x27;y&#x27;')).toBe("'y'")
    expect(decodeHtmlEntities('&#X22;z&#X22;')).toBe('"z"')
  })

  it('只解码一次，不产生二次解码', () => {
    expect(decodeHtmlEntities('&amp;lt;')).toBe('&lt;')
    expect(decodeHtmlEntities('&amp;#39;')).toBe('&#39;')
  })

  it('保留无法识别的实体与裸 & 号', () => {
    expect(decodeHtmlEntities('&unknown; &nope')).toBe('&unknown; &nope')
    expect(decodeHtmlEntities('a & b')).toBe('a & b')
    expect(decodeHtmlEntities('&#;')).toBe('&#;')
    expect(decodeHtmlEntities('&#xZZ;')).toBe('&#xZZ;')
  })

  it('不因越界码点抛异常', () => {
    expect(decodeHtmlEntities('&#1114112;')).toBe('&#1114112;') // > 0x10FFFF
    expect(decodeHtmlEntities('&#-1;')).toBe('&#-1;')
    expect(decodeHtmlEntities('&#55296;')).toBe('&#55296;') // 代理区码点
  })

  it('还原真实代码块的常见内容', () => {
    const html = 'fmt.Println(&#34;hi&#34;, &#39;x&#39;, a&lt;b, c&amp;d)'
    expect(decodeHtmlEntities(html)).toBe('fmt.Println("hi", \'x\', a<b, c&d)')
  })

  it('空值原样返回', () => {
    expect(decodeHtmlEntities('')).toBe('')
  })
})
