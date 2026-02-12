import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

/**
 * Tamagui 设计系统配置
 * 
 * 配色方案：
 * - Primary: #5bcffa (天蓝色)
 * - Secondary: #f5abb9 (樱花粉)
 * - Background: #ffffff (纯白)
 * - Card Background: #f8f9fa (极浅灰)
 * 
 * 圆角：大圆角设计 (TrueSheet 风格)
 * - md: 16px
 * - lg: 24px
 * 
 * 阴影：极轻微的弥散阴影，在组件中使用 boxShadow 属性
 * 示例：
 * - sm: boxShadow="0px 1px 2px rgba(0, 0, 0, 0.05)"
 * - md: boxShadow="0px 2px 4px rgba(0, 0, 0, 0.08)"
 * - lg: boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
 */
const appConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      // Primary colors - 天蓝色
      primary: '#5bcffa',
      primaryHover: '#4ab8e0',
      primaryPress: '#3aa1c6',
      
      // Secondary colors - 樱花粉
      secondary: '#f5abb9',
      secondaryHover: '#e89ba8',
      secondaryPress: '#db8b97',
      
      // Background colors - 纯白背景
      background: '#ffffff',
      backgroundHover: '#f8f9fa',
      backgroundPress: '#f1f3f5',
      
      // Card background - 极浅灰
      cardBackground: '#f8f9fa',
      
      // Text colors
      color: '#1a1a1a',
      colorHover: '#2a2a2a',
      colorPress: '#0a0a0a',
      
      // Border colors
      borderColor: '#e5e7eb',
      borderColorHover: '#d1d5db',
      borderColorPress: '#9ca3af',
    },
    dark: {
      ...config.themes.dark,
      // Primary colors
      primary: '#5bcffa',
      primaryHover: '#6dd5fb',
      primaryPress: '#4ab8e0',
      
      // Secondary colors
      secondary: '#f5abb9',
      secondaryHover: '#f8b8c4',
      secondaryPress: '#e89ba8',
      
      // Background colors
      background: '#0a0a0a',
      backgroundHover: '#1a1a1a',
      backgroundPress: '#2a2a2a',
      
      // Card background
      cardBackground: '#1a1a1a',
      
      // Text colors
      color: '#ffffff',
      colorHover: '#f5f5f5',
      colorPress: '#e5e5e5',
      
      // Border colors
      borderColor: '#2a2a2a',
      borderColorHover: '#3a3a3a',
      borderColorPress: '#4a4a4a',
    },
  },
  tokens: {
    ...config.tokens,
    // Custom radius tokens - 大圆角设计 (TrueSheet 风格)
    radius: {
      ...config.tokens.radius,
      md: 16,
      lg: 24,
      xl: 32,
    },
  },
  fonts: {
    ...config.fonts,
    // 现代无衬线字体系统
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
