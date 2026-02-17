import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { YStack, XStack, Text, Card, H2, H4, Paragraph, Button } from 'tamagui'
import { ScrollView, useWindowDimensions, Pressable, View, Image } from 'react-native'
import { Settings, Key, LogOut, QrCode, ChevronDown, Check, FileText, CheckCircle, AlertCircle, HelpCircle, Loader2 } from 'lucide-react-native'
import { radius, gradients, darkGradients, glassCard } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { StyledInput } from '@/components/shared/StyledInput'
import {
  apiP115Status,
  apiP115QrcodeToken,
  apiP115QrcodeImage,
  apiP115QrcodePoll,
  apiP115QrcodeConfirm,
  apiP115Logout,
  apiGetConfig,
  apiUpdateConfig,
  type P115Status,
} from '@/lib/api'

const APP_OPTIONS = [
  { value: 'qandroid', label: 'Android' },
  { value: 'ios', label: 'iOS' },
  { value: 'web', label: 'Web' },
  { value: 'tv', label: 'TV' },
  { value: 'alipaymini', label: '支付宝小程序' },
  { value: 'wechatmini', label: '微信小程序' },
] as const

/** 自定义下拉选择器（Portal 到 body 避免被 ScrollView 裁剪） */
function AppSelect({
  value,
  onChange,
  isDark,
  isMobile,
}: {
  value: string
  onChange: (v: string) => void
  isDark: boolean
  isMobile: boolean
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<View>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
  const hoverBg = isDark ? 'rgba(91,207,250,0.15)' : 'rgba(91,207,250,0.1)'

  const selectedLabel = APP_OPTIONS.find((o) => o.value === value)?.label ?? value

  const handleOpen = useCallback(() => {
    const el = triggerRef.current as any
    if (el) {
      const dom = el instanceof HTMLElement ? el : el._nativeTag ?? el.getNode?.()
      if (dom && dom.getBoundingClientRect) {
        const rect = dom.getBoundingClientRect()
        setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
      }
    }
    setOpen((v) => !v)
  }, [])

  // close on outside click
  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    // defer so the opening click doesn't immediately close
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', handler)
    }
  }, [open])

  return (
    <>
      <View ref={triggerRef} style={{ width: isMobile ? '100%' : 200 }}>
        <Pressable
          onPress={handleOpen}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 44,
            paddingHorizontal: 14,
            borderRadius: radius.lg,
            backgroundColor: inputBg,
            borderWidth: 1,
            borderColor: open ? (isDark ? 'rgba(91,207,250,0.4)' : 'rgba(91,207,250,0.35)') : borderColor,
            cursor: 'pointer',
            transition: 'border-color 0.2s ease',
          } as any}
        >
          <Text fontSize={14} color={textColor}>{selectedLabel}</Text>
          <View style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' } as any}>
            <ChevronDown size={16} color={mutedColor} />
          </View>
        </Pressable>
      </View>
      {open && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            borderRadius: radius.lg,
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${borderColor}`,
            zIndex: 99999,
            overflow: 'hidden',
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {APP_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: value === opt.value ? hoverBg : 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                color: value === opt.value ? (isDark ? '#7dd9fb' : '#5bcffa') : textColor,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) (e.currentTarget.style.backgroundColor = 'transparent')
              }}
            >
              <span>{opt.label}</span>
              {value === opt.value && (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Check size={14} color={isDark ? '#7dd9fb' : '#5bcffa'} />
                </span>
              )}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

/** 115 扫码登入卡片 */
function P115LoginCard({ isDark, isMobile }: { isDark: boolean; isMobile: boolean }) {
  const { token } = useAuth()

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const primaryColor = isDark ? '#7dd9fb' : '#5bcffa'
  const successColor = '#22c55e'
  const warningColor = '#f59e0b'

  const [status, setStatus] = useState<P115Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState('qandroid')

  // QR code state
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [qrStatus, setQrStatus] = useState<string>('') // '', 'waiting', 'scanned', 'confirmed', 'expired', 'error'
  const [qrMsg, setQrMsg] = useState('')
  const [fetchingQr, setFetchingQr] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadStatus = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const s = await apiP115Status(token)
      setStatus(s)
    } catch {
      setStatus({ logged_in: false })
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  // cleanup poll and blob URL on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      if (qrImageUrl) URL.revokeObjectURL(qrImageUrl)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stopPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const handleGetQrcode = async () => {
    if (!token) return
    stopPoll()
    setFetchingQr(true)
    setQrStatus('')
    setQrMsg('')
    setQrImageUrl(null)
    try {
      const t = await apiP115QrcodeToken(token, selectedApp)
      const imageUrl = await apiP115QrcodeImage(token, t.uid)
      setQrImageUrl(imageUrl)
      setQrStatus('waiting')
      setQrMsg('请用 115 客户端扫描二维码')

      // start polling
      pollTimerRef.current = setInterval(async () => {
        try {
          const result = await apiP115QrcodePoll(token, t.uid, t.time, t.sign)
          const s = result.status
          if (s === 0) {
            // waiting
          } else if (s === 1) {
            setQrStatus('scanned')
            setQrMsg('已扫码，请在手机上确认')
          } else if (s === 2) {
            // confirmed
            stopPoll()
            setQrStatus('confirmed')
            setQrMsg('已确认，正在登入…')
            setConfirming(true)
            try {
              await apiP115QrcodeConfirm(token, t.uid, selectedApp)
              await loadStatus()
              setQrImageUrl(null)
              setQrStatus('')
              setQrMsg('')
            } catch (e: any) {
              setQrStatus('error')
              setQrMsg(e?.message || '登入失败')
            } finally {
              setConfirming(false)
            }
          } else {
            // expired or other
            stopPoll()
            setQrStatus('expired')
            setQrMsg('二维码已过期，请重新获取')
          }
        } catch {
          stopPoll()
          setQrStatus('error')
          setQrMsg('轮询状态失败')
        }
      }, 2000)
    } catch (e: any) {
      setQrStatus('error')
      setQrMsg(e?.message || '获取二维码失败')
    } finally {
      setFetchingQr(false)
    }
  }

  const handleLogout = async () => {
    if (!token) return
    setLoggingOut(true)
    try {
      await apiP115Logout(token)
      await loadStatus()
    } catch {
      // ignore
    } finally {
      setLoggingOut(false)
    }
  }

  const statusDotColor = status?.logged_in ? successColor : (isDark ? '#666' : '#ccc')
  const statusText = status?.logged_in ? '已登入' : '未登入'

  const qrStatusColor =
    qrStatus === 'scanned' ? warningColor :
      qrStatus === 'confirmed' ? successColor :
        qrStatus === 'expired' || qrStatus === 'error' ? '#ef4444' :
          mutedColor

  if (loading) {
    return (
      <Card
        borderRadius={radius.xl}
        padding={isMobile ? '$4' : '$5'}
        className="stagger-item"
        style={{ ...glassCard(isDark), '--stagger-delay': '160ms' } as any}
      >
        <Text color={mutedColor}>加载中…</Text>
      </Card>
    )
  }

  return (
    <Card
      borderRadius={radius.xl}
      padding={isMobile ? '$4' : '$5'}
      className="stagger-item"
      style={{ ...glassCard(isDark), '--stagger-delay': '160ms' } as any}
    >
      <YStack gap="$4">
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap="$3">
            <YStack
              backgroundColor={isDark ? 'rgba(91,207,250,0.15)' : 'rgba(91,207,250,0.1)'}
              borderRadius={radius.lg}
              padding="$2"
            >
              <QrCode size={20} color={primaryColor} />
            </YStack>
            <H4 color={textColor} fontWeight="600">
              115 网盘
            </H4>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: statusDotColor,
              }}
            />
            <Text fontSize={13} color={status?.logged_in ? successColor : mutedColor} fontWeight="500">
              {statusText}
            </Text>
          </XStack>
        </XStack>

        {status?.logged_in ? (
          /* ── 已登入状态 ── */
          <YStack gap="$3">
            <YStack gap="$2" paddingHorizontal="$2">
              {status.app && (
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize={14} color={mutedColor}>登入设备</Text>
                  <Text fontSize={14} color={textColor} fontWeight="500">
                    {APP_OPTIONS.find((o) => o.value === status.app)?.label ?? status.app}
                  </Text>
                </XStack>
              )}
              {status.updated_at && (
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize={14} color={mutedColor}>登入时间</Text>
                  <Text fontSize={14} color={textColor} fontWeight="500">
                    {new Date(status.updated_at).toLocaleString('zh-CN')}
                  </Text>
                </XStack>
              )}
            </YStack>
            <Button
              unstyled
              borderWidth={1}
              borderColor="#ef4444"
              borderRadius={999}
              paddingHorizontal={24}
              height={40}
              alignItems="center"
              justifyContent="center"
              cursor={loggingOut ? 'not-allowed' : 'pointer'}
              opacity={loggingOut ? 0.6 : 1}
              // @ts-ignore web
              style={{ transition: 'opacity 0.2s ease' }}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              <XStack alignItems="center" gap="$2">
                <LogOut size={16} color="#ef4444" />
                <Text color="#ef4444" fontWeight="600" fontSize={14}>
                  {loggingOut ? '退出中…' : '退出登录'}
                </Text>
              </XStack>
            </Button>
          </YStack>
        ) : (
          /* ── 未登入状态 ── */
          <YStack gap="$4">
            {/* 设备选择 */}
            <YStack gap="$2">
              <Text fontSize={14} color={textColor} fontWeight="500">
                选择设备类型
              </Text>
              <AppSelect
                value={selectedApp}
                onChange={setSelectedApp}
                isDark={isDark}
                isMobile={isMobile}
              />
            </YStack>

            {/* 获取二维码按钮 */}
            {!qrImageUrl && (
              <Button
                unstyled
                borderWidth={0}
                borderRadius={999}
                paddingHorizontal={24}
                height={44}
                alignItems="center"
                justifyContent="center"
                cursor={fetchingQr ? 'not-allowed' : 'pointer'}
                // @ts-ignore web-only
                style={{
                  background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
                  boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
                  transition: 'opacity 0.2s ease',
                  opacity: fetchingQr ? 0.6 : 1,
                }}
                onPress={handleGetQrcode}
                disabled={fetchingQr}
              >
                <XStack alignItems="center" gap="$2">
                  <QrCode size={18} color="#ffffff" />
                  <Text color="#ffffff" fontWeight="600" fontSize={14}>
                    {fetchingQr ? '获取中…' : '获取二维码'}
                  </Text>
                </XStack>
              </Button>
            )}

            {/* 二维码显示区域 */}
            {qrImageUrl && (
              <YStack alignItems="center" gap="$3">
                <View
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: radius.xl,
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    padding: 8,
                    opacity: qrStatus === 'expired' || qrStatus === 'error' ? 0.3 : 1,
                    transition: 'opacity 0.3s ease',
                  } as any}
                >
                  <Image
                    source={{ uri: qrImageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                </View>

                {/* 状态提示 */}
                <Text fontSize={14} color={qrStatusColor} fontWeight="500" textAlign="center">
                  {qrMsg}
                </Text>

                {/* 过期后可重新获取 */}
                {(qrStatus === 'expired' || qrStatus === 'error') && (
                  <Button
                    unstyled
                    borderWidth={0}
                    borderRadius={999}
                    paddingHorizontal={20}
                    height={36}
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    // @ts-ignore web-only
                    style={{
                      background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
                      boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
                    }}
                    onPress={handleGetQrcode}
                  >
                    <Text color="#ffffff" fontWeight="600" fontSize={13}>
                      重新获取
                    </Text>
                  </Button>
                )}

                {confirming && (
                  <Text fontSize={13} color={mutedColor}>
                    正在完成登入…
                  </Text>
                )}
              </YStack>
            )}
          </YStack>
        )}
      </YStack>
    </Card>
  )
}

/** 基础配置卡片（STRM 基础地址等） */
function BaseConfigCard({ isDark, isMobile }: { isDark: boolean; isMobile: boolean }) {
  const { token } = useAuth()

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const primaryColor = isDark ? '#7dd9fb' : '#5bcffa'
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'

  const [strmBaseUrl, setStrmBaseUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastExiting, setToastExiting] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpExiting, setHelpExiting] = useState(false)
  const [helpPopoverPos, setHelpPopoverPos] = useState({ top: 0, left: 0 })
  const [helpHover, setHelpHover] = useState(false)
  const helpTriggerRef = useRef<View>(null)

  const closeHelp = useCallback(() => {
    setHelpExiting(true)
  }, [])

  useEffect(() => {
    if (!helpExiting) return
    const t = setTimeout(() => {
      setHelpOpen(false)
      setHelpExiting(false)
    }, 220)
    return () => clearTimeout(t)
  }, [helpExiting])

  const loadConfig = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const cfg = await apiGetConfig(token)
      setStrmBaseUrl(cfg.base.strm_base_url ?? '')
    } catch {
      setMessage({ type: 'err', text: '加载配置失败' })
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  useEffect(() => {
    if (!helpOpen) return
    const el = helpTriggerRef.current as any
    const dom = el instanceof HTMLElement ? el : el?._nativeTag ?? el?.getNode?.()
    if (dom?.getBoundingClientRect) {
      const rect = dom.getBoundingClientRect()
      setHelpPopoverPos({ top: rect.bottom + 6, left: rect.left })
    }
  }, [helpOpen])

  const handleSave = async () => {
    if (!token) return
    const startedAt = Date.now()
    setSaving(true)
    setMessage(null)
    setShowSuccessToast(false)
    try {
      await apiUpdateConfig(token, { base: { strm_base_url: strmBaseUrl || null } })
      setShowSuccessToast(true)
    } catch (e: any) {
      setMessage({ type: 'err', text: e?.message || '保存失败' })
    } finally {
      const elapsed = Date.now() - startedAt
      const minShowing = 520
      const delay = Math.max(0, minShowing - elapsed)
      setTimeout(() => setSaving(false), delay)
    }
  }

  useEffect(() => {
    if (!showSuccessToast) return
    const hideAt = 2500
    const exitDuration = 280
    const t1 = setTimeout(() => {
      setToastExiting(true)
    }, hideAt)
    const t2 = setTimeout(() => {
      setShowSuccessToast(false)
      setToastExiting(false)
    }, hideAt + exitDuration)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [showSuccessToast])

  if (loading) {
    return (
      <Card
        borderRadius={radius.xl}
        padding={isMobile ? '$4' : '$5'}
        className="stagger-item"
        style={{ ...glassCard(isDark), '--stagger-delay': '160ms' } as any}
      >
        <Text color={mutedColor}>加载中…</Text>
      </Card>
    )
  }

  return (
    <Card
      borderRadius={radius.xl}
      padding={isMobile ? '$4' : '$5'}
      className="stagger-item"
      style={{ ...glassCard(isDark), '--stagger-delay': '160ms' } as any}
    >
      <YStack gap="$4">
        <XStack alignItems="center" gap="$3">
          <YStack
            backgroundColor={isDark ? 'rgba(91,207,250,0.15)' : 'rgba(91,207,250,0.1)'}
            borderRadius={radius.lg}
            padding="$2"
          >
            <FileText size={20} color={primaryColor} />
          </YStack>
          <H4 color={textColor} fontWeight="600">
            基础配置
          </H4>
        </XStack>

        <YStack gap="$2">
          <XStack alignItems="center" gap="$2">
            <Text fontSize={14} color={textColor} fontWeight="500">
              STRM 文件基础地址
            </Text>
            <View
              ref={helpTriggerRef}
              style={{ alignItems: 'center', justifyContent: 'center' }}
              // @ts-expect-error web hover
              onMouseEnter={() => setHelpHover(true)}
              onMouseLeave={() => setHelpHover(false)}
            >
              <Pressable
                onPress={() => setHelpOpen((v) => !v)}
                style={{
                  padding: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                } as any}
              >
                <HelpCircle size={16} color={helpHover ? primaryColor : mutedColor} />
              </Pressable>
            </View>
          </XStack>
          {helpOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
            <>
              <style>{`
                @keyframes settings-help-popover-in {
                  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes settings-help-popover-out {
                  from { opacity: 1; transform: translateY(0) scale(1); }
                  to { opacity: 0; transform: translateY(-6px) scale(0.98); }
                }
                .settings-help-popover { animation: settings-help-popover-in 0.22s cubic-bezier(0.21, 0.47, 0.32, 1); }
                .settings-help-popover.settings-help-popover-out { animation: settings-help-popover-out 0.2s cubic-bezier(0.4, 0, 1, 1) forwards; }
              `}</style>
              <div
                role="presentation"
                style={{ position: 'fixed', inset: 0, zIndex: 99998 }}
                onMouseDown={closeHelp}
              />
              <div
                className={`settings-help-popover${helpExiting ? ' settings-help-popover-out' : ''}`}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: 'fixed',
                  top: helpPopoverPos.top,
                  left: helpPopoverPos.left,
                  zIndex: 99999,
                  maxWidth: 320,
                  padding: '14px 16px',
                  paddingLeft: 18,
                  borderRadius: radius.xl,
                  background: isDark ? '#1c1c1e' : '#ffffff',
                  border: `1px solid ${primaryColor}`,
                  boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
                  fontSize: 13,
                  color: mutedColor,
                  lineHeight: 1.55,
                }}
              >
                用于生成 STRM 文件时的基础 URL，留空则不设置。
              </div>
            </>,
            document.body,
          )}
          <StyledInput
            placeholder="例如 http://127.0.0.1:8000"
            value={strmBaseUrl}
            onChangeText={setStrmBaseUrl}
            width="100%"
            minWidth={isMobile ? undefined : 320}
            paddingVertical={isMobile ? 14 : undefined}
          />
        </YStack>

        {message?.type === 'err' && (
          <XStack
            alignItems="center"
            gap="$2"
            paddingVertical="$2"
            paddingHorizontal="$3"
            borderRadius={radius.lg}
            backgroundColor={isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)'}
            borderWidth={1}
            borderColor={isDark ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.25)'}
            alignSelf="flex-start"
            style={{ transition: 'opacity 0.2s ease' } as any}
          >
            <AlertCircle size={18} color="#ef4444" />
            <Text fontSize={14} fontWeight="500" color="#ef4444">
              {message.text}
            </Text>
          </XStack>
        )}

        {showSuccessToast && typeof document !== 'undefined' && ReactDOM.createPortal(
          <>
            <style>{`
              @keyframes settings-toast-in {
                from { opacity: 0; transform: translateX(24px); }
                to { opacity: 1; transform: translateX(0); }
              }
              @keyframes settings-toast-out {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(24px); }
              }
              .settings-success-toast { animation: settings-toast-in 0.32s cubic-bezier(0.21, 0.47, 0.32, 1); }
              .settings-success-toast.settings-toast-exit { animation: settings-toast-out 0.28s cubic-bezier(0.4, 0, 1, 1) forwards; }
            `}</style>
            <div
              className={`settings-success-toast${toastExiting ? ' settings-toast-exit' : ''}`}
              style={{
                position: 'fixed',
                top: 20,
                right: 20,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                borderRadius: radius.xl,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(30,30,30,0.72) 0%, rgba(45,45,45,0.68) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(248,252,248,0.68) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}`,
                boxShadow: isDark
                  ? '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 12px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <CheckCircle size={18} color="#22c55e" />
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#22c55e', letterSpacing: '0.02em' }}>
                保存成功
              </span>
            </div>
          </>,
          document.body,
        )}

        <Button
          unstyled
          borderWidth={0}
          borderRadius={999}
          paddingHorizontal={24}
          height={44}
          alignSelf="flex-start"
          alignItems="center"
          justifyContent="center"
          cursor={saving ? 'not-allowed' : 'pointer'}
          opacity={saving ? 0.85 : 1}
          style={{
            background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
            boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
            transition: 'opacity 0.2s ease',
          } as any}
          onPress={handleSave}
          disabled={saving}
        >
          <XStack alignItems="center" gap="$2">
            {saving && (
              <>
                {typeof document !== 'undefined' && (
                  <style>{`
                    @keyframes settings-save-spin { to { transform: rotate(360deg); } }
                  `}</style>
                )}
                <View
                  style={
                    typeof document !== 'undefined'
                      ? ({ animation: 'settings-save-spin 0.7s linear infinite' } as any)
                      : undefined
                  }
                >
                  <Loader2 size={16} color="#ffffff" />
                </View>
              </>
            )}
            <Text color="#ffffff" fontWeight="600" fontSize={14}>
              保存
            </Text>
          </XStack>
        </Button>
      </YStack>
    </Card>
  )
}

type SettingsTab = 'account' | 'base'

export default function SettingsScreen() {
  const { isDark } = useAppTheme()
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  const [activeTab, setActiveTab] = useState<SettingsTab>('account')

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isMobile ? 16 : 32 }}>
      <YStack gap={isMobile ? 20 : 24} maxWidth={1200}>
        {/* Header */}
        <YStack gap="$2" className="stagger-item" style={{ '--stagger-delay': '0ms' } as any}>
          <H2 color={textColor} fontWeight="700" fontSize={isMobile ? 22 : undefined}>
            配置
          </H2>
          {!isMobile && (
            <Paragraph color={mutedColor} fontSize={15}>
              管理系统配置和偏好设置。
            </Paragraph>
          )}
        </YStack>

        {/* 二级菜单栏 */}
        <XStack
          width="100%"
          borderRadius={radius.xl}
          padding={isMobile ? '$2' : '$3'}
          className="stagger-item"
          style={{ ...glassCard(isDark), gap: 0, flexWrap: 'wrap', '--stagger-delay': '80ms' } as any}
        >
          <Pressable
            onPress={() => setActiveTab('account')}
            style={{
              flex: isMobile ? 1 : undefined,
              minWidth: isMobile ? 0 : undefined,
              minHeight: 44,
              paddingVertical: isMobile ? 12 : 14,
              paddingHorizontal: isMobile ? 12 : 20,
              borderRadius: radius.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: activeTab === 'account' ? (isDark ? 'rgba(91,207,250,0.2)' : 'rgba(91,207,250,0.15)') : 'transparent',
              borderWidth: 1,
              borderColor: activeTab === 'account' ? (isDark ? 'rgba(91,207,250,0.4)' : 'rgba(91,207,250,0.35)') : 'transparent',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
              cursor: 'pointer',
            } as any}
          >
            <Key size={18} color={activeTab === 'account' ? (isDark ? '#7dd9fb' : '#5bcffa') : mutedColor} />
            <Text
              color={activeTab === 'account' ? textColor : mutedColor}
              fontWeight={activeTab === 'account' ? '600' : '500'}
              fontSize={isMobile ? 13 : 14}
            >
              账户配置
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('base')}
            style={{
              flex: isMobile ? 1 : undefined,
              minWidth: isMobile ? 0 : undefined,
              minHeight: 44,
              paddingVertical: isMobile ? 12 : 14,
              paddingHorizontal: isMobile ? 12 : 20,
              borderRadius: radius.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: activeTab === 'base' ? (isDark ? 'rgba(91,207,250,0.2)' : 'rgba(91,207,250,0.15)') : 'transparent',
              borderWidth: 1,
              borderColor: activeTab === 'base' ? (isDark ? 'rgba(91,207,250,0.4)' : 'rgba(91,207,250,0.35)') : 'transparent',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
              cursor: 'pointer',
            } as any}
          >
            <FileText size={18} color={activeTab === 'base' ? (isDark ? '#7dd9fb' : '#5bcffa') : mutedColor} />
            <Text
              color={activeTab === 'base' ? textColor : mutedColor}
              fontWeight={activeTab === 'base' ? '600' : '500'}
              fontSize={isMobile ? 13 : 14}
            >
              基础配置
            </Text>
          </Pressable>
        </XStack>

        {/* 账户配置 tab */}
        {activeTab === 'account' && (
          <P115LoginCard isDark={isDark} isMobile={isMobile} />
        )}

        {/* 基础配置 tab */}
        {activeTab === 'base' && (
          <BaseConfigCard isDark={isDark} isMobile={isMobile} />
        )}
      </YStack>
    </ScrollView>
  )
}
