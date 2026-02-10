const useGlobalStore = defineStore('global', () => {

  const { setLocale, locales, locale } = useI18n()
  const colorMode = useColorMode()

  // 默认语言
  const defaultLocale = locales.value.findIndex(
    (item) => item.code === locale.value,
  );

  // 侧边栏开关
  const isSideBarOpen = ref<boolean>(false)

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
    settings.value.appearance.theme = theme
  }

  // 设置语言
  const setLanguage = (lang) => {
    setLocale(lang)
    settings.value.appearance.language = lang
  }


  return {
    isSideBarOpen,

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