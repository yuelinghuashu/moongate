// composables/useDocDetail.ts
// 文档/关于页详情公共逻辑：数据获取 + Shiki 高亮 + 大纲提取
import { computed } from "vue";
import type { Ref } from "vue";
import { highlightHtmlContent } from "~/utils/shikiProcessor";
import { sanitizeHtml } from "~/utils/sanitize";
import { useOutline } from "./useOutline";

/** 详情页数据基础结构（满足 content + highlightedContent 两个关键字段） */
export interface DocDetailBase {
  content?: string
  highlightedContent?: string
}

/**
 * 通用详情页数据加载 Composable
 *
 * 提取 about/[slug].vue 和 docs/[slug].vue 的公共逻辑：
 * 1. useAsyncData 按 slug 获取数据
 * 2. transform 中将 content 服务端高亮为 highlightedContent
 * 3. 计算 contentRef（优先读取高亮后的完全体 HTML）
 * 4. 从 contentRef 构建嵌套大纲（useOutline）
 * 5. 控制 isOutlineIconVisible（有内容时显示目录图标）
 *
 * @param fetchKey - useAsyncData 的缓存 key（如 `doc-${slug}` / `about-${slug}`）
 * @param slug - 当前 slug（响应式 ref）
 * @param buildApiPath - 根据 slug 构建 API 路径的函数（如 `(s) => \`/api/docs/${s}\``）
 * @param lang - 可选的内容语言参数（如 `en`），变化时自动重新请求
 */
export function useDocDetail<T extends DocDetailBase = DocDetailBase>(
  fetchKey: string,
  slug: Ref<string>,
  buildApiPath: (slug: string) => string,
  lang?: Ref<string>,
) {
  const config = useRuntimeConfig();
  const langParam = lang || ref('');

  const fetchUrl = computed(() => {
    const query = langParam.value ? `?lang=${langParam.value}` : '';
    return `${buildApiPath(slug.value)}${query}`;
  });

  const { data: page } = useAsyncData<DocDetailBase>(
    computed(() => `${fetchKey}-${langParam.value}`),
    () => $fetch<DocDetailBase>(fetchUrl.value, { baseURL: config.public.apiUrl }),
    {
      watch: [slug, langParam],
      transform: async (data) => {
        if (data && data.content) {
          try {
            data.highlightedContent = await highlightHtmlContent(data.content);
          } catch (e) {
            console.error(`[${slug.value}] 高亮渲染失败，使用原始内容:`, e);
            data.highlightedContent = data.content;
          }
        }
        return data;
      },
    },
  );

  // 优先读取服务端已高亮的完全体 HTML 字符串
  // DOMPurify 仅在客户端执行，SSR 直接透传（保证首屏速度）
  const contentRef = computed(() => {
    const raw = page.value?.highlightedContent || page.value?.content || "";
    if (import.meta.client) {
      try {
        return sanitizeHtml(raw);
      } catch {
        return raw; // sanitize 失败时退回原始内容
      }
    }
    return raw;
  });

  // 从正文构建嵌套大纲
  // isOutlineIconVisible 由 AppHeader.vue 通过路由判断统一管理
  const { nestedOutline, isOutlineVisible } = useOutline(contentRef);

  return {
    page: page as unknown as Ref<T | null>,
    contentRef,
    nestedOutline,
    isOutlineVisible,
  };
}
