// composables/useDebouncedSearch.ts
import { ref, watch, onUnmounted, type Ref } from 'vue'

/**
 * 防抖搜索组合式函数
 *
 * 用于管理搜索输入框的防抖逻辑，避免用户快速输入时频繁触发搜索请求。
 *
 * @param searchInput - 实际搜索词（响应式引用），通常与路由 query 绑定。
 * @param page - 页码（响应式引用），当搜索词变化时会自动重置为 1。
 * @param delay - 防抖延迟时间（毫秒），默认 500ms。
 * @returns 返回一个对象，包含用于输入框绑定的防抖变量。
 *
 * @example
 * ```vue
 * <script setup>
 * const { searchInput, page } = useDocs() // 假设从 useDocs 获取
 * const { searchInputDebounced } = useDebouncedSearch(searchInput, page, 500)
 * </script>
 *
 * <template>
 *   <input v-model="searchInputDebounced" placeholder="搜索..." />
 * </template>
 * ```
 */
export function useDebouncedSearch(
  searchInput: Ref<string>,
  page: Ref<number>,
  delay = 500,
) {
  // 用于输入框临时绑定的防抖变量
  const searchInputDebounced = ref(searchInput.value)

  let timer: ReturnType<typeof setTimeout> | null = null

  // 清除定时器
  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  // 监听防抖变量变化，延迟后同步到实际搜索词并重置页码
  watch(searchInputDebounced, (newVal) => {
    clearTimer()
    timer = setTimeout(() => {
      searchInput.value = newVal
      page.value = 1
    }, delay)
  })

  // 反向同步：当实际搜索词（如通过路由后退/前进）变化时，更新防抖变量
  watch(searchInput, (newVal) => {
    searchInputDebounced.value = newVal
  })

  // 组件卸载时清除定时器，避免内存泄漏
  onUnmounted(clearTimer)

  return {
    searchInputDebounced,
  }
}