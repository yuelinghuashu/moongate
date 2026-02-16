// server/api/auth/github.get.ts
import { users } from '~/../server/db/schema'
import { eq } from 'drizzle-orm'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user }) {
    // ---------- 1. 获取来源页 ----------
    const session = await getUserSession(event)
    const redirect = (session.redirect as string) || '/'

    // 清理 session 中的 redirect
    await setUserSession(event, { ...session, redirect: undefined })

    // ---------- 2. 数据库操作 ----------
    const db = useDb()

    // 查找用户
    let dbUser = await db.query.users.findFirst({
      where: eq(users.github_id, String(user.id))
    })

    // 如果不存在则创建
    if (!dbUser) {
      const [newUser] = await db.insert(users).values({
        github_id: String(user.id),
        username: user.login,
        is_admin: false,
      }).returning()

      dbUser = newUser
      console.log('新用户注册:', dbUser)
    }

    // ---------- 3. 登录状态写入 ----------
    await setUserSession(event, {
      user: {
        id: dbUser?.id,              // 数据库 ID，后面评论等功能需要
        githubId: String(user.id),
        login: user.login,
        isAdmin: dbUser?.is_admin,    // 从数据库取管理员状态
      },
      loggedInAt: Date.now(),
    })

    // ---------- 4. 重定向 ----------
    return sendRedirect(event, redirect)
  },

  async onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=true')
  },
})