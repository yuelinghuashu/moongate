// server/api/auth/github.get.ts
export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user }) {
    // 登录成功：将用户信息存入 session
    await setUserSession(event, {
      user: {
        githubId: String(user.id),
        login: user.login,
        name: user.name,
        avatarUrl: user.avatar_url,
        email: user.email,
      },
      loggedInAt: Date.now(),
    })

    // 重定向回首页（你也可以重定向到其他页面）
    return sendRedirect(event, '/')
  },

  async onError(event, error) {
    // 登录失败处理
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=true')
  },
})