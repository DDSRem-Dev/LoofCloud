import { authFetch } from './client'

export interface P115Status {
  logged_in: boolean
  app?: string
  updated_at?: string
}

export interface P115QrcodeToken {
  uid: string
  time: number
  sign: string
  qrcode_content: string
}

export interface P115PollResult {
  status: number
  msg: string
}

/**
 * 获取 115 登入状态
 */
export async function apiP115Status(token: string): Promise<P115Status> {
  const res = await authFetch(token, '/api/v1/p115/status')
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '获取状态失败')
  }
  return res.json()
}

/**
 * 获取二维码 token
 */
export async function apiP115QrcodeToken(token: string, app: string = 'qandroid'): Promise<P115QrcodeToken> {
  const res = await authFetch(token, `/api/v1/p115/qrcode/token?app=${encodeURIComponent(app)}`, {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '获取二维码失败')
  }
  return res.json()
}

/**
 * 获取二维码图片（作为 blob URL）
 */
export async function apiP115QrcodeImage(token: string, uid: string): Promise<string> {
  const res = await authFetch(token, `/api/v1/p115/qrcode/image?uid=${encodeURIComponent(uid)}`, {
    headers: { Accept: 'image/png' },
  })
  if (!res.ok) {
    throw new Error('获取二维码图片失败')
  }
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

/**
 * 轮询扫码状态
 */
export async function apiP115QrcodePoll(
  token: string,
  uid: string,
  time: number,
  sign: string
): Promise<P115PollResult> {
  const params = new URLSearchParams({ uid, time: String(time), sign })
  const res = await authFetch(token, `/api/v1/p115/qrcode/poll?${params}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '轮询失败')
  }
  return res.json()
}

/**
 * 确认扫码登入
 */
export async function apiP115QrcodeConfirm(
  token: string,
  uid: string,
  app: string = 'qandroid'
): Promise<{ ok: boolean; cookies_str: string }> {
  const params = new URLSearchParams({ uid, app })
  const res = await authFetch(token, `/api/v1/p115/qrcode/confirm?${params}`, {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '确认登入失败')
  }
  return res.json()
}

/**
 * 退出 115 登录
 */
export async function apiP115Logout(token: string): Promise<{ ok: boolean }> {
  const res = await authFetch(token, '/api/v1/p115/logout', { method: 'POST' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '退出失败')
  }
  return res.json()
}
