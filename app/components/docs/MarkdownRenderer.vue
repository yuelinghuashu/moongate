<!-- components/docs/MarkdownRenderer.vue -->
<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="post-content markdown-body" v-html="renderedContent"  />
</template>

<script lang="ts" setup>
import { marked } from "marked";
import { codeToHtml } from "shiki";
import DOMPurify from "isomorphic-dompurify";

const props = defineProps({ content: { type: String, required: true } });
const colorMode = useColorMode();

const renderedContent = ref("");

// 根据当前颜色模式动态选择 Shiki 主题，确保与文档代码块配色一致
const currentTheme = computed(() => {
  return colorMode.value === "dark"
    ? "material-theme-palenight" // 深色主题
    : "material-theme-lighter"; // 浅色主题
});

// 核心渲染函数：将用户输入的 Markdown 内容转换为安全的、高亮的 HTML
const renderContent = async () => {
  // 如果 Shiki 未就绪或内容为空，则直接显示原始内容（降级处理）
  if (!props.content) {
    renderedContent.value = props.content;
    return;
  }

  try {
    // ---------- 第一步：手动提取并高亮所有代码块 ----------
    let processed = props.content;
    // 正则匹配围栏代码块：```lang\n代码\n```（支持语言可选）
    const codeBlockRegex = /```([a-zA-Z0-9+#-]+)\n([\s\S]*?)```/g;
    const matches = [...processed.matchAll(codeBlockRegex)];

    for (const match of matches) {
      const [fullMatch, lang, code] = match;
      try {
        // 调用 Shiki 进行语法高亮，返回 HTML 字符串或包含 HTML 的对象
        const highlighted = await codeToHtml(code.trim(), {
          lang: lang || "text", // 未指定语言时当作纯文本
          theme: currentTheme.value, // 使用当前主题
        });

        // 兼容 Shiki 不同版本的返回值（可能直接返回字符串，也可能返回 { html } 对象）
        const htmlStr =
          typeof highlighted === "string"
            ? highlighted
            : highlighted.html || highlighted.value || String(highlighted);

        // 用高亮后的 HTML 替换原始代码块（使用函数替换避免 $ 符号被转义）
        processed = processed.replace(fullMatch, () => htmlStr);
      } catch (e) {
        console.error("高亮失败:", e);
        // 高亮失败时保留原始代码块（不做高亮）
      }
    }

    // ---------- 第二步：将处理后的内容（代码块已替换）解析为 Markdown ----------
    const html = await marked.parse(processed, {
      breaks: true, // 将换行符转换为 <br>
      gfm: true, // 启用 GitHub 风格 Markdown（表格、删除线等）
    });

    renderedContent.value = DOMPurify.sanitize(html, {
      // 明确允许的 HTML 标签（涵盖所有 Markdown 可能生成的标签）
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "s",
        "del",
        "ins",
        "span",
        "div",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "a",
        "blockquote",
        "code",
        "pre",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "hr",
        "img",
        "sub",
        "sup",
      ],

      // 允许的属性（class/style 用于代码高亮样式，其他为链接、图片等常用属性）
      ALLOWED_ATTR: [
        "class",
        "style",
        "href",
        "lang",
        "src",
        "alt",
        "title",
        "target",
        "rel",
      ],

      // 限制 URL 只能使用以下安全协议：
      // - http: / https: → 网页链接、图片链接（评论区核心需求）
      // - ftp: → 文件下载链接（极少出现，但保留无害）
      // - mailto: → 邮箱联系方式（偶尔有人留邮箱）
      // - tel: → 电话联系方式（虽少但保留）
      // - blob: → 临时文件/本地文件（为可能的图片上传预留）
      // - data: → base64 图片（用户直接贴 base64 图片时用）
      // 其他协议（如 javascript:、vbscript:、file: 等）一律拦截，防止 XSS 攻击
      ALLOWED_URI_REGEXP: /^(https?|ftp|mailto|tel|blob|data):/i,

      // 是否允许未在 ALLOWED_URI_REGEXP 中列出的协议：
      // - true  → 正则只作为“推荐列表”，未知协议可能被放行（不安全）
      // - false → 正则作为“强制列表”，只有列出的协议才允许（安全）
      // 评论区场景必须设置为 false，确保所有 URL 都经过协议白名单检查
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });
  } catch (error) {
    console.error("渲染失败:", error);
    // 发生任何错误时，回退显示原始内容
    renderedContent.value = props.content;
  }
};

// 监听内容或主题变化，立即执行一次渲染，之后每次变化重新渲染
watch([() => props.content, () => colorMode.value], renderContent, {
  immediate: true,
});
</script>
