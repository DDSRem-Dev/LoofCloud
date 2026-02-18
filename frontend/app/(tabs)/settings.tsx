import React, { useState } from 'react'
import { YStack, XStack, Text, H2, Paragraph } from 'tamagui'
import { ScrollView, useWindowDimensions, Pressable } from 'react-native'
import { Key, FileText, HardDrive } from 'lucide-react-native'
import { radius, glassCard } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'
import { P115LoginCard } from '@/components/settings/P115LoginCard'
import { BaseConfigCard } from '@/components/settings/BaseConfigCard'
import { StorageConfigCard } from '@/components/settings/StorageConfigCard'

type SettingsTab = 'account' | 'base' | 'storage'

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
          <Pressable
            onPress={() => setActiveTab('storage')}
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
              backgroundColor: activeTab === 'storage' ? (isDark ? 'rgba(91,207,250,0.2)' : 'rgba(91,207,250,0.15)') : 'transparent',
              borderWidth: 1,
              borderColor: activeTab === 'storage' ? (isDark ? 'rgba(91,207,250,0.4)' : 'rgba(91,207,250,0.35)') : 'transparent',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
              cursor: 'pointer',
            } as any}
          >
            <HardDrive size={18} color={activeTab === 'storage' ? (isDark ? '#7dd9fb' : '#5bcffa') : mutedColor} />
            <Text
              color={activeTab === 'storage' ? textColor : mutedColor}
              fontWeight={activeTab === 'storage' ? '600' : '500'}
              fontSize={isMobile ? 13 : 14}
            >
              存储配置
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

        {/* 存储配置 tab */}
        {activeTab === 'storage' && (
          <StorageConfigCard isDark={isDark} isMobile={isMobile} />
        )}
      </YStack>
    </ScrollView>
  )
}
