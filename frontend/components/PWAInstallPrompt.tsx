import React from 'react'
import { Platform } from 'react-native'
import { YStack, XStack, Button, Text, Card, H4, Paragraph } from 'tamagui'
import { usePWA } from '@/hooks/usePWA'
import { colors, radius } from '@/constants/DesignTokens'

/**
 * PWA 安装提示弹窗组件
 * 粉色美化设计，仅在 Web 平台显示
 */
export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA()
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasDismissed, setHasDismissed] = React.useState(false)

  React.useEffect(() => {
    if (Platform.OS === 'web' && isInstallable && !isInstalled && !hasDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isInstallable, isInstalled, hasDismissed])

  const handleInstall = async () => {
    const success = await promptInstall()
    if (success) {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setHasDismissed(true)
    // 保存到 localStorage，24小时内不再显示
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }
  }

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissedTime = localStorage.getItem('pwa-install-dismissed')
      if (dismissedTime) {
        const timeDiff = Date.now() - parseInt(dismissedTime, 10)
        const hours24 = 24 * 60 * 60 * 1000
        if (timeDiff < hours24) {
          setHasDismissed(true)
        } else {
          localStorage.removeItem('pwa-install-dismissed')
        }
      }
    }
  }, [])

  if (!isVisible || Platform.OS !== 'web') {
    return null
  }

  return (
    <YStack
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={1000}
      padding="$4"
      pointerEvents="box-none"
      style={{
        // 添加背景遮罩动画
        animation: 'fadeInUp 0.3s ease-out',
      }}
    >
      <Card
        backgroundColor={colors.secondary}
        borderRadius={radius.lg}
        padding="$4"
        maxWidth={500}
        width="100%"
        alignSelf="center"
        elevation={4}
        shadowColor="#000000"
        shadowOpacity={0.2}
        shadowRadius={8}
        shadowOffset={{ width: 0, height: 4 }}
        style={{
          border: `2px solid ${colors.secondaryHover}`,
        }}
      >
        <YStack gap="$3">
          {/* 标题和关闭按钮 */}
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1} gap="$2">
              <H4 color="#ffffff" fontWeight="600">
                安装 LoofCloud
              </H4>
              <Paragraph color="#ffffff" opacity={0.9} fontSize="$4">
                将应用添加到主屏幕，获得更好的体验
              </Paragraph>
            </YStack>
            <Button
              size="$2"
              circular
              backgroundColor="transparent"
              pressStyle={{ opacity: 0.7 }}
              onPress={handleDismiss}
              style={{
                minWidth: 32,
                minHeight: 32,
              }}
            >
              <Text color="#ffffff" fontSize="$5">×</Text>
            </Button>
          </XStack>

          {/* 功能列表 */}
          <YStack gap="$2" marginTop="$2">
            <XStack gap="$2" alignItems="center">
              <Text color="#ffffff" fontSize="$6">✨</Text>
              <Text color="#ffffff" opacity={0.9} fontSize="$3">
                快速访问，无需浏览器
              </Text>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <Text color="#ffffff" fontSize="$6">🚀</Text>
              <Text color="#ffffff" opacity={0.9} fontSize="$3">
                离线使用，更快加载
              </Text>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <Text color="#ffffff" fontSize="$6">📱</Text>
              <Text color="#ffffff" opacity={0.9} fontSize="$3">
                原生体验，流畅操作
              </Text>
            </XStack>
          </YStack>

          {/* 按钮组 */}
          <XStack gap="$3" marginTop="$3">
            <Button
              flex={1}
              backgroundColor="#ffffff"
              color={colors.secondary}
              borderRadius={radius.md}
              fontWeight="600"
              pressStyle={{
                backgroundColor: '#f0f0f0',
                scale: 0.98,
              }}
              onPress={handleInstall}
            >
              立即安装
            </Button>
            <Button
              backgroundColor="transparent"
              borderColor="#ffffff"
              borderWidth={1}
              color="#ffffff"
              borderRadius={radius.md}
              pressStyle={{
                opacity: 0.7,
                scale: 0.98,
              }}
              onPress={handleDismiss}
            >
              稍后
            </Button>
          </XStack>
        </YStack>
      </Card>

      {/* 添加 CSS 动画 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `,
        }}
      />
    </YStack>
  )
}
