/**
 * 设计系统 Token 常量
 * 基于 tamagui.config.ts 中定义的设计系统
 */

// 颜色常量
export const colors = {
  // Primary - 天蓝色
  primary: '#5bcffa',
  primaryHover: '#4ab8e0',
  primaryPress: '#3aa1c6',

  // Secondary - 樱花粉
  secondary: '#f5abb9',
  secondaryHover: '#e89ba8',
  secondaryPress: '#db8b97',

  // Background - 纯白
  background: '#ffffff',
  backgroundHover: '#f8f9fa',
  backgroundPress: '#f1f3f5',

  // Card Background - 极浅灰
  cardBackground: '#f8f9fa',

  // Text colors
  text: '#1a1a1a',
  textHover: '#2a2a2a',
  textPress: '#0a0a0a',

  // Border colors
  border: '#e5e7eb',
  borderHover: '#d1d5db',
  borderPress: '#9ca3af',
} as const

// 圆角常量 - 大圆角设计 (TrueSheet 风格)
export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const

// 阴影常量 - 极轻微的弥散阴影
export const shadows = {
  sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0px 2px 4px rgba(0, 0, 0, 0.08)',
  lg: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  xl: '0px 8px 16px rgba(0, 0, 0, 0.12)',
} as const
