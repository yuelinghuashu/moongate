// 所有 API 统一返回这个格式
export interface ApiResponse {
  success: boolean;      // 成功/失败标志
  status: number;        // HTTP 状态码
  message?: string;      // 提示信息（可选）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;              // 成功时的数据（可选）
  timestamp: string;     // 服务器时间戳
}