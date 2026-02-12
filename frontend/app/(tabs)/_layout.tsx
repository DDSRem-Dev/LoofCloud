import React, { useState } from 'react'
import { Slot } from 'expo-router'
import { XStack, YStack } from 'tamagui'
import { Sidebar, useMobile } from '@/components/shared/Sidebar'
import { MobileHeader } from '@/components/shared/MobileHeader'
import { useAppTheme } from '@/contexts/ThemeContext'
import { gradients, darkGradients } from '@/constants/DesignTokens'

export default function TabLayout() {
  const { isDark } = useAppTheme()
  const isMobile = useMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const bgGradient = isDark
    ? `linear-gradient(135deg, ${darkGradients.bgStart}, ${darkGradients.bgEnd})`
    : `linear-gradient(135deg, ${gradients.bgStart}, ${gradients.bgEnd})`

  return (
    <XStack flex={1} height="100vh">
      <Sidebar
        mobileOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <YStack
        flex={1}
        // @ts-ignore web-only style
        style={{
          background: bgGradient,
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        {isMobile && (
          <MobileHeader onMenuPress={() => setDrawerOpen(true)} />
        )}
        <Slot />
      </YStack>
    </XStack>
  )
}
