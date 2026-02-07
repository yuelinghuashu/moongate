// composables/useSwipeUp.ts
import { useEventListener } from '@vueuse/core'

export function useSwipeUp(onSwipe: () => void, options = { threshold: 60 }) {
  // 1. 记录触摸起点
  const touchStartY = ref(0)

  // 2. 监听触摸开始事件
  useEventListener('touchstart', (e: TouchEvent) => {
    touchStartY.value = e.touches[0].clientY
  })

  // 3. 监听触摸结束事件，并判断是否为有效上滑
  useEventListener('touchend', (e: TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY
    const distance = touchStartY.value - touchEndY // 正数表示上滑

    // 判断：移动距离超过阈值，则为有效上滑
    if (distance > options.threshold) {
      onSwipe() // 触发你传入的回调函数
    }
  })
}