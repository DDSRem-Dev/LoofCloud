import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

/**
 * Tamagui 设计系统配置
 *
 * 配色方案：蓝白粉
 * - Primary: #5bcffa (天蓝色)
 * - Secondary: #f5abb9 (樱花粉)
 * - Background: #ffffff (纯白)
 */
const appConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      // Primary colors - 天蓝色
      primary: '#5bcffa',
      primaryHover: '#45c4f0',
      primaryPress: '#32b8e5',
      primaryForeground: '#f0faff',

      // Secondary colors - 樱花粉
      secondary: '#f5abb9',
      secondaryHover: '#f299aa',
      secondaryPress: '#ee8599',
      secondaryForeground: '#ffffff',

      // Muted colors
      muted: '#f4f4f5',
      mutedForeground: '#595959',

      // Accent colors
      accent: '#fdf2f4',
      accentForeground: '#18181b',

      // Destructive colors
      destructive: '#ef4444',
      destructiveForeground: '#fafafa',

      // Success colors
      success: '#22c55e',
      successForeground: '#ffffff',

      // Warning colors
      warning: '#f59e0b',
      warningForeground: '#ffffff',

      // Background colors
      background: '#ffffff',
      backgroundHover: '#fafafa',
      backgroundPress: '#f5f5f5',

      // Card background
      cardBackground: '#ffffff',
      cardForeground: '#0a0a0a',

      // Text colors
      color: '#333333',
      colorHover: '#404040',
      colorPress: '#262626',
      foreground: '#333333',

      // Border colors
      borderColor: '#e5e5e5',
      borderColorHover: '#d4d4d4',
      borderColorPress: '#a3a3a3',
      input: '#e5e5e5',

      // Ring color
      ring: '#5bcffa',
    },
    dark: {
      ...config.themes.dark,
      // Primary colors - 亮天蓝色
      primary: '#7dd9fb',
      primaryHover: '#93e0fc',
      primaryPress: '#5bcffa',
      primaryForeground: '#f0faff',

      // Secondary colors - 亮樱花粉
      secondary: '#f7bdc8',
      secondaryHover: '#f9ced6',
      secondaryPress: '#f5abb9',
      secondaryForeground: '#ffffff',

      // Muted colors
      muted: '#262626',
      mutedForeground: '#a1a1a1',

      // Accent colors
      accent: '#1f1f1f',
      accentForeground: '#fafafa',

      // Destructive colors
      destructive: '#dc2626',
      destructiveForeground: '#fef2f2',

      // Success colors
      success: '#16a34a',
      successForeground: '#ffffff',

      // Warning colors
      warning: '#d97706',
      warningForeground: '#ffffff',

      // Background colors
      background: '#0d0e0f',
      backgroundHover: '#1a1a1a',
      backgroundPress: '#262626',

      // Card background
      cardBackground: '#212121',
      cardForeground: '#f2f2f2',

      // Text colors
      color: '#f2f2f2',
      colorHover: '#ffffff',
      colorPress: '#e5e5e5',
      foreground: '#f2f2f2',

      // Border colors
      borderColor: '#282828',
      borderColorHover: '#3a3a3a',
      borderColorPress: '#4a4a4a',
      input: '#282828',

      // Ring color
      ring: '#5bcffa',
    },
  },
  tokens: {
    ...config.tokens,
    radius: {
      ...config.tokens.radius,
      sm: 2,
      DEFAULT: 8,
      md: 6,
      lg: 8,
      xl: 12,
      '2xl': 16,
      '3xl': 24,
    },
  },
  fonts: {
    ...config.fonts,
    body: {
      ...config.fonts.body,
      family: 'System',
    },
    heading: {
      ...config.fonts.heading,
      family: 'System',
    },
  },
})

export default appConfig

export type Conf = typeof appConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf { }
}
