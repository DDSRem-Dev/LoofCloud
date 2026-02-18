import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { YStack, XStack, Text, Card, H4, Button } from 'tamagui'
import { Pressable, View } from 'react-native'
import { HardDrive, HelpCircle, Loader2 } from 'lucide-react-native'
import { radius, gradients, darkGradients, glassCard } from '@/constants/DesignTokens'
import { useAuth } from '@/contexts/AuthContext'
import { StyledInput } from '@/components/shared/StyledInput'
import { useToast, ToastViewport } from '@/components/shared/Toast'
import { apiGetConfig, apiUpdateConfig, STORAGE_CONFIG_FIELDS } from '@/lib/api'
import type { StorageConfig } from '@/lib/api'

type StorageConfigFormState = Record<keyof StorageConfig, string>

const initialFormState = (): StorageConfigFormState =>
  Object.fromEntries(
    STORAGE_CONFIG_FIELDS.map((f) => [f.key, ''])
  ) as StorageConfigFormState

function storageToFormState(storage: StorageConfig): StorageConfigFormState {
  const state = initialFormState()
  for (const field of STORAGE_CONFIG_FIELDS) {
    const v = storage[field.key]
    state[field.key] = typeof v === 'string' ? v : (v ?? '') ? String(v) : ''
  }
  return state
}

function formStateToStorage(
  state: StorageConfigFormState
): { storage: Partial<StorageConfig> } {
  const storage: Partial<StorageConfig> = {}
  for (const field of STORAGE_CONFIG_FIELDS) {
    const raw = (state[field.key] ?? '').trim()
    ;(storage as any)[field.key] = raw || null
  }
  return { storage }
}

/** 存储配置卡片（网盘箱目录等） */
export function StorageConfigCard({
  isDark,
  isMobile,
}: {
  isDark: boolean
  isMobile: boolean
}) {
  const { token } = useAuth()
  const { show: showToast, toasts } = useToast()

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const primaryColor = isDark ? '#7dd9fb' : '#5bcffa'

  const [formState, setFormState] = useState<StorageConfigFormState>(initialFormState)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [helpFieldKey, setHelpFieldKey] = useState<keyof StorageConfig | null>(null)
  const [helpExiting, setHelpExiting] = useState(false)
  const [helpPopoverPos, setHelpPopoverPos] = useState({ top: 0, left: 0 })
  const [helpHoverKey, setHelpHoverKey] = useState<keyof StorageConfig | null>(null)
  const helpTriggerRef = useRef<View>(null)

  const closeHelp = useCallback(() => setHelpExiting(true), [])

  useEffect(() => {
    if (!helpExiting) return
    const t = setTimeout(() => {
      setHelpFieldKey(null)
      setHelpExiting(false)
    }, 220)
    return () => clearTimeout(t)
  }, [helpExiting])

  const loadConfig = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const cfg = await apiGetConfig(token)
      setFormState(storageToFormState(cfg.storage ?? { cloud_storage_box_dir: null }))
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
    if (helpFieldKey == null) return
    const el = helpTriggerRef.current as any
    const dom = el instanceof HTMLElement ? el : el?._nativeTag ?? el?.getNode?.()
    if (dom?.getBoundingClientRect) {
      const rect = dom.getBoundingClientRect()
      setHelpPopoverPos({ top: rect.bottom + 6, left: rect.left })
    }
  }, [helpFieldKey])

  const handleSave = async () => {
    if (!token) return
    const { storage } = formStateToStorage(formState)
    const startedAt = Date.now()
    setSaving(true)
    try {
      await apiUpdateConfig(token, { storage })
      showToast('success', '保存成功')
    } catch (e: any) {
      showToast('error', e?.message || '保存失败')
    } finally {
      const elapsed = Date.now() - startedAt
      setTimeout(() => setSaving(false), Math.max(0, 520 - elapsed))
    }
  }

  const updateField = useCallback((key: keyof StorageConfig, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }, [])

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
              <HardDrive size={20} color={primaryColor} />
            </YStack>
            <H4 color={textColor} fontWeight="600">
              存储配置
            </H4>
          </XStack>

          {STORAGE_CONFIG_FIELDS.map((field) => (
            <YStack key={field.key} gap="$2">
              <XStack alignItems="center" gap="$2">
                <Text fontSize={14} color={textColor} fontWeight="500">
                  {field.label}
                </Text>
                {field.help != null && (
                  <View
                    ref={helpFieldKey === field.key ? helpTriggerRef : undefined}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                    // @ts-expect-error web hover
                    onMouseEnter={() => setHelpHoverKey(field.key)}
                    onMouseLeave={() => setHelpHoverKey(null)}
                  >
                    <Pressable
                      onPress={() => setHelpFieldKey((k) => (k === field.key ? null : field.key))}
                      style={{
                        padding: 4,
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      } as any}
                    >
                      <HelpCircle
                        size={16}
                        color={helpHoverKey === field.key ? primaryColor : mutedColor}
                      />
                    </Pressable>
                  </View>
                )}
              </XStack>
              {helpFieldKey === field.key &&
                field.help &&
                typeof document !== 'undefined' &&
                ReactDOM.createPortal(
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
                      {field.help}
                    </div>
                  </>,
                  document.body
                )}
              <StyledInput
                placeholder={field.placeholder}
                value={formState[field.key]}
                onChangeText={(v) => updateField(field.key, v)}
                width="100%"
                minWidth={isMobile ? undefined : 320}
                paddingVertical={isMobile ? 14 : undefined}
              />
            </YStack>
          ))}

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
