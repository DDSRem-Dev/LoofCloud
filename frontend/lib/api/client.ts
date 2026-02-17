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
