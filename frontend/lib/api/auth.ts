import { getApiUrl } from './client'

const BASE = getApiUrl()

export interface TokenResponse {
  access_token: string
  token_type: string
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
