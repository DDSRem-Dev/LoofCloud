import React, { useCallback, useEffect, useState } from 'react'
import { YStack, XStack, Text, Card, H4, Button } from 'tamagui'
import { Pressable, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated'
import { RefreshCw, Loader2 } from 'lucide-react-native'
import { radius, gradients, darkGradients, glassCard } from '@/constants/DesignTokens'
import { useAuth } from '@/contexts/AuthContext'
import { StyledInput } from '@/components/shared/StyledInput'
import { useToast, ToastViewport } from '@/components/shared/Toast'
import { apiGetConfig, apiUpdateConfig } from '@/lib/api'
import type { FullSyncConfig } from '@/lib/api'

const OVERWRITE_OPTIONS: { value: 'never' | 'always'; label: string }[] = [
  { value: 'never', label: '从不' },
  { value: 'always', label: '总是' },
]

const segmentSpring = { damping: 22, stiffness: 320 }

function OverwriteSegment({
  value,
  onSelect,
  isDark,
}: {
  value: 'never' | 'always'
  onSelect: (v: 'never' | 'always') => void
  isDark: boolean
}) {
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
  const selectedBgNever = isDark ? 'rgba(91,207,250,0.2)' : 'rgba(91,207,250,0.15)'
  const selectedBorderNever = isDark ? 'rgba(91,207,250,0.4)' : 'rgba(91,207,250,0.35)'
  const selectedBgAlways = isDark ? 'rgba(245,171,185,0.2)' : 'rgba(245,171,185,0.15)'
  const selectedBorderAlways = isDark ? 'rgba(245,171,185,0.4)' : 'rgba(245,171,185,0.35)'
  const textColor = isDark ? '#f2f2f2' : '#333333'

  const selectedValue = useSharedValue(value === 'always' ? 1 : 0)
  useEffect(() => {
    selectedValue.value = withSpring(value === 'always' ? 1 : 0, segmentSpring)
  }, [value, selectedValue])

  const opt0Style = useAnimatedStyle(() => {
    const t = interpolate(selectedValue.value, [0, 1], [1, 0])
    return {
      backgroundColor: interpolateColor(t, [0, 1], [inputBg, selectedBgNever]),
      borderColor: interpolateColor(t, [0, 1], [borderColor, selectedBorderNever]),
      borderRadius: radius.lg,
      borderWidth: 1,
      transform: [{ scale: interpolate(t, [0, 1], [0.97, 1]) }],
    }
  })
  const opt1Style = useAnimatedStyle(() => {
    const t = interpolate(selectedValue.value, [0, 1], [0, 1])
    return {
      backgroundColor: interpolateColor(t, [0, 1], [inputBg, selectedBgAlways]),
      borderColor: interpolateColor(t, [0, 1], [borderColor, selectedBorderAlways]),
      borderRadius: radius.lg,
      borderWidth: 1,
      transform: [{ scale: interpolate(t, [0, 1], [0.97, 1]) }],
    }
  })

  return (
    <XStack gap="$2" flexWrap="wrap">
      {OVERWRITE_OPTIONS.map((opt, index) => {
        const isFirst = index === 0
        const animStyle = isFirst ? opt0Style : opt1Style
        return (
          <Animated.View key={opt.value} style={animStyle}>
            <Pressable
              onPress={() => onSelect(opt.value)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                cursor: 'pointer',
              } as any}
            >
              <Text
                fontSize={14}
                color={
                  value === opt.value
                    ? opt.value === 'never'
                      ? '#5bcffa'
                      : '#f5abb9'
                    : textColor
                }
                fontWeight={value === opt.value ? '600' : '500'}
              >
                {opt.label}
              </Text>
            </Pressable>
          </Animated.View>
        )
      })}
    </XStack>
  )
}

function SwitchToggle({
  checked,
  onToggle,
  isDark,
}: {
  checked: boolean
  onToggle: () => void
  isDark: boolean
}) {
  const trackColor = checked
    ? (isDark ? '#5bcffa' : '#f5abb9')
    : (isDark ? '#3a3a3a' : '#d4d4d4')
  return (
    <Pressable onPress={onToggle} style={{ flexShrink: 0 }} role="switch" aria-checked={checked}>
      <View
        style={{
          width: 48,
          height: 26,
          borderRadius: 13,
          backgroundColor: trackColor,
          padding: 3,
          justifyContent: 'center',
          transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        } as any}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transform: checked ? 'translateX(22px)' : 'translateX(0)',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          } as any}
        />
      </View>
    </Pressable>
  )
}

const defaultFullSync = (): FullSyncConfig => ({
  overwrite_mode: 'never',
  auto_download_mediainfo_enabled: false,
  min_file_size: null,
  path: null,
  detail_log: true,
})

function parseSizeToBytes(str: string): number | null {
  const s = str.trim()
  if (s === '') return null
  const m = s.match(/^(\d+(?:\.\d+)?)\s*([KMGTP]B?)?$/i)
  if (!m) return null
  const num = parseFloat(m[1])
  if (Number.isNaN(num) || num < 0) return null
  const unit = (m[2] ?? '').toUpperCase().replace('B', '')
  const powers: Record<string, number> = { K: 1, M: 2, G: 3, T: 4, P: 5 }
  const power = unit ? powers[unit] ?? 0 : 0
  const factor = power ? Math.pow(1024, power) : 1
  const bytes = Math.floor(num * factor)
  return bytes < 0 ? null : bytes
}

function formatBytesToHuman(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let u = 0
  let n = bytes
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024
    u += 1
  }
  const value = u === 0 ? Math.round(n) : Math.round(n * 100) / 100
  return `${value} ${units[u]}`
}

/** 全量同步配置卡片 */
export function FullSyncConfigCard({
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
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'

  const [config, setConfig] = useState<FullSyncConfig>(defaultFullSync)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [overwrite_mode, setOverwriteMode] = useState<'never' | 'always'>('never')
  const [auto_download_mediainfo_enabled, setAutoDownloadMediainfo] = useState(false)
  const [min_file_size, setMinFileSize] = useState('')
  const [path, setPath] = useState('')
  const [detail_log, setDetailLog] = useState(true)

  const loadConfig = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const cfg = await apiGetConfig(token)
      const fs = cfg.full_sync ?? defaultFullSync()
      setConfig(fs)
      setOverwriteMode(fs.overwrite_mode)
      setAutoDownloadMediainfo(fs.auto_download_mediainfo_enabled)
      setMinFileSize(
        fs.min_file_size != null ? formatBytesToHuman(fs.min_file_size) : ''
      )
      setPath(fs.path ?? '')
      setDetailLog(fs.detail_log)
    } catch {
      showToast('error', '加载配置失败')
    } finally {
      setLoading(false)
    }
  }, [token, showToast])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const handleSave = async () => {
    if (!token) return
    let minSize: number | null = null
    if (min_file_size.trim() !== '') {
      const parsed = parseSizeToBytes(min_file_size)
      if (parsed === null) {
        showToast('error', '无效大小，支持如 5G、500M、1.5G、1024K，留空不限制')
        return
      }
      minSize = parsed
    }
    const startedAt = Date.now()
    setSaving(true)
    try {
      await apiUpdateConfig(token, {
        full_sync: {
          overwrite_mode,
          auto_download_mediainfo_enabled,
          min_file_size: minSize,
          path: path.trim() || null,
          detail_log,
        },
      })
      showToast('success', '保存成功')
    } catch (e: any) {
      showToast('error', e?.message || '保存失败')
    } finally {
      const elapsed = Date.now() - startedAt
      setTimeout(() => setSaving(false), Math.max(0, 520 - elapsed))
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
              <RefreshCw size={20} color={primaryColor} />
            </YStack>
            <H4 color={textColor} fontWeight="600">
              全量同步配置
            </H4>
          </XStack>

          {/* 覆盖模式 */}
          <YStack gap="$2">
            <Text fontSize={14} color={textColor} fontWeight="500">
              同步覆盖模式
            </Text>
            <OverwriteSegment
              value={overwrite_mode}
              onSelect={setOverwriteMode}
              isDark={isDark}
            />
          </YStack>

          {/* 下载媒体信息文件 */}
          <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$2">
            <YStack flex={1} maxWidth={280}>
              <Text fontSize={14} color={textColor} fontWeight="500">
                下载媒体信息文件
              </Text>
              <Text fontSize={12} color={mutedColor} marginTop="$1">
                全量同步时是否自动下载媒体信息文件
              </Text>
            </YStack>
            <SwitchToggle
              checked={auto_download_mediainfo_enabled}
              onToggle={() => setAutoDownloadMediainfo((v) => !v)}
              isDark={isDark}
            />
          </XStack>

          {/* 最小文件大小 */}
          <YStack gap="$2">
            <Text fontSize={14} color={textColor} fontWeight="500">
              全量生成最小文件大小
            </Text>
            <StyledInput
              placeholder="例如 5G、500M、1024K，留空不限制"
              value={min_file_size}
              onChangeText={setMinFileSize}
              width="100%"
              minWidth={isMobile ? undefined : 200}
              paddingVertical={isMobile ? 14 : undefined}
            />
          </YStack>

          {/* 全量同步路径 */}
          <YStack gap="$2">
            <Text fontSize={14} color={textColor} fontWeight="500">
              网盘同步路径
            </Text>
            <StyledInput
              value={path}
              onChangeText={setPath}
              width="100%"
              minWidth={isMobile ? undefined : 320}
              paddingVertical={isMobile ? 14 : undefined}
            />
          </YStack>

          {/* 详细日志 */}
          <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$2">
            <YStack flex={1} maxWidth={280}>
              <Text fontSize={14} color={textColor} fontWeight="500">
                输出详细日志
              </Text>
            </YStack>
            <SwitchToggle
              checked={detail_log}
              onToggle={() => setDetailLog((v) => !v)}
              isDark={isDark}
            />
          </XStack>

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
                      @keyframes fullsync-save-spin { to { transform: rotate(360deg); } }
                    `}</style>
                  )}
                  <View
                    style={
                      typeof document !== 'undefined'
                        ? ({ animation: 'fullsync-save-spin 0.7s linear infinite' } as any)
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
