import React from 'react'
import { XStack, Text, Button } from 'tamagui'
import { Menu, Cloud } from 'lucide-react-native'
import { useAppTheme } from '@/contexts/ThemeContext'

interface MobileHeaderProps {
  onMenuPress: () => void
}

export function MobileHeader({ onMenuPress }: MobileHeaderProps) {
  const { isDark } = useAppTheme()

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
      }}
    >
      <Button
        unstyled
        borderWidth={0}
        padding="$2"
        cursor="pointer"
        onPress={onMenuPress}
      >
        <Menu size={24} color={isDark ? '#f2f2f2' : '#333333'} />
      </Button>
      <XStack alignItems="center" gap="$2">
        <Cloud size={22} color={isDark ? '#7dd9fb' : '#5bcffa'} />
        <Text fontSize={17} fontWeight="700" color={isDark ? '#f2f2f2' : '#333333'}>
          LoofCloud
        </Text>
      </XStack>
    </XStack>
  )
}
