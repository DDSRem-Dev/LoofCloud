import React, { useState, useEffect } from 'react'
import { YStack, XStack, Text, Button, useTheme } from 'tamagui'
import { usePathname, useRouter } from 'expo-router'
import { Dimensions } from 'react-native'
import { LayoutDashboard, FolderOpen, Settings, Sun, Moon, Cloud, X } from 'lucide-react-native'
import { gradients, darkGradients } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  href: string
}

const navItems: NavItem[] = [
  { label: '仪表盘', icon: LayoutDashboard, href: '/' },
  { label: '文件管理', icon: FolderOpen, href: '/files' },
  { label: '配置', icon: Settings, href: '/settings' },
]

const SIDEBAR_WIDTH = 256
const MOBILE_BREAKPOINT = 768

function useMobile() {
  const [isMobile, setIsMobile] = React.useState(() => {
    return Dimensions.get('window').width < MOBILE_BREAKPOINT
  })

  React.useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setIsMobile(window.width < MOBILE_BREAKPOINT)
    })
    return () => sub.remove()
  }, [])

  return isMobile
}

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export { useMobile, MOBILE_BREAKPOINT }

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const { isDark, toggleColorScheme } = useAppTheme()
  const isMobile = useMobile()

  // Animate drawer mount/unmount
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (mobileOpen) {
      setVisible(true)
      // Double rAF ensures browser has painted the initial state before transitioning
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true))
      })
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setVisible(false), 350)
      return () => clearTimeout(timer)
    }
  }, [mobileOpen])

  const activeGradient = isDark ? darkGradients.shokaButton : gradients.shokaButton

  const handleNav = (href: string) => {
    router.push(href as any)
    if (isMobile && onClose) onClose()
  }

  const sidebarContent = (
    <YStack
      width={SIDEBAR_WIDTH}
      minWidth={SIDEBAR_WIDTH}
      maxWidth={SIDEBAR_WIDTH}
      height="100vh"
      backgroundColor={isDark ? '#1a1d23' : '#ffffff'}
      borderRightWidth={isMobile ? 0 : 1}
      borderRightColor={theme.borderColor?.get()}
      justifyContent="space-between"
      // @ts-ignore web-only
      style={{ transition: 'background-color 0.35s ease' }}
    >
      {/* Logo / Title */}
      <YStack>
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$5"
          alignItems="center"
          justifyContent="space-between"
        >
          <XStack
            alignItems="center"
            gap="$3"
            cursor="pointer"
            onPress={() => handleNav('/')}
          >
            <Cloud size={28} color={isDark ? '#7dd9fb' : '#5bcffa'} />
            <Text fontSize={20} fontWeight="700" color={isDark ? '#f2f2f2' : '#333333'}>
              LoofCloud
            </Text>
          </XStack>
          {isMobile && (
            <Button
              unstyled
              borderWidth={0}
              padding="$2"
              cursor="pointer"
              onPress={onClose}
            >
              <X size={22} color={isDark ? '#a1a1a1' : '#666666'} />
            </Button>
          )}
        </XStack>

        {/* Navigation Items */}
        <YStack paddingHorizontal="$3" gap="$1" marginTop="$2">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Button
                key={item.href}
                unstyled
                onPress={() => handleNav(item.href)}
                borderRadius={10}
                borderWidth={0}
                paddingHorizontal="$4"
                paddingVertical="$3"
                cursor="pointer"
                // @ts-ignore web-only
                style={{
                  ...(isActive
                    ? {
                        background: activeGradient,
                        boxShadow: '0 4px 15px rgba(91, 207, 250, 0.4)',
                        transform: 'scale(1)',
                        animation: 'navPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }
                    : {
                        background: 'transparent',
                        transform: 'scale(1)',
                      }),
                  transition: 'background 0.25s ease, box-shadow 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                hoverStyle={!isActive ? {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                } : undefined}
              >
                <XStack alignItems="center" gap="$3">
                  <Icon
                    size={20}
                    color={isActive ? '#ffffff' : (isDark ? '#a1a1a1' : '#666666')}
                  />
                  <Text
                    fontSize={15}
                    fontWeight={isActive ? '600' : '400'}
                    color={isActive ? '#ffffff' : (isDark ? '#a1a1a1' : '#666666')}
                  >
                    {item.label}
                  </Text>
                </XStack>
              </Button>
            )
          })}
        </YStack>
      </YStack>

      {/* Bottom: Theme Toggle */}
      <YStack paddingHorizontal="$3" paddingBottom="$4">
        <Button
          unstyled
          borderRadius={10}
          borderWidth={0}
          paddingHorizontal="$4"
          paddingVertical="$3"
          cursor="pointer"
          backgroundColor="transparent"
          hoverStyle={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          }}
          onPress={toggleColorScheme}
        >
          <XStack alignItems="center" gap="$3">
            {isDark ? (
              <Sun size={20} color="#a1a1a1" />
            ) : (
              <Moon size={20} color="#666666" />
            )}
            <Text fontSize={15} color={isDark ? '#a1a1a1' : '#666666'}>
              {isDark ? '浅色模式' : '深色模式'}
            </Text>
          </XStack>
        </Button>
      </YStack>
    </YStack>
  )

  // Desktop: inline sidebar
  if (!isMobile) {
    return (
      <YStack
        // @ts-ignore web-only
        position="sticky"
        top={0}
        height="100vh"
      >
        {sidebarContent}
      </YStack>
    )
  }

  // Mobile: animated drawer overlay
  // Use native div elements for proper CSS transition support
  // (RN Pressable/YStack strip unknown CSS properties like transition)
  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {/* Backdrop - fade in/out */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: animating ? 1 : 0,
          transition: 'opacity 0.3s ease',
          cursor: 'pointer',
        }}
      />
      {/* Drawer - slide in/out */}
      <div
        style={{
          position: 'relative',
          zIndex: 101,
          transform: animating ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: animating ? '4px 0 24px rgba(0,0,0,0.18)' : 'none',
        }}
      >
        {sidebarContent}
      </div>
    </div>
  )
}
