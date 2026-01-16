// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  Strings must use singlequote
  rules:{
    strings: ['error', 'single'],
  }
)
