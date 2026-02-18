// stores/url-query.ts
import { defineStore } from 'pinia'

const useUrlQueryStore = defineStore('urlQuery', () => {
  const route = useRoute()
  const router = useRouter()

  // 定义独立的 ref（这样 store 返回的就是这些 ref 的解包对象）
  const search = ref(route.query.search?.toString() || '')
  const option = ref(Number(route.query.option) || 1)
  const page = ref(Number(route.query.page) || 1)
  const size = ref(Number(route.query.size) || 5)

  // 监听路由变化，更新 state
  watch(() => route.query, (q) => {
    search.value = q.search?.toString() || ''
    option.value = Number(q.option) || 1
    page.value = Number(q.page) || 1
    size.value = Number(q.size) || 5
  })

  // 监听 state 变化，更新路由
  watch([search, option, page, size], () => {
    const query: Record<string, string> = {}
    if (search.value) query.search = search.value
    if (option.value !== 1) query.option = String(option.value)
    if (page.value !== 1) query.page = String(page.value)
    if (size.value !== 5) query.size = String(size.value)
    router.push({ query })
  })

  // 返回独立的 ref，而不是包裹成一个对象 ref
  return { search, option, page, size }
})

export default useUrlQueryStore