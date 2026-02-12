import React, { useState } from 'react'
import { YStack, XStack, Text, Card, H2, H4, Paragraph, Input, Button } from 'tamagui'
import { ScrollView, useWindowDimensions, Pressable, View } from 'react-native'
import { Globe, HardDrive, Shield, Bell } from 'lucide-react-native'
import { radius, gradients, darkGradients, glassCard } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'

interface SettingField {
  label: string
  description: string
  type: 'toggle' | 'input' | 'select'
  value?: string
  enabled?: boolean
}

interface SettingGroup {
  title: string
  icon: typeof Globe
  fields: SettingField[]
}

const settingGroups: SettingGroup[] = [
  {
    title: '常规设置',
    icon: Globe,
    fields: [
      { label: '站点名称', description: '显示在浏览器标题和侧边栏', type: 'input', value: 'LoofCloud' },
      { label: '站点描述', description: '用于 SEO 和分享链接预览', type: 'input', value: '个人云存储管理平台' },
      { label: '维护模式', description: '启用后仅管理员可访问', type: 'toggle', enabled: false },
    ],
  },
  {
    title: '存储设置',
    icon: HardDrive,
    fields: [
      { label: '存储路径', description: '文件存储的根目录', type: 'input', value: '/data/loofcloud' },
      { label: '最大文件大小', description: '单个文件上传的最大限制', type: 'input', value: '500 MB' },
      { label: '自动清理', description: '自动删除30天未访问的临时文件', type: 'toggle', enabled: true },
    ],
  },
  {
    title: '安全设置',
    icon: Shield,
    fields: [
      { label: '两步验证', description: '登录时需要额外验证码', type: 'toggle', enabled: false },
      { label: '密码最小长度', description: '用户密码的最小字符数', type: 'input', value: '8' },
      { label: '登录失败锁定', description: '5次失败后锁定账户15分钟', type: 'toggle', enabled: true },
    ],
  },
  {
    title: '通知设置',
    icon: Bell,
    fields: [
      { label: '邮件通知', description: '重要操作时发送邮件提醒', type: 'toggle', enabled: true },
      { label: '存储空间警告', description: '存储使用超过80%时提醒', type: 'toggle', enabled: true },
      { label: 'Webhook URL', description: '推送通知的回调地址', type: 'input', value: '' },
    ],
  },
]

function SettingToggle({ defaultChecked, isDark }: { defaultChecked?: boolean; isDark: boolean }) {
  const [checked, setChecked] = useState(!!defaultChecked)

  const trackColor = checked
    ? (isDark ? '#5bcffa' : '#f5abb9')
    : (isDark ? '#3a3a3a' : '#d4d4d4')

  return (
    <Pressable
      onPress={() => setChecked((v) => !v)}
      style={{ flexShrink: 0 }}
      // @ts-ignore web
      role="switch"
      aria-checked={checked}
    >
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

export default function SettingsScreen() {
  const { isDark } = useAppTheme()
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const borderColor = isDark ? '#282828' : '#e5e5e5'
  const inputBg = isDark ? '#1a1a1a' : '#f5f5f5'

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isMobile ? 16 : 32 }}>
      <YStack gap={isMobile ? 20 : 24} maxWidth={1200}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
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
          <Button
            unstyled
            borderWidth={0}
            borderRadius={999}
            paddingHorizontal={isMobile ? 20 : 24}
            height={40}
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            // @ts-ignore web-only
            style={{
              background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
              boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
            }}
            hoverStyle={{ scale: 1.03 }}
            pressStyle={{ scale: 0.97 }}
          >
            <Text color="#ffffff" fontWeight="600" fontSize={14}>
              保存更改
            </Text>
          </Button>
        </XStack>

        {/* Setting Groups */}
        {settingGroups.map((group, index) => {
          const Icon = group.icon
          return (
            <Card
              key={group.title}
              borderRadius={radius.xl}
              padding={isMobile ? '$4' : '$5'}
              // @ts-ignore web-only
              className="stagger-item"
              style={{ ...glassCard(isDark), '--stagger-delay': `${index * 100}ms` } as any}
            >
              <YStack gap="$4">
                {/* Group Header */}
                <XStack alignItems="center" gap="$3">
                  <YStack
                    backgroundColor={isDark ? 'rgba(91,207,250,0.15)' : 'rgba(91,207,250,0.1)'}
                    borderRadius={radius.lg}
                    padding="$2"
                  >
                    <Icon size={20} color={isDark ? '#7dd9fb' : '#5bcffa'} />
                  </YStack>
                  <H4 color={textColor} fontWeight="600">
                    {group.title}
                  </H4>
                </XStack>

                {/* Fields */}
                <YStack gap="$1">
                  {group.fields.map((field, index) => (
                    <XStack
                      key={field.label}
                      paddingVertical="$3"
                      paddingHorizontal="$2"
                      alignItems={isMobile && field.type === 'input' ? 'flex-start' : 'center'}
                      justifyContent="space-between"
                      flexDirection={isMobile && field.type === 'input' ? 'column' : 'row'}
                      gap={isMobile && field.type === 'input' ? '$3' : undefined}
                      borderRadius={radius.lg}
                      {...(index < group.fields.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: borderColor,
                      })}
                    >
                      <YStack flex={isMobile && field.type === 'input' ? undefined : 1} gap="$1" marginRight={isMobile ? 0 : '$4'}>
                        <Text fontSize={14} color={textColor} fontWeight="500">
                          {field.label}
                        </Text>
                        <Text fontSize={13} color={mutedColor}>
                          {field.description}
                        </Text>
                      </YStack>
                      {field.type === 'toggle' ? (
                        <SettingToggle defaultChecked={field.enabled} isDark={isDark} />
                      ) : (
                        <Input
                          width={isMobile ? '100%' : 240}
                          placeholder={field.label}
                          placeholderTextColor={mutedColor}
                          defaultValue={field.value}
                          backgroundColor={inputBg}
                          borderWidth={1}
                          borderColor={borderColor}
                          borderRadius={radius.lg}
                          color={textColor}
                          fontSize={14}
                          paddingHorizontal="$3"
                        />
                      )}
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            </Card>
          )
        })}
      </YStack>
    </ScrollView>
  )
}
