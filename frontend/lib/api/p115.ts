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

/** 115 容量项（size + size_format） */
export interface P115SizeItem {
  size: number
  size_format: string
}

/** 115 空间信息 */
export interface P115SpaceInfo {
  all_total?: P115SizeItem | null
  all_remain?: P115SizeItem | null
  all_use?: P115SizeItem | null
}

/** 115 存储信息（fs_index_info data） */
export interface P115StorageInfo {
  space_info?: P115SpaceInfo | null
}

/** 115 VIP 信息 */
export interface P115VipInfo {
  is_vip?: boolean
  is_forever?: boolean
  expire?: string
  expire_str?: string
}

/** 115 头像 */
export interface P115FaceInfo {
  face_l?: string
  face_m?: string
  face_s?: string
}

/** 115 用户信息（user_my_info data） */
export interface P115UserInfo {
  uid: number
  uname?: string
  vip?: P115VipInfo | null
  face?: P115FaceInfo | null
}

/** 115 仪表盘数据 */
export interface P115Dashboard {
  logged_in: boolean
  user_info: P115UserInfo | null
  storage_info: P115StorageInfo | null
}

/**
 * 获取 115 仪表盘数据（用户信息 + 存储信息），未登入时 user_info、storage_info 为 null
 */
export async function apiP115Dashboard(token: string): Promise<P115Dashboard> {
  const res = await authFetch(token, '/api/v1/p115/dashboard')
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '获取仪表盘失败')
  }
  return res.json()
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
