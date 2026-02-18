import { authFetch } from './client'

export interface BaseConfig {
  strm_base_url: string | null
  user_rmt_mediaext: string[]
  user_download_mediaext: string[]
}

export interface StorageConfig {
  cloud_storage_box_dir: string | null
}

export const BASE_CONFIG_FIELDS: readonly {
  key: keyof BaseConfig
  label: string
  placeholder: string
  kind: 'string' | 'comma_list'
  minItems?: number
  help?: string
}[] = [
  {
    key: 'strm_base_url',
    label: 'STRM 文件基础地址',
    placeholder: '例如 http://127.0.0.1:8000',
    kind: 'string',
    help: '用于生成 STRM 文件时的基础 URL，留空则不设置。',
  },
  {
    key: 'user_rmt_mediaext',
    label: '可整理媒体文件扩展名',
    placeholder: '例如 mp4, mkv, ts, iso',
    kind: 'comma_list',
    minItems: 1,
  },
  {
    key: 'user_download_mediaext',
    label: '可下载媒体数据扩展名',
    placeholder: '例如 srt, ssa, ass',
    kind: 'comma_list',
    minItems: 1,
  },
]

export const STORAGE_CONFIG_FIELDS: readonly {
  key: keyof StorageConfig
  label: string
  placeholder: string
  kind: 'string'
  help?: string
}[] = [
  {
    key: 'cloud_storage_box_dir',
    label: '网盘箱目录',
    placeholder: '例如 /media',
    kind: 'string',
    help: 'LoofCloud 会在你的网盘里单独建一个「箱子」用来放电影、剧集等媒体文件，这里就填这个箱子的路径。留空则使用默认位置。',
  },
]

export interface AppConfig {
  base: BaseConfig
  storage: StorageConfig
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
  body: { base?: Partial<BaseConfig>; storage?: Partial<StorageConfig> }
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
