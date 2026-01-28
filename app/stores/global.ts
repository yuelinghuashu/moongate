import { nanoid } from 'nanoid'
interface CacheItem {
  data: object
  expires: string
}

const useGlobalStore = defineStore('global', () => {

  const { setLocale, locales, locale } = useI18n()
  const colorMode = useColorMode()

  // 默认语言
  const defaultLocale = locales.value.findIndex(
    (item) => item.code === locale.value,
  );

  // 按钮类型
  const buttonType = ref<string>('solid')

  // 按钮颜色
  const buttonColor = ref<string>('primary')

  // 侧边栏开关
  const isSideBarOpen = ref<boolean>(false)

  const cacheItems = new Map<string, CacheItem>()

  const setCacheItem = (key: string, data: object) => {
    cacheItems.set(key, { data, expires: nanoid() })
  }

  const getCacheItem = (key: string) => {
    const item = cacheItems.get(key)
    if (item && item.expires > nanoid()) {
      return item.data
    }
  }

  const deleteCacheItem = (key: string) => {
    cacheItems.delete(key)
  }

  // 用户设置
  const settings = ref({
    appearance: {
      theme: 'system',
      language: locales.value[defaultLocale]!.code,
    },
    homepageBehavior: 31,
    searchOption: 2
  })

  // 设置主题
  const setTheme = (theme: string) => {
    colorMode.preference = theme
  }

  // 设置语言
  const setLanguage = (lang: string) => {
    setLocale(lang)
    settings.value.appearance.language = lang
  }


  return {
    buttonType,
    buttonColor,
    isSideBarOpen,
    cacheItems,

    setCacheItem,
    getCacheItem,
    deleteCacheItem,
    setLanguage,
    setTheme,
    settings
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ['settings']

  }
})

export default useGlobalStore