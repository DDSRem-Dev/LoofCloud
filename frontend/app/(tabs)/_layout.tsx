import React, { useState, useEffect, useRef } from 'react'
import { Slot, usePathname } from 'expo-router'
import { XStack, YStack } from 'tamagui'
import { Sidebar, useMobile } from '@/components/shared/Sidebar'
import { MobileHeader } from '@/components/shared/MobileHeader'
import { useAppTheme } from '@/contexts/ThemeContext'
import { gradients, darkGradients } from '@/constants/DesignTokens'

export default function TabLayout() {
  const { isDark } = useAppTheme()
  const isMobile = useMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  // Page transition: fade + slide up on route change
  const [pageEntered, setPageEntered] = useState(true)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setPageEntered(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPageEntered(true)
      })
    })
  }, [pathname])

  // Mesh gradient: multiple radial layers for organic color blending
  const meshBg = isDark
    ? [
        'radial-gradient(ellipse 80% 50% at 75% 5%, rgba(91,207,250,0.14) 0%, transparent 100%)',
        'radial-gradient(ellipse 60% 80% at 10% 90%, rgba(245,171,185,0.10) 0%, transparent 100%)',
        'radial-gradient(ellipse 50% 60% at 80% 65%, rgba(180,140,220,0.07) 0%, transparent 100%)',
        'radial-gradient(ellipse 70% 50% at 35% 40%, rgba(100,160,250,0.06) 0%, transparent 100%)',
        `linear-gradient(135deg, ${darkGradients.bgStart} 0%, ${darkGradients.bgMid} 50%, ${darkGradients.bgEnd} 100%)`,
      ].join(', ')
    : [
        'radial-gradient(ellipse 80% 50% at 75% 5%, rgba(91,207,250,0.28) 0%, transparent 100%)',
        'radial-gradient(ellipse 60% 80% at 10% 90%, rgba(245,171,185,0.22) 0%, transparent 100%)',
        'radial-gradient(ellipse 50% 60% at 80% 65%, rgba(200,170,240,0.15) 0%, transparent 100%)',
        'radial-gradient(ellipse 70% 50% at 35% 40%, rgba(160,200,255,0.18) 0%, transparent 100%)',
        `linear-gradient(135deg, ${gradients.bgStart} 0%, ${gradients.bgMid} 50%, ${gradients.bgEnd} 100%)`,
      ].join(', ')

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
          background: meshBg,
          minHeight: '100vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Aurora 漂浮光斑 — 纯色+blur 比 radial-gradient 更柔和自然 */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : 256,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {/* 天蓝光斑 - 右上角 */}
          <div style={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: isMobile ? 350 : 600,
            height: isMobile ? 350 : 600,
            borderRadius: '50%',
            backgroundColor: isDark ? 'rgba(91,207,250,0.08)' : 'rgba(91,207,250,0.18)',
            filter: `blur(${isMobile ? 80 : 120}px)`,
            WebkitFilter: `blur(${isMobile ? 80 : 120}px)`,
            animation: 'auroraFloat1 20s ease-in-out infinite',
          } as any} />
          {/* 樱花粉光斑 - 左下角 */}
          <div style={{
            position: 'absolute',
            bottom: '-15%',
            left: '-8%',
            width: isMobile ? 300 : 550,
            height: isMobile ? 300 : 550,
            borderRadius: '50%',
            backgroundColor: isDark ? 'rgba(245,171,185,0.06)' : 'rgba(245,171,185,0.16)',
            filter: `blur(${isMobile ? 70 : 100}px)`,
            WebkitFilter: `blur(${isMobile ? 70 : 100}px)`,
            animation: 'auroraFloat2 25s ease-in-out infinite',
          } as any} />
          {/* 蓝紫光斑 - 中部 */}
          <div style={{
            position: 'absolute',
            top: '35%',
            left: '15%',
            width: isMobile ? 250 : 400,
            height: isMobile ? 250 : 400,
            borderRadius: '50%',
            backgroundColor: isDark ? 'rgba(140,120,230,0.05)' : 'rgba(160,140,240,0.12)',
            filter: `blur(${isMobile ? 60 : 90}px)`,
            WebkitFilter: `blur(${isMobile ? 60 : 90}px)`,
            animation: 'auroraFloat3 18s ease-in-out infinite',
          } as any} />

          {/* 脉冲光圈 — 周期性扩散消散 */}
          {[
            { top: '25%', left: '75%', color: '#5bcffa', delay: '0s' },
            { top: '65%', left: '20%', color: '#f5abb9', delay: '4s' },
          ].map((r, i) => (
            <div key={`ring-${i}`} style={{
              position: 'absolute',
              top: r.top,
              left: r.left,
              width: 8,
              height: 8,
              borderRadius: '50%',
              border: `1.5px solid ${r.color}`,
              opacity: isDark ? 0.3 : 0.45,
              animation: `particlePulse 8s ease-in-out ${r.delay} infinite`,
            }} />
          ))}
        </div>

        {isMobile && (
          <MobileHeader onMenuPress={() => setDrawerOpen(true)} />
        )}
        <div
          style={{
            flex: 1,
            position: 'relative',
            zIndex: 1,
            opacity: pageEntered ? 1 : 0,
            transform: pageEntered ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <Slot />
        </div>
      </YStack>
    </XStack>
  )
}
