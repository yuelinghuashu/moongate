const useGlobalStore = defineStore('global', () => {

  const { setLocale, locales, locale } = useI18n()
  const colorMode = useColorMode()

  // 默认语言
  const defaultLocale = locales.value.findIndex(
    (item) => item.code === locale.value,
  );

  // 侧边栏开关
  const isSideBarOpen = ref<boolean>(false)

  // 大纲目录开关
  const isOutlineVisible = ref<boolean>(true);

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
    isOutlineVisible,

    setLanguage,
    setTheme,
    settings
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ['settings', 'isOutlineVisible']
  }
})

export default useGlobalStore