// composables/useDetailsScroll.ts
import { ref, nextTick } from 'vue'

/**
 * details 元素自动滚动功能
 * @param options - 配置选项
 * @returns 组件需要使用的 ref 和事件处理函数
 */
export function useDetailsScroll(options?: {
  behavior?: ScrollBehavior;  // 滚动行为，默认 smooth
  block?: ScrollLogicalPosition; // 垂直对齐方式，默认 start
}) {
  const { behavior = 'smooth', block = 'start' } = options || {};

  /**
   * 需要滚动到的容器元素引用
   */
  const containerRef = ref<HTMLElement | null>(null);

  /**
   * 处理 details 展开事件
   * @param event - toggle 事件对象
   */
  const onDetailsToggle = (event: ToggleEvent): void => {
    // 检查是否展开
    if (
      event.target instanceof HTMLElement &&
      'open' in event.target &&
      (event.target as HTMLDetailsElement).open
    ) {
      // 等待 DOM 更新
      nextTick((): void => {
        if (containerRef.value) {
          containerRef.value.scrollIntoView({
            behavior,
            block
          });
        }
      });
    }
  };

  return {
    containerRef,
    onDetailsToggle
  };
}