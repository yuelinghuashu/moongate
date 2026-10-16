// Workaround for nuxt/icon#518 (https://github.com/nuxt/icon/issues/518)
// Regression introduced in @nuxt/icon 2.4.0: the module plugin calls
// `_api.setFetch(useRequestFetch().native)`. On the server, `useRequestFetch()`
// returns Nitro's `event.$fetch`, which is a plain function WITHOUT `.native`,
// so iconify's fetch module is set to `undefined` and every SSR icon load
// silently fails (`[Icon] failed to load icon ...`), leaving empty `<span>`
// placeholders in the SSR HTML. The browser side is unaffected, so icons only
// appear after client hydration.
//
// Fix (mirrors upstream PR nuxt/icon#527): on the server, re-point iconify's
// fetch at `event.fetch`, which resolves the relative `/api/_nuxt_icon/...`
// URL through Nitro's in-process localFetch and returns a real `Response`
// (unlike `event.$fetch`, which returns ofetch's parsed body).
// Remove this file once the upstream fix is released in a new @nuxt/icon version.
import { _api } from '@iconify/vue'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) {
    const event = nuxtApp.ssrContext?.event
    if (event?.fetch) {
      // h3 的 event.fetch 在运行期就是 fetch 兼容实现（返回真正的 Response），
      // 但其类型签名是 Nitro 专用的（参数收窄为 NitroFetchRequest），
      // 与 iconify 期望的 fetch 签名不兼容，故此处显式转换。
      // 上游修好后删除本文件即可，不必为它调整依赖类型。
      _api.setFetch(event.fetch as unknown as typeof globalThis.fetch)
    }
  }
})
