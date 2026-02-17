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

export type { P115Status, P115QrcodeToken, P115PollResult } from './p115'
export {
  apiP115Status,
  apiP115QrcodeToken,
  apiP115QrcodeImage,
  apiP115QrcodePoll,
  apiP115QrcodeConfirm,
  apiP115Logout,
} from './p115'
