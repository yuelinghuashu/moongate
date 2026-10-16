// utils/htmlEntities.ts
// HTML 实体解码：用于把 HTML 里取到的代码文本还原成 Shiki 需要的源码。

/** 常见命名实体（代码高亮只需覆盖 Markdown 渲染器实际会产出的那些） */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '\u0026',
  lt: '\u003C',
  gt: '\u003E',
  quot: '"',
  apos: "'",
  nbsp: '\u00A0',
}

/** 命名实体 | 十进制 &#34; | 十六进制 &#x22; */
const ENTITY_PATTERN = /\u0026(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g

/**
 * 把 HTML 实体解码为原始字符，一次扫描完成（不做二次解码）。
 *
 * 为什么需要它：代码块在 HTML 里是转义后的文本，Shiki 需要的是源码本身。
 * 早先的实现只做 5 次字符串替换（&lt; &gt; &amp; &quot; &apos;），
 * 于是漏掉了数字实体——Markdown 渲染器对单引号产出的是 &#39;，
 * 清洗器还会把 &quot; 规整为 &#34;，两者都还原不回来，代码块里会直接显示
 * &#39; / &#34; 字面量。这里改为按实体语法统一解码，与"谁产出的、用什么写法"
 * 彻底解耦：渲染器、清洗器换写法都不再影响高亮。
 *
 * @param text - 含实体的文本（通常是 HTML 中取出的代码）
 * @returns 解码后的文本；无法识别的实体原样保留
 *
 * @example
 * decodeHtmlEntities('a&#34;b&amp;c') // 'a"b&c'
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || !text.includes('\u0026')) return text

  return text.replace(ENTITY_PATTERN, (match, body: string) => {
    if (body.startsWith('#')) {
      const isHex = body[1] === 'x' || body[1] === 'X'
      const code = Number.parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10)
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match
      // 代理区码点 fromCodePoint 会抛错，直接保留原文更安全
      if (code >= 0xd800 && code <= 0xdfff) return match
      return String.fromCodePoint(code)
    }

    return NAMED_ENTITIES[body] ?? match
  })
}
