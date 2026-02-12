import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useColorScheme as useSystemColorScheme } from 'react-native'

type ColorScheme = 'light' | 'dark'

interface ThemeContextValue {
  colorScheme: ColorScheme
  isDark: boolean
  toggleColorScheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'light',
  isDark: false,
  toggleColorScheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme()
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    // Try to read from localStorage on web
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('loofcloud-theme')
      if (saved === 'light' || saved === 'dark') return saved
    }
    return systemScheme === 'dark' ? 'dark' : 'light'
  })

  const toggleColorScheme = useCallback(() => {
    const next: ColorScheme = colorScheme === 'dark' ? 'light' : 'dark'

    if (typeof document !== 'undefined') {
      // 1. 禁用所有子元素 transition，让主题瞬间切换（遮罩会遮住跳变）
      document.documentElement.classList.add('theme-transitioning')

      // 2. 创建全屏遮罩，用新主题的背景色
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99999;
        pointer-events: none;
        background: ${next === 'dark' ? '#0a0f1e' : '#eaf4ff'};
        clip-path: circle(0% at 50% 50%);
        animation: themeReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      `
      document.body.appendChild(overlay)

      // 3. 下一帧切换实际主题（遮罩已开始扩展，遮住底层）
      requestAnimationFrame(() => {
        setColorScheme(next)
        localStorage.setItem('loofcloud-theme', next)
      })

      // 4. 动画结束后移除遮罩和 class
      overlay.addEventListener('animationend', () => {
        overlay.remove()
        document.documentElement.classList.remove('theme-transitioning')
      })
    } else {
      setColorScheme(next)
    }
  }, [colorScheme])

  return (
    <ThemeContext.Provider value={{ colorScheme, isDark: colorScheme === 'dark', toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAppTheme() {
  return useContext(ThemeContext)
}
