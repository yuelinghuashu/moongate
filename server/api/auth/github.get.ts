import { findUserByGithubId, createUser } from '~/../server/database/repositories/users'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user }) {
    // 1. 获取来源页
    const session = await getUserSession(event)
    const redirect = (session.redirect as string) || '/'

    // 清理 session 中的 redirect
    await setUserSession(event, { ...session, redirect: undefined })

    // 2. 数据库操作
    let dbUser = await findUserByGithubId(String(user.id))

    if (!dbUser) {
      dbUser = await createUser({
        github_id: String(user.id),
        username: user.login,
        is_admin: false,
      })
      console.log('新用户注册成功:', dbUser)
    }
    console.log('用户登录成功:', dbUser)

    // 3. 登录状态写入
    await setUserSession(event, {
      user: {
        id: dbUser.id,
        githubId: dbUser.github_id,
        login: dbUser.username,
        isAdmin: dbUser.is_admin,
      },
      loggedInAt: Date.now(),
    })

    // 4. 重定向
    return sendRedirect(event, redirect)
  },

  async onError(event, error) {
    console.error('GitHub OAuth error:', error.message)
    return sendRedirect(event, '/404')
  },
})