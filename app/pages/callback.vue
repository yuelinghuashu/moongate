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

if (token && userStr) {
  const user = JSON.parse(decodeURIComponent(userStr))
  login(token, user)
  navigateTo(localePath('/'))
} else {
  navigateTo(localePath('/'))
}
</script>