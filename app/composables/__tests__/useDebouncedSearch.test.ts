import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useDebouncedSearch } from '../useDebouncedSearch'

describe('useDebouncedSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize debounced value with search input value', () => {
    const searchInput = ref('initial')
    const page = ref(1)
    const { searchInputDebounced } = useDebouncedSearch(searchInput, page)

    expect(searchInputDebounced.value).toBe('initial')
  })

  it('should sync to search input and reset page after delay', async () => {
    const searchInput = ref('')
    const page = ref(3)
    const { searchInputDebounced } = useDebouncedSearch(searchInput, page, 500)

    searchInputDebounced.value = 'vue'

    // 等待 watch 回调执行并设置 timer
    await nextTick()

    // 延迟时间未到时不应更新（此时 timer 已设置）
    vi.advanceTimersByTime(499)
    await nextTick()
    expect(searchInput.value).toBe('')

    // 到达延迟时间
    vi.advanceTimersByTime(1)
    await nextTick()
    await nextTick()

    expect(searchInput.value).toBe('vue')
    expect(page.value).toBe(1)
  })

  it('should reset timer on rapid consecutive changes', async () => {
    const searchInput = ref('')
    const page = ref(1)
    const { searchInputDebounced } = useDebouncedSearch(searchInput, page, 500)

    searchInputDebounced.value = 'v'
    await nextTick()
    vi.advanceTimersByTime(300)

    searchInputDebounced.value = 'vu'
    await nextTick()
    vi.advanceTimersByTime(300)

    searchInputDebounced.value = 'vue'
    await nextTick()
    vi.advanceTimersByTime(300)

    // 每次变更都重置了 timer，前两次的 timer 被清除
    expect(searchInput.value).toBe('')
    expect(page.value).toBe(1)

    // 最后一个 timer 在 500ms 后触发
    vi.advanceTimersByTime(500)
    await nextTick()
    await nextTick()

    expect(searchInput.value).toBe('vue')
    expect(page.value).toBe(1)
  })

  it('should sync back from searchInput to debounced value', async () => {
    const searchInput = ref('')
    const page = ref(1)
    const { searchInputDebounced } = useDebouncedSearch(searchInput, page)

    searchInput.value = 'from-router'
    await nextTick()

    expect(searchInputDebounced.value).toBe('from-router')
  })

  it('should not change page when search input only changes externally', async () => {
    const searchInput = ref('')
    const page = ref(5)
    const { searchInputDebounced } = useDebouncedSearch(searchInput, page)

    searchInput.value = 'external-change'
    await nextTick()

    // 外部变化的同步不应重置页码
    expect(searchInputDebounced.value).toBe('external-change')
    expect(page.value).toBe(5)
  })

  it('should use custom delay', async () => {
    const searchInput = ref('')
    const page = ref(1)
    const { searchInputDebounced } = useDebouncedSearch(searchInput, page, 1000)

    searchInputDebounced.value = 'slow'
    await nextTick()

    vi.advanceTimersByTime(999)
    await nextTick()
    expect(searchInput.value).toBe('')

    vi.advanceTimersByTime(1)
    await nextTick()
    await nextTick()
    expect(searchInput.value).toBe('slow')
  })
})