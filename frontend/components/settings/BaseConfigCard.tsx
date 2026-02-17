import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { YStack, XStack, Text, Card, H4, Button } from 'tamagui'
import { Pressable, View } from 'react-native'
import { FileText, HelpCircle, Loader2 } from 'lucide-react-native'
import { radius, gradients, darkGradients, glassCard } from '@/constants/DesignTokens'
import { useAuth } from '@/contexts/AuthContext'
import { StyledInput } from '@/components/shared/StyledInput'
import { useToast, ToastViewport } from '@/components/shared/Toast'
import { apiGetConfig, apiUpdateConfig } from '@/lib/api'

/** 基础配置卡片（STRM 基础地址等） */
export function BaseConfigCard({ isDark, isMobile }: { isDark: boolean; isMobile: boolean }) {
  const { token } = useAuth()
  const { show: showToast, toasts } = useToast()

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const primaryColor = isDark ? '#7dd9fb' : '#5bcffa'

  const [strmBaseUrl, setStrmBaseUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
      showToast('error', '加载配置失败')
    } finally {
      setLoading(false)
    }
  }, [token, showToast])

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
    try {
      await apiUpdateConfig(token, { base: { strm_base_url: strmBaseUrl || null } })
      showToast('success', '保存成功')
    } catch (e: any) {
      showToast('error', e?.message || '保存失败')
    } finally {
      const elapsed = Date.now() - startedAt
      const minShowing = 520
      const delay = Math.max(0, minShowing - elapsed)
      setTimeout(() => setSaving(false), delay)
    }
  }

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
    <>
      <ToastViewport toasts={toasts} />
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
    </>
  )
}
