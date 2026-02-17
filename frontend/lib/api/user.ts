import { authFetch } from './client'

export interface UserResponse {
  id: string
  username: string
  role: string
  is_active: boolean
  created_at: string
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
    throw new Error(err.detail || '更新用户失败')
  }
  return res.json()
}
