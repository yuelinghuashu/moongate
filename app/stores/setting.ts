const useSettingStore = defineStore('setting', () => {

  const { setLocale, locales, locale } = useI18n()
  const colorMode = useColorMode()

  // 是否显示登录对话框
  const isLoginDialogVisible = ref(false)

  // 是否显示目录图标
  const isOutlineIconVisible = ref(false)

  // 默认语言
  const defaultLocale = locales.value.findIndex(
    (item) => item.code === locale.value,
  );

  // 用户设置
  const settings = ref({
    // 外观
    appearance: {
      // 主题
      theme: 'system',
      // 语言
      language: locales.value[defaultLocale]!.code,
    },
    // 是否跳过首页
    homepageBehavior: 31,
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
    isLoginDialogVisible,
    isOutlineIconVisible,

    setLanguage,
    setTheme,
    settings
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ['settings'],
  }
})

export default useSettingStore