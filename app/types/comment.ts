// 用户信息基础类型
export interface UserInfo {
  username: string      // 用户名（GitHub 登录名）
  is_admin?: boolean    // 是否为管理员，用于显示徽章
}

// 引用信息类型（用于回复块显示）
export interface ReplyTo {
  id: number                         // 被引用的评论/回复 ID
  type: 'comment' | 'reply'          // 被引用类型
  username: string                   // 被引用者用户名
  excerpt: string                    // 被引用内容的摘要（前 100 字符）
}

// 基础评论字段（主评论和回复共有的字段）
export interface BaseComment {
  id: number
  content: string
  created_at: string
  user?: UserInfo
}

// 主评论类型
export interface Comment extends BaseComment {
  type: 'comment'
}

// 回复类型（比主评论多了目标信息）
export interface Reply extends BaseComment {
  type: 'reply'
  target_id: number
  target_type: 'comment' | 'reply'
  reply_to?: ReplyTo    // 由后端直接提供，避免前端递归查询
}

// 联合类型，方便在组件中统一处理
export type CommentItem = Comment | Reply