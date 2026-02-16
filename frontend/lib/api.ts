/**
 * API 基础 URL。Web 同源时可设为 ''；开发时可为 http://localhost:8000
 */
export function getApiUrl(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }
  if (typeof window !== 'undefined') {
    return '' // 同源
  }
  return 'http://localhost:8000'
}

const BASE = getApiUrl()

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  username: string
  role: string
  is_active: boolean
  created_at: string
}

/**
 * 带 Authorization 的 fetch，用于已登录请求
 */
export async function authFetch(
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

/**
 * 登录：POST /api/v1/auth/login
 */
export async function apiLogin(username: string, password: string): Promise<TokenResponse> {
  const url = `${BASE}/api/v1/auth/login`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        '接口未找到。请确认后端已启动，并在前端项目根目录配置 .env：EXPO_PUBLIC_API_URL=http://localhost:8000'
      )
    }
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(Array.isArray(err.detail) ? err.detail.map((e: any) => e.msg || e).join(' ') : err.detail || '登录失败')
  }
  return res.json()
}

/**
 * 获取当前用户：GET /api/v1/users/me
 */
export async function apiGetMe(token: string): Promise<UserResponse> {
  const res = await authFetch(token, '/api/v1/users/me')
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '获取用户失败')
  }
  return res.json()
}

/**
 * 管理员获取用户列表：GET /api/v1/users
 */
export async function apiListUsers(token: string): Promise<UserResponse[]> {
  const res = await authFetch(token, '/api/v1/users')
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '获取用户列表失败')
  }
  return res.json()
}

/**
 * 当前用户更新自己：PUT /api/v1/users/me
 */
export async function apiUpdateMe(
  token: string,
  data: { username?: string; password?: string }
): Promise<UserResponse> {
  const res = await authFetch(token, '/api/v1/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '更新失败')
  }
  return res.json()
}

/**
 * 管理员创建用户：POST /api/v1/users
 */
export async function apiCreateUser(
  token: string,
  data: { username: string; password: string; role: 'admin' | 'user'; is_active?: boolean }
): Promise<UserResponse> {
  const res = await authFetch(token, '/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '创建用户失败')
  }
  return res.json()
}

/**
 * 管理员更新指定用户：PUT /api/v1/users/:id
 */
export async function apiUpdateUser(
  token: string,
  userId: string,
  data: { username?: string; password?: string; role?: 'admin' | 'user'; is_active?: boolean }
): Promise<UserResponse> {
  const res = await authFetch(token, `/api/v1/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '更新失败')
  }
  return res.json()
}
