// server/api/auth/github.get.ts
export default defineOAuthGitHubEventHandler({

  async onSuccess(event, { user }) {
    // 先获取之前存储的来源页
    const session = await getUserSession(event)
    const redirect = session.redirect as string || '/'
    console.log(typeof redirect, redirect)

    // 清理 session 中的 redirect（可选，避免下次重复使用）
    await setUserSession(event, { ...session, redirect: undefined })

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

    // 重定向回来源页
    return sendRedirect(event, redirect)
  },

  async onError(event, error) {
    // 登录失败处理
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=true')
  },
})