/**
 * 阴影常量定义
 * 极轻微的弥散阴影，用于突出层次感
 * 在 Tamagui 组件中使用 boxShadow 属性
 */
export const shadows = {
  sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0px 2px 4px rgba(0, 0, 0, 0.08)',
  lg: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  xl: '0px 8px 16px rgba(0, 0, 0, 0.12)',
} as const

/**
 * React Native 阴影对象格式（用于原生平台）
 */
export const shadowObjects = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
} as const
