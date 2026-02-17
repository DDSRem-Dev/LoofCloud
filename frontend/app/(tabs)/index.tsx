import React, { useEffect, useState } from 'react'
import { YStack, XStack, Text, Card, H2, H4, Paragraph } from 'tamagui'
import { ScrollView, useWindowDimensions, Pressable, Image, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { HardDrive, User, Settings } from 'lucide-react-native'
import { radius, glassCard } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { apiP115Dashboard, type P115Dashboard } from '@/lib/api'

const springConfig = { damping: 20, stiffness: 380 }
const enterTiming = { duration: 520, easing: Easing.out(Easing.cubic) }

function useEntranceAnim(delay: number) {
  const progress = useSharedValue(0)
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, enterTiming))
  }, [])
  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [28, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.97, 1]) },
    ],
  }))
  return animStyle
}

function AnimatedPressableCard({
  children,
  style,
  index = 0,
}: {
  children: React.ReactNode
  style?: Record<string, unknown>
  index?: number
}) {
  const scale = useSharedValue(1)
  const entrance = useEntranceAnim(160 + index * 100)
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
  return (
    <Animated.View style={[styles.pressableCard, style, entrance]}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97, springConfig)
        }}
        onPressOut={() => {
          scale.value = withSpring(1, springConfig)
        }}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.animatedCard, pressStyle]}>{children}</Animated.View>
      </Pressable>
    </Animated.View>
  )
}

export default function DashboardScreen() {
  const { token } = useAuth()
  const router = useRouter()
  const { isDark } = useAppTheme()
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  const [dashboard, setDashboard] = useState<P115Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    apiP115Dashboard(token)
      .then((data) => {
        if (!cancelled) setDashboard(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '获取仪表盘失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'

  const headerAnim = useEntranceAnim(0)

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isMobile ? 16 : 32 }}>
      <YStack gap={isMobile ? 20 : 24} maxWidth={1200}>
        <Animated.View style={headerAnim}>
          <YStack gap="$2">
            <H2 color={textColor} fontWeight="700" fontSize={isMobile ? 22 : undefined}>
              仪表盘
            </H2>
            <Paragraph color={mutedColor} fontSize={isMobile ? 14 : 15}>
              115 网盘账户与存储概览
            </Paragraph>
          </YStack>
        </Animated.View>

        {loading && (
          <AnimatedPressableCard index={0}>
            <Card borderRadius={radius.xl} padding="$5" style={glassCard(isDark)}>
              <Text color={mutedColor}>加载中…</Text>
            </Card>
          </AnimatedPressableCard>
        )}

        {error && (
          <AnimatedPressableCard index={0}>
            <Card borderRadius={radius.xl} padding="$5" style={glassCard(isDark)}>
              <Text color="#ef4444">{error}</Text>
            </Card>
          </AnimatedPressableCard>
        )}

        {!loading && !error && dashboard && !dashboard.logged_in && (
          <AnimatedPressableCard style={{ flex: 1 }} index={0}>
            <Card
              borderRadius={radius.xl}
              padding={isMobile ? '$4' : '$5'}
              style={{
                ...glassCard(isDark),
                cursor: 'pointer',
              }}
            >
            <YStack gap="$4" alignItems="center" paddingVertical="$4">
              <YStack
                backgroundColor={isDark ? 'rgba(91,207,250,0.15)' : 'rgba(91,207,250,0.1)'}
                borderRadius={radius.xl}
                padding="$4"
              >
                <User size={40} color={isDark ? '#7dd9fb' : '#5bcffa'} />
              </YStack>
              <YStack gap="$2" alignItems="center">
                <H4 color={textColor} fontWeight="600">
                  未登入 115 网盘
                </H4>
                <Paragraph color={mutedColor} textAlign="center" maxWidth={320}>
                  请先在「配置」中扫码登入 115 网盘，即可在此查看账户与存储信息。
                </Paragraph>
              </YStack>
              <Pressable onPress={() => router.push('/settings' as any)}>
                <XStack
                  alignItems="center"
                  gap="$2"
                  backgroundColor={isDark ? 'rgba(91,207,250,0.2)' : 'rgba(91,207,250,0.15)'}
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  borderRadius={radius.lg}
                >
                  <Settings size={18} color={isDark ? '#7dd9fb' : '#5bcffa'} />
                  <Text color={isDark ? '#7dd9fb' : '#5bcffa'} fontWeight="600">
                    去配置
                  </Text>
                </XStack>
              </Pressable>
            </YStack>
            </Card>
          </AnimatedPressableCard>
        )}

        {!loading && !error && dashboard?.logged_in && (
          <XStack gap={isMobile ? 12 : 16} flexWrap="wrap">
            {/* 用户信息卡片 */}
            {dashboard.user_info && (
              <AnimatedPressableCard
                style={{ flex: 1, minWidth: isMobile ? '100%' : 320 }}
                index={0}
              >
                <Card
                  borderRadius={radius.xl}
                  padding={isMobile ? '$4' : '$5'}
                  style={{
                    flex: 1,
                    minWidth: isMobile ? '100%' : 320,
                    ...glassCard(isDark),
                    cursor: 'pointer',
                  }}
                >
                <YStack gap="$4">
                  <XStack alignItems="center" gap="$3">
                    <YStack
                      backgroundColor={`#f5abb920`}
                      borderRadius={radius.lg}
                      padding="$2"
                      style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      } as any}
                    >
                      <User size={isMobile ? 22 : 28} color="#f5abb9" />
                    </YStack>
                    <Text fontSize={isMobile ? 13 : 14} color={mutedColor} fontWeight="500">
                      用户信息
                    </Text>
                  </XStack>
                  <XStack alignItems="center" gap="$3">
                    {dashboard.user_info.face?.face_m || dashboard.user_info.face?.face_s ? (
                      <Image
                        source={{ uri: dashboard.user_info.face.face_m || dashboard.user_info.face.face_s }}
                        style={{ width: 56, height: 56, borderRadius: 28 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <YStack
                        width={56}
                        height={56}
                        borderRadius={28}
                        backgroundColor={isDark ? 'rgba(91,207,250,0.2)' : 'rgba(91,207,250,0.15)'}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <User size={28} color={isDark ? '#7dd9fb' : '#5bcffa'} />
                      </YStack>
                    )}
                    <YStack gap="$1" flex={1}>
                      <Text fontSize={isMobile ? 18 : 20} fontWeight="700" color={textColor}>
                        {dashboard.user_info.uname || `用户 ${dashboard.user_info.uid}`}
                      </Text>
                      {dashboard.user_info.vip?.is_vip && (
                        <Text fontSize={13} color={mutedColor}>
                          VIP 到期：{dashboard.user_info.vip.expire_str || dashboard.user_info.vip.expire || '—'}
                        </Text>
                      )}
                      {!dashboard.user_info.vip?.is_vip && (
                        <Text fontSize={13} color={mutedColor}>普通用户</Text>
                      )}
                    </YStack>
                  </XStack>
                </YStack>
                </Card>
              </AnimatedPressableCard>
            )}

            {/* 存储信息卡片 */}
            {dashboard.storage_info?.space_info && (
              <AnimatedPressableCard
                style={{ flex: 1, minWidth: isMobile ? '100%' : 320 }}
                index={1}
              >
                <Card
                  borderRadius={radius.xl}
                  padding={isMobile ? '$4' : '$5'}
                  style={{
                    flex: 1,
                    minWidth: isMobile ? '100%' : 320,
                    ...glassCard(isDark),
                    cursor: 'pointer',
                  }}
                >
                <YStack gap="$4">
                  <XStack alignItems="center" gap="$3">
                    <YStack
                      backgroundColor={`#5bcffa20`}
                      borderRadius={radius.lg}
                      padding="$2"
                      style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      } as any}
                    >
                      <HardDrive size={isMobile ? 22 : 28} color="#5bcffa" />
                    </YStack>
                    <Text fontSize={isMobile ? 13 : 14} color={mutedColor} fontWeight="500">
                      存储空间
                    </Text>
                  </XStack>
                  <YStack gap="$3">
                    {dashboard.storage_info.space_info.all_total && (
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text fontSize={14} color={mutedColor}>总容量</Text>
                        <Text fontSize={16} fontWeight="600" color={textColor}>
                          {dashboard.storage_info.space_info.all_total.size_format}
                        </Text>
                      </XStack>
                    )}
                    {dashboard.storage_info.space_info.all_use && (
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text fontSize={14} color={mutedColor}>已用</Text>
                        <Text fontSize={16} fontWeight="600" color="#f5abb9">
                          {dashboard.storage_info.space_info.all_use.size_format}
                        </Text>
                      </XStack>
                    )}
                    {dashboard.storage_info.space_info.all_remain && (
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text fontSize={14} color={mutedColor}>剩余</Text>
                        <Text fontSize={16} fontWeight="600" color="#22c55e">
                          {dashboard.storage_info.space_info.all_remain.size_format}
                        </Text>
                      </XStack>
                    )}
                  </YStack>
                </YStack>
                </Card>
              </AnimatedPressableCard>
            )}
          </XStack>
        )}
      </YStack>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  pressableCard: {
    flex: 1,
  },
  animatedCard: {
    flex: 1,
  },
})
