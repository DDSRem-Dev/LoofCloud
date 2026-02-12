import React, { useState } from 'react'
import { YStack, XStack, Text, Card, H2, H4, Paragraph } from 'tamagui'
import { ScrollView, useWindowDimensions, Pressable } from 'react-native'
import { HardDrive, Users, FileText, Activity, Upload, Download, Clock } from 'lucide-react-native'
import { radius, glassCard } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'

const statCards = [
  { label: '总文件数', value: '1,284', icon: FileText, color: '#5bcffa' },
  { label: '存储空间', value: '42.6 GB', icon: HardDrive, color: '#f5abb9' },
  { label: '活跃用户', value: '8', icon: Users, color: '#22c55e' },
  { label: '今日请求', value: '3,721', icon: Activity, color: '#6366f1' },
]

const recentActivities = [
  { action: '上传', file: 'project-report-2026.pdf', user: 'Admin', time: '5 分钟前', icon: Upload },
  { action: '下载', file: 'design-assets.zip', user: '张三', time: '12 分钟前', icon: Download },
  { action: '上传', file: 'meeting-notes.md', user: '李四', time: '30 分钟前', icon: Upload },
  { action: '修改', file: 'config.yaml', user: 'Admin', time: '1 小时前', icon: Clock },
  { action: '下载', file: 'backup-0212.tar.gz', user: '王五', time: '2 小时前', icon: Download },
]

export default function DashboardScreen() {
  const { isDark } = useAppTheme()
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const [activeCard, setActiveCard] = useState<number | null>(null)

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const borderColor = isDark ? '#282828' : '#e5e5e5'

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isMobile ? 16 : 32 }}>
      <YStack gap={isMobile ? 20 : 24} maxWidth={1200}>
        {/* Header */}
        <YStack gap="$2">
          <H2 color={textColor} fontWeight="700" fontSize={isMobile ? 22 : undefined}>
            仪表盘
          </H2>
          <Paragraph color={mutedColor} fontSize={isMobile ? 14 : 15}>
            欢迎回来，这里是 LoofCloud 管理面板概览。
          </Paragraph>
        </YStack>

        {/* Stats Cards */}
        <XStack gap={isMobile ? 12 : 16} flexWrap="wrap">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            const isSelected = activeCard === index
            return (
              <Pressable
                key={stat.label}
                onPress={() => {
                  setActiveCard(index)
                  setTimeout(() => setActiveCard(null), 500)
                }}
                // @ts-ignore web-only
                className="stagger-item"
                style={{
                  flex: 1,
                  minWidth: isMobile ? '45%' : 220,
                  flexBasis: isMobile ? '45%' : undefined,
                  '--stagger-delay': `${index * 80}ms`,
                } as any}
              >
                <Card
                  borderRadius={radius.xl}
                  padding={isMobile ? '$4' : '$5'}
                  // @ts-ignore web-only
                  className={isSelected ? 'card-active' : ''}
                  style={{
                    ...glassCard(isDark),
                    transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
                    cursor: 'pointer',
                    transform: isSelected ? undefined : 'scale(1)',
                  }}
                  hoverStyle={{
                    // @ts-ignore
                    style: {
                      transform: 'scale(1.03)',
                      boxShadow: isDark
                        ? '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                        : `0 12px 40px rgba(91,207,250,0.15), inset 0 1px 0 rgba(255,255,255,0.9)`,
                    }
                  }}
                >
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack gap="$2" flex={1}>
                      <Text fontSize={isMobile ? 12 : 13} color={mutedColor} fontWeight="500">
                        {stat.label}
                      </Text>
                      <Text fontSize={isMobile ? 22 : 28} fontWeight="700" color={textColor}>
                        {stat.value}
                      </Text>
                    </YStack>
                    <YStack
                      backgroundColor={`${stat.color}20`}
                      borderRadius={radius.lg}
                      padding="$2"
                      // @ts-ignore
                      style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                    >
                      <Icon size={isMobile ? 18 : 22} color={stat.color} />
                    </YStack>
                  </XStack>
                </Card>
              </Pressable>
            )
          })}
        </XStack>

        {/* Recent Activity */}
        <Card
          borderRadius={radius.xl}
          padding={isMobile ? '$4' : '$5'}
          // @ts-ignore web-only
          style={glassCard(isDark)}
        >
          <YStack gap="$4">
            <H4 color={textColor} fontWeight="600">
              最近活动
            </H4>
            <YStack gap="$1">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <XStack
                    key={index}
                    paddingVertical="$3"
                    paddingHorizontal={isMobile ? '$2' : '$3'}
                    alignItems="center"
                    gap="$3"
                    borderRadius={radius.lg}
                    // @ts-ignore web-only
                    className="stagger-item"
                    style={{ '--stagger-delay': `${index * 60}ms` } as any}
                    {...(index < recentActivities.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: borderColor,
                    })}
                  >
                    <YStack
                      backgroundColor={isDark ? 'rgba(91,207,250,0.15)' : 'rgba(91,207,250,0.1)'}
                      borderRadius={radius.lg}
                      padding="$2"
                    >
                      <Icon size={18} color={isDark ? '#7dd9fb' : '#5bcffa'} />
                    </YStack>
                    <YStack flex={1} gap="$1">
                      <Text fontSize={isMobile ? 13 : 14} color={textColor} fontWeight="500">
                        {activity.user} {activity.action}了{' '}
                        <Text fontWeight="600" color={isDark ? '#7dd9fb' : '#5bcffa'}>
                          {activity.file}
                        </Text>
                      </Text>
                    </YStack>
                    {!isMobile && (
                      <Text fontSize={13} color={mutedColor}>
                        {activity.time}
                      </Text>
                    )}
                  </XStack>
                )
              })}
            </YStack>
          </YStack>
        </Card>
      </YStack>
    </ScrollView>
  )
}
