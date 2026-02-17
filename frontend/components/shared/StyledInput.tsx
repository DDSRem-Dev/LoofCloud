import React, { useState, useCallback } from 'react'
import { Input, type InputProps } from 'tamagui'
import { Platform } from 'react-native'
import { radius } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'

interface StyledInputProps extends Omit<InputProps, 'ref'> {
  hasError?: boolean
}

/**
 * 统一美化的输入框组件
 * - 自动适配深色/浅色主题
 * - 聚焦时显示主题色光晕
 * - 悬停时边框颜色渐变
 */
export function StyledInput({ hasError, style, ...props }: StyledInputProps) {
  const { isDark } = useAppTheme()

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
  const hoverBorder = isDark ? 'rgba(91,207,250,0.3)' : 'rgba(91,207,250,0.4)'
  const focusBorder = isDark ? 'rgba(125,217,251,0.5)' : 'rgba(91,207,250,0.6)'
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.55)'
  const errorBorder = '#ef4444'
  const focusShadow = isDark
    ? '0 0 0 3px rgba(91,207,250,0.15), inset 0 1px 2px rgba(0,0,0,0.2)'
    : '0 0 0 3px rgba(91,207,250,0.12), inset 0 1px 2px rgba(0,0,0,0.04)'

  return (
    <Input
      placeholderTextColor={mutedColor as any}
      backgroundColor={inputBg}
      borderWidth={1}
      borderColor={hasError ? errorBorder : borderColor}
      borderRadius={radius.xl}
      color={textColor}
      fontSize={14}
      paddingHorizontal="$4"
      minHeight={44}
      hoverStyle={{
        borderColor: hasError ? errorBorder : hoverBorder,
      }}
      focusStyle={{
        borderColor: hasError ? errorBorder : focusBorder,
      }}
      // @ts-ignore web-only
      {...(Platform.OS === 'web' && {
        style: {
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          ...(typeof style === 'object' ? style : {}),
        } as any,
        focusStyle: {
          borderColor: hasError ? errorBorder : focusBorder,
          outlineWidth: 0,
          // @ts-ignore web boxShadow
          boxShadow: focusShadow,
        },
      })}
      {...props}
    />
  )
}

/**
 * 用于 web 平台的 HTML input hook
 * 返回 props 生成器，自动处理 hover/focus 状态变色
 */
export function useWebInputProps() {
  const { isDark } = useAppTheme()
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
  const hoverBorder = isDark ? 'rgba(91,207,250,0.3)' : 'rgba(91,207,250,0.4)'
  const focusBorder = isDark ? 'rgba(125,217,251,0.5)' : 'rgba(91,207,250,0.6)'
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.55)'
  const focusShadow = isDark
    ? '0 0 0 3px rgba(91,207,250,0.15), inset 0 1px 2px rgba(0,0,0,0.2)'
    : '0 0 0 3px rgba(91,207,250,0.12), inset 0 1px 2px rgba(0,0,0,0.04)'

  const getInputProps = useCallback(
    (id: string, hasError?: boolean) => {
      const isFocused = focusedId === id
      const isHovered = hoveredId === id
      const currentBorder = hasError
        ? '#ef4444'
        : isFocused
          ? focusBorder
          : isHovered
            ? hoverBorder
            : borderColor

      return {
        onFocus: () => setFocusedId(id),
        onBlur: () => setFocusedId(null),
        onMouseEnter: () => setHoveredId(id),
        onMouseLeave: () => setHoveredId(null),
        style: {
          boxSizing: 'border-box' as const,
          width: '100%',
          height: 44,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 0,
          paddingBottom: 0,
          fontSize: 15,
          lineHeight: '20px',
          color: textColor,
          background: inputBg,
          border: `1px solid ${currentBorder}`,
          borderRadius: radius.xl,
          outline: 'none',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          boxShadow: isFocused && !hasError ? focusShadow : (isDark ? 'inset 0 1px 2px rgba(0,0,0,0.15)' : 'inset 0 1px 2px rgba(0,0,0,0.03)'),
        } as React.CSSProperties,
      }
    },
    [focusedId, hoveredId, isDark, borderColor, hoverBorder, focusBorder, focusShadow, textColor, inputBg],
  )

  /** 密码框外层容器的 props（容器负责 border，内层 input 无边框） */
  const getPasswordWrapperProps = useCallback(
    (id: string, hasError?: boolean) => {
      const isFocused = focusedId === id
      const isHovered = hoveredId === id
      const currentBorder = hasError
        ? '#ef4444'
        : isFocused
          ? focusBorder
          : isHovered
            ? hoverBorder
            : borderColor

      return {
        onMouseEnter: () => setHoveredId(id),
        onMouseLeave: () => setHoveredId(null),
        style: {
          border: `1px solid ${currentBorder}`,
          borderRadius: radius.xl,
          background: inputBg,
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          boxShadow: isFocused && !hasError ? focusShadow : (isDark ? 'inset 0 1px 2px rgba(0,0,0,0.15)' : 'inset 0 1px 2px rgba(0,0,0,0.03)'),
        } as React.CSSProperties,
      }
    },
    [focusedId, hoveredId, isDark, borderColor, hoverBorder, focusBorder, focusShadow, inputBg],
  )

  /** 密码框内层 input 的 props（无边框，仅负责 focus tracking） */
  const getPasswordInputProps = useCallback(
    (id: string) => ({
      onFocus: () => setFocusedId(id),
      onBlur: () => setFocusedId(null),
      style: {
        boxSizing: 'border-box' as const,
        flex: 1,
        width: '100%',
        minWidth: 0,
        height: '100%',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 0,
        paddingBottom: 0,
        fontSize: 15,
        lineHeight: '20px',
        color: textColor,
        background: 'transparent',
        border: 'none',
        outline: 'none',
      } as React.CSSProperties,
    }),
    [textColor],
  )

  return { getInputProps, getPasswordWrapperProps, getPasswordInputProps, textColor, mutedColor, borderColor, inputBg }
}
