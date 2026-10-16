// composables/useDocDetail.ts
// 文档详情页公共逻辑：数据获取 + Shiki 高亮 + 大纲提取
import { computed } from "vue";
import type { Ref } from "vue";
import { highlightHtmlContent } from "~/utils/shikiProcessor";
import { docDetailApiUrl } from "~/utils/docs";
import { useOutline } from "./useOutline";

/** 详情页数据基础结构（满足 content + highlightedContent 两个关键字段） */
export interface DocDetailBase {
  content?: string
  highlightedContent?: string
}

/**
 * 通用详情页数据加载 Composable
 *
 * 文档详情页的数据加载与渲染准备逻辑：
 * 1. useAsyncData 按「请求 URL」获取数据——key 就是 URL，因此 slug/lang 不可能漏进 key
 * 2. transform 中将 content 高亮为 highlightedContent
 * 3. 计算 contentRef（优先读取高亮后的完全体 HTML）
 * 4. 从 contentRef 构建嵌套大纲（useOutline）
 *
 * 正文 HTML 已由后端在加载期清洗，这里直接渲染、不做运行期清洗——
 * 若只在客户端清洗，服务端首帧与客户端首渲就会不一致（hydration 隐患）。
 *
 * @param slug - 当前 slug（响应式 ref）
 * @param lang - 内容语言参数（如 `en`），变化时自动重新请求
 */
export function useDocDetail<T extends DocDetailBase = DocDetailBase>(
  slug: Ref<string>,
  lang?: Ref<string>,
) {
  const config = useRuntimeConfig();
  const langParam = lang || ref('');

  /** 请求 URL：同时也是 useAsyncData 的缓存标识 */
  const url = computed(() => docDetailApiUrl(slug.value, langParam.value));

  const { data: page } = useAsyncData<DocDetailBase>(
    computed(() => `doc:${url.value}`),
    () => $fetch(url.value, { baseURL: config.public.apiUrl }) as Promise<DocDetailBase>,
    {
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

  /** 优先读取已高亮的完全体 HTML 字符串 */
  const contentRef = computed(() => page.value?.highlightedContent || page.value?.content || "");

  // 从正文构建嵌套大纲
  // 目录抽屉的展开状态由 stores/setting.ts 持有（[slug].vue 直接绑定），
  // 目录图标的显隐由 AppHeader.vue 按路由判断
  const { nestedOutline } = useOutline(contentRef);

  return {
    page: page as unknown as Ref<T | null>,
    contentRef,
    nestedOutline,
  };
}
