// composables/useAuth.ts
import { useCookie } from '#app'

export interface UserInfo {
  login?: string
  username?: string
  avatar_url?: string
  [key: string]: unknown
}

export const useAuth = () => {
  // 用 cookie 存 token（服务端也能读）
  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30, // 30天
    path: '/',
    sameSite: 'lax',
  })

  const user = useCookie<UserInfo | null>('user_info', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  })

  const isLoggedIn = computed(() => !!token.value)

  const login = (authToken: string, userData: UserInfo) => {
    token.value = authToken
    user.value = userData
  }

  const logout = () => {
    token.value = null
    user.value = null
  }

  return { token, user, isLoggedIn, login, logout }
}