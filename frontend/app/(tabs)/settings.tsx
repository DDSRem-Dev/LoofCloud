import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { YStack, XStack, Text, Card, H2, H4, Paragraph, Button } from 'tamagui'
import { ScrollView, useWindowDimensions, Pressable, View, Image } from 'react-native'
import { Settings, Key, LogOut, QrCode, ChevronDown, Check } from 'lucide-react-native'
import { radius, gradients, darkGradients, glassCard } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  apiP115Status,
  apiP115QrcodeToken,
  apiP115QrcodeImage,
  apiP115QrcodePoll,
  apiP115QrcodeConfirm,
  apiP115Logout,
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
        style={{ ...glassCard(isDark), '--stagger-delay': '0ms' } as any}
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
      style={{ ...glassCard(isDark), '--stagger-delay': '0ms' } as any}
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

type SettingsTab = 'account'

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
        <YStack gap="$2">
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
          style={{ ...glassCard(isDark), gap: 0, flexWrap: 'wrap', '--stagger-delay': '0ms' } as any}
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
        </XStack>

        {/* 账户配置 tab */}
        {activeTab === 'account' && (
          <P115LoginCard isDark={isDark} isMobile={isMobile} />
        )}
      </YStack>
    </ScrollView>
  )
}
