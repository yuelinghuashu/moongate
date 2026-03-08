// composables/useSwipe.ts
import { useEventListener } from '@vueuse/core'

/**
 * 滑动检测的配置选项
 */
export interface SwipeOptions {
  threshold?: number // 触发滑动的距离阈值（像素），默认 60
}

/**
 * 监听上下滑动手势的组合式函数
 * @param handlers - 包含 onUp（上滑回调）和 onDown（下滑回调）的对象
 * @param options - 配置选项，可设置阈值
 */
export function useSwipe(
  handlers: {
    onUp?: () => void
    onDown?: () => void
  },
  options: SwipeOptions
) {
  const { threshold = 60 } = options
  const touchStartY = ref(0) // 记录触摸起始的 Y 坐标

  // 监听触摸开始事件，记录起始位置
  useEventListener('touchstart', (e: TouchEvent) => {
    touchStartY.value = e.touches[0].clientY
  })

  // 监听触摸结束事件，判断滑动方向并触发相应回调
  useEventListener('touchend', (e: TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY
    const distance = touchStartY.value - touchEndY // 正数：上滑；负数：下滑

    // 检查上滑距离是否超过阈值
    if (distance > threshold) {
      handlers.onUp?.()
    }
    // 检查下滑距离绝对值是否超过阈值
    else if (-distance > threshold) {
      handlers.onDown?.()
    }
    // 若距离绝对值小于阈值，则不触发任何回调
  })
}