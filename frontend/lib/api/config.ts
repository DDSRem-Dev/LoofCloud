import { authFetch } from './client'

export interface BaseConfig {
  strm_base_url: string | null
}

export interface AppConfig {
  base: BaseConfig
}

/**
 * 获取应用配置（仅管理员）
 */
export async function apiGetConfig(token: string): Promise<AppConfig> {
  const res = await authFetch(token, '/api/v1/config')
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '获取配置失败')
  }
  return res.json()
}

/**
 * 更新应用配置（仅管理员，可部分更新）
 */
export async function apiUpdateConfig(
  token: string,
  body: { base?: Partial<BaseConfig> }
): Promise<AppConfig> {
  const res = await authFetch(token, '/api/v1/config', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '保存配置失败')
  }
  return res.json()
}
