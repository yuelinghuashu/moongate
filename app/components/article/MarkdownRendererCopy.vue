<!-- components/article/MarkdownRenderer.vue -->
<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="renderedContent" />
</template>

<script lang="ts" setup>
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

const props = defineProps({ content: { type: String, required: true } });

// 从 Nuxt 插件中获取全局 Shiki 高亮器实例（已在客户端插件中预加载主题和语言）
const { $shiki } = useNuxtApp();
const colorMode = useColorMode();

const renderedContent = ref("");

// 根据当前颜色模式动态选择 Shiki 主题，确保与文章代码块配色一致
const currentTheme = computed(() => {
  return colorMode.value === "dark"
    ? "material-theme-palenight" // 深色主题
    : "material-theme-lighter"; // 浅色主题
});

// 核心渲染函数：将用户输入的 Markdown 内容转换为安全的、高亮的 HTML
const renderContent = async () => {
  // 如果 Shiki 未就绪或内容为空，则直接显示原始内容（降级处理）
  if (!$shiki || !props.content) {
    renderedContent.value = props.content;
    return;
  }

  try {
    // ---------- 第一步：手动提取并高亮所有代码块 ----------
    let processed = props.content;
    // 正则匹配围栏代码块：```lang\n代码\n```（支持语言可选）
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const matches = [...processed.matchAll(codeBlockRegex)];

    for (const match of matches) {
      const [fullMatch, lang, code] = match;
      try {
        // 调用 Shiki 进行语法高亮，返回 HTML 字符串或包含 HTML 的对象
        const highlighted = $shiki.codeToHtml(code.trim(), {
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

    // ---------- 第三步：使用 DOMPurify 过滤不安全内容，防止 XSS 攻击 ----------
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

<style scoped>
/* ===== 基础文本 ===== */
:deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

:deep(br) {
  display: block;
  content: "";
  margin: 0.25rem 0;
}

:deep(strong),
:deep(b) {
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

:deep(em),
:deep(i) {
  font-style: italic;
}

:deep(u) {
  text-decoration: underline;
  text-underline-offset: 2px;
}

:deep(s),
:deep(del) {
  text-decoration: line-through;
}

:deep(ins) {
  text-decoration: underline;
}

/* ===== 标题 ===== */
:deep(h1) {
  font-size: 2rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
  color: var(--ui-text-highlighted);
}

:deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.2rem 0 0.8rem;
  color: var(--ui-text-highlighted);
}

:deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.6rem;
  color: var(--ui-text-highlighted);
}

:deep(h4) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.8rem 0 0.4rem;
  color: var(--ui-text-highlighted);
}

:deep(h5) {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.6rem 0 0.3rem;
  color: var(--ui-text-highlighted);
}

:deep(h6) {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0.4rem 0 0.2rem;
  color: var(--ui-text-muted);
}

/* ===== 列表 ===== */
:deep(ul) {
  list-style-type: disc;
  padding-left: 2rem;
  margin: 0.5rem 0;
}

:deep(ol) {
  list-style-type: decimal;
  padding-left: 2rem;
  margin: 0.5rem 0;
}

:deep(li) {
  margin: 0.2rem 0;
  line-height: 1.6;
}

:deep(li > ul),
:deep(li > ol) {
  margin: 0.2rem 0 0.2rem 1rem;
}

/* ===== 链接和引用 ===== */
:deep(a) {
  color: var(--ui-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s;
}

:deep(a:hover) {
  color: var(--ui-primary-hover);
}

:deep(blockquote) {
  border-left: 4px solid var(--ui-border);
  margin: 1rem 0;
  padding: 0.75rem 1.5rem;
  color: var(--ui-text-muted);
  background-color: var(--ui-bg-muted);
  border-radius: 0 var(--ui-radius) var(--ui-radius) 0;
  font-style: italic;
}

/* ===== 代码 ===== */
:deep(pre) {
  padding: 1rem;
  background-color: var(--ui-bg-muted) !important;
  border-radius: var(--ui-radius);
  border: 1px solid var(--ui-border);
}

:deep(code) {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  border-radius: var(--ui-radius-sm);
}

:deep(pre code) {
  border-radius: 0;
}

:deep(pre code .line) {
  display: contents !important;
}

/* ===== 表格 ===== */
:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
}

:deep(thead) {
  background-color: var(--ui-bg-muted);
}

:deep(th) {
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 2px solid var(--ui-border);
  text-align: left;
  color: var(--ui-text-highlighted);
}

:deep(tbody tr) {
  border-bottom: 1px solid var(--ui-border);
}

:deep(tbody tr:last-child) {
  border-bottom: none;
}

:deep(td) {
  padding: 0.75rem;
  border-right: 1px solid var(--ui-border);
}

:deep(td:last-child) {
  border-right: none;
}

/* ===== 其他 ===== */
:deep(hr) {
  border: none;
  border-top: 1px solid var(--ui-border);
}

:deep(img) {
  max-width: 100%;
  border-radius: var(--ui-radius);
}

:deep(sub) {
  font-size: 0.8em;
  vertical-align: sub;
}

:deep(sup) {
  font-size: 0.8em;
  vertical-align: super;
}
</style>
