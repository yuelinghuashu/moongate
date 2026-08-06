<template>
  <div class="flex items-center justify-center min-h-screen">
    <p>正在登录...</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const { login } = useAuth()

const token = route.query.token as string
const userStr = route.query.user as string

try {
  if (token && userStr) {
    const user = JSON.parse(decodeURIComponent(userStr))
    login(token, user)
  }
} catch (error) {
  // URL 参数异常（如 token 过期、user 编码错误）时静默失败，直接回首页
  console.error('登录回调参数解析失败:', error)
}

navigateTo(localePath('/'))
</script>
