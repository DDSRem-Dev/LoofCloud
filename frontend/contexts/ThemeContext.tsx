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
    const update = () => {
      setColorScheme((prev) => {
        const next = prev === 'dark' ? 'light' : 'dark'
        if (typeof window !== 'undefined') {
          localStorage.setItem('loofcloud-theme', next)
        }
        return next
      })
    }

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      ;(document as any).startViewTransition(update)
    } else {
      update()
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ colorScheme, isDark: colorScheme === 'dark', toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAppTheme() {
  return useContext(ThemeContext)
}
