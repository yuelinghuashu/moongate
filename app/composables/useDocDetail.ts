// composables/useDocDetail.ts
// 文档/关于页详情公共逻辑：数据获取 + Shiki 高亮 + 大纲提取
import { useLocalStorage } from "@vueuse/core";
import type { Ref } from "vue";
import { highlightHtmlContent } from "~/utils/shikiProcessor";
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
 * @param apiPath - API 路径（如 `/api/docs/${slug}` / `/api/about/${slug}`）
 */
export function useDocDetail<T extends DocDetailBase = DocDetailBase>(
  fetchKey: string,
  slug: Ref<string>,
  apiPath: string,
) {
  const config = useRuntimeConfig();

  const { data: page } = useAsyncData<DocDetailBase>(
    fetchKey,
    () => $fetch<DocDetailBase>(apiPath, { baseURL: config.public.apiUrl }),
    {
      watch: [slug],
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
  const contentRef = computed(() => page.value?.highlightedContent || page.value?.content || "");

  // 从正文构建嵌套大纲
  const { nestedOutline, isOutlineVisible } = useOutline(contentRef);

  // 有内容时显示目录图标
  const isOutlineIconVisible = useLocalStorage("isOutlineIconVisible", false);

  watchEffect(() => {
    isOutlineIconVisible.value = !!page.value?.content;
  });

  return {
    page: page as unknown as Ref<T | null>,
    contentRef,
    nestedOutline,
    isOutlineVisible,
  };
}
