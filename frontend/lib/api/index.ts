/**
 * API 模块统一入口，按域拆分：client / auth / user / p115
 */

export { getApiUrl, authFetch } from './client'

export type { TokenResponse } from './auth'
export { apiLogin } from './auth'

export type { UserResponse } from './user'
export {
  apiGetMe,
  apiListUsers,
  apiUpdateMe,
  apiCreateUser,
  apiUpdateUser,
} from './user'

export type { AppConfig, BaseConfig, StorageConfig } from './config'
export { apiGetConfig, apiUpdateConfig, BASE_CONFIG_FIELDS, STORAGE_CONFIG_FIELDS } from './config'

export type {
  P115Status,
  P115QrcodeToken,
  P115PollResult,
  P115Dashboard,
  P115UserInfo,
  P115StorageInfo,
  P115SpaceInfo,
  P115SizeItem,
  P115VipInfo,
  P115FaceInfo,
} from './p115'
export {
  apiP115Dashboard,
  apiP115Status,
  apiP115QrcodeToken,
  apiP115QrcodeImage,
  apiP115QrcodePoll,
  apiP115QrcodeConfirm,
  apiP115Logout,
} from './p115'
