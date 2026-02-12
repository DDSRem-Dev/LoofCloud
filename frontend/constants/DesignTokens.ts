/**
 * 设计系统 Token 常量
 * 基于 astro-koharu 主题系统，适配后台管理界面
 * 配色方案: 天蓝(#5bcffa) + 白 + 樱花粉(#f5abb9)
 */

// 颜色常量
export const colors = {
  // Primary - 天蓝色
  primary: '#5bcffa',
  primaryHover: '#45c4f0',
  primaryPress: '#32b8e5',
  primaryForeground: '#f0faff',

  // Secondary - 樱花粉
  secondary: '#f5abb9',
  secondaryHover: '#f299aa',
  secondaryPress: '#ee8599',
  secondaryForeground: '#ffffff',

  // Muted - 静音色
  muted: '#f4f4f5',
  mutedForeground: '#595959',

  // Accent - 强调色 (樱花粉)
  accent: '#fdf2f4',
  accentForeground: '#18181b',

  // Destructive - 危险/删除操作
  destructive: '#ef4444',
  destructiveForeground: '#fafafa',

  // Success - 成功状态
  success: '#22c55e',
  successForeground: '#ffffff',

  // Warning - 警告状态
  warning: '#f59e0b',
  warningForeground: '#ffffff',

  // Background - 纯白
  background: '#ffffff',
  backgroundHover: '#fafafa',
  backgroundPress: '#f5f5f5',

  // Card Background - 白色卡片
  cardBackground: '#ffffff',
  cardForeground: '#0a0a0a',

  // Text colors - 深灰色文字
  text: '#333333',
  textHover: '#404040',
  textPress: '#262626',
  foreground: '#333333',

  // Border colors - 浅灰色边框
  border: '#e5e5e5',
  borderHover: '#d4d4d4',
  borderPress: '#a3a3a3',
  input: '#e5e5e5',

  // Ring - 焦点环颜色
  ring: '#5bcffa',
} as const

// 深色模式颜色
export const darkColors = {
  // Primary - 亮天蓝色
  primary: '#7dd9fb',
  primaryHover: '#93e0fc',
  primaryPress: '#5bcffa',
  primaryForeground: '#f0faff',

  // Secondary - 亮樱花粉
  secondary: '#f7bdc8',
  secondaryHover: '#f9ced6',
  secondaryPress: '#f5abb9',
  secondaryForeground: '#ffffff',

  // Muted
  muted: '#262626',
  mutedForeground: '#a1a1a1',

  // Accent
  accent: '#1f1f1f',
  accentForeground: '#fafafa',

  // Destructive
  destructive: '#dc2626',
  destructiveForeground: '#fef2f2',

  // Success
  success: '#16a34a',
  successForeground: '#ffffff',

  // Warning
  warning: '#d97706',
  warningForeground: '#ffffff',

  // Background - 深色背景
  background: '#0d0e0f',
  backgroundHover: '#1a1a1a',
  backgroundPress: '#262626',

  // Card Background - 深色卡片
  cardBackground: '#212121',
  cardForeground: '#f2f2f2',

  // Text colors - 浅色文字
  text: '#f2f2f2',
  textHover: '#ffffff',
  textPress: '#e5e5e5',
  foreground: '#f2f2f2',

  // Border colors - 深色边框
  border: '#282828',
  borderHover: '#3a3a3a',
  borderPress: '#4a4a4a',
  input: '#282828',

  // Ring
  ring: '#5bcffa',
} as const

// 圆角常量 - 匹配 astro-koharu (0.5rem = 8px)
export const radius = {
  none: 0,
  sm: 2, // 0.125rem
  DEFAULT: 8, // 0.5rem (--radius)
  md: 6, // 0.375rem
  lg: 8, // 0.5rem
  xl: 12, // 0.75rem
  '2xl': 16, // 1rem
  '3xl': 24, // 1.5rem
  full: 9999,
} as const

// 阴影常量 - 匹配 astro-koharu 的阴影系统
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  card: '0 0.625rem 1.875rem rgba(90, 97, 105, 0.12)',
  'card-darker': '0 0.625rem 1.875rem rgba(90, 97, 105, 0.2)',
} as const

// 渐变色常量 - 蓝白粉配色
export const gradients = {
  // 页面背景渐变
  bgStart: '#fdfbfb',
  bgEnd: '#ebedee',
  // 侧边栏激活按钮渐变 (天蓝 → 樱花粉)
  shokaButton: 'linear-gradient(to right, #5bcffa, #f5abb9)',
  // Header 渐变
  header: 'linear-gradient(-225deg, #e3fdf5, #e8f4fd)',
} as const

export const darkGradients = {
  bgStart: '#21252b',
  bgEnd: '#000000',
  shokaButton: 'linear-gradient(to right, rgba(91,207,250,0.8), rgba(245,171,185,0.8))',
  header: 'linear-gradient(-225deg, #2d3230, #2d3035)',
} as const

// 镜面玻璃卡片样式 (glassmorphism)
export function glassCard(isDark: boolean) {
  return {
    backgroundColor: isDark ? 'rgba(33,33,33,0.6)' : 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.7)',
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 8px 32px rgba(91,207,250,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
  }
}
