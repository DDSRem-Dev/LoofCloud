import React from 'react'
import { XStack, Text, Button, useTheme } from 'tamagui'
import { Menu, Cloud } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useAppTheme } from '@/contexts/ThemeContext'

interface MobileHeaderProps {
  onMenuPress: () => void
}

export function MobileHeader({ onMenuPress }: MobileHeaderProps) {
  const { isDark } = useAppTheme()
  const theme = useTheme()
  const router = useRouter()

  return (
    <XStack
      height={56}
      paddingHorizontal="$4"
      alignItems="center"
      gap="$3"
      backgroundColor={isDark ? '#1a1d23' : '#ffffff'}
      borderBottomWidth={1}
      borderBottomColor={isDark ? '#282828' : '#e5e5e5'}
      // @ts-ignore web-only
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background-color 0.35s ease',
      }}
    >
      <Button
        unstyled
        borderWidth={0}
        borderRadius={8}
        padding="$2"
        cursor="pointer"
        backgroundColor="transparent"
        hoverStyle={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        }}
        onPress={onMenuPress}
      >
        <Menu size={24} color={(theme as any).mutedForeground?.get()} />
      </Button>
      <XStack
        alignItems="center"
        gap="$2"
        cursor="pointer"
        onPress={() => router.push('/' as any)}
      >
        <Cloud size={22} color={isDark ? '#7dd9fb' : '#5bcffa'} />
        <Text fontSize={17} fontWeight="700" color={isDark ? '#f2f2f2' : '#333333'}>
          LoofCloud
        </Text>
      </XStack>
    </XStack>
  )
}
