import { Stack, useRouter } from 'expo-router'
import { YStack, Text, Button, H1, Paragraph } from 'tamagui'
import { useAppTheme } from '@/contexts/ThemeContext'
import { colors, darkColors } from '@/constants/DesignTokens'

export default function NotFoundScreen() {
  const { colorScheme } = useAppTheme()
  const isDark = colorScheme === 'dark'
  const c = isDark ? darkColors : colors
  const router = useRouter()

  return (
    <>
      <Stack.Screen options={{ title: '页面未找到' }} />
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$6"
        backgroundColor={c.background}
        gap="$4"
      >
        <Text fontSize={72} lineHeight={80} opacity={0.15} fontWeight="900" color={c.primary}>
          404
        </Text>
        <H1 color={c.foreground} fontSize={22} fontWeight="700">
          页面未找到
        </H1>
        <Paragraph color={c.mutedForeground} textAlign="center" fontSize={15}>
          抱歉，您访问的页面不存在或已被移除。
        </Paragraph>
        <Button
          marginTop="$2"
          backgroundColor={c.primary}
          borderRadius={8}
          paddingHorizontal="$5"
          paddingVertical="$2.5"
          pressStyle={{ opacity: 0.85 }}
          onPress={() => router.replace('/')}
        >
          <Text color={c.primaryForeground} fontWeight="600" fontSize={14}>
            返回首页
          </Text>
        </Button>
      </YStack>
    </>
  )
}
