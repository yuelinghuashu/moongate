export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',   // 将主色指向我们定义的 brand 色阶
      neutral: 'slate'    // 默认中性色建议使用 slate 以保持冷调
    },
    // 强制 UI 组件使用我们在 CSS 中定义的直角 (rounded-none)
    button: {
      default: {
        rounded: 'rounded-none'
      }
    }
  }
})