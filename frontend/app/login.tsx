import React, { useState } from 'react'
import { YStack, XStack, Text, Card, H2, Paragraph, Input, Button } from 'tamagui'
import { useRouter } from 'expo-router'
import { Platform, Pressable } from 'react-native'
import { Cloud, Eye, EyeOff } from 'lucide-react-native'
import { radius, gradients, darkGradients, glassCard } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginScreen() {
  const { isDark } = useAppTheme()
  const { token, loading, login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  React.useEffect(() => {
    if (loading) return
    if (token) {
      router.replace('/' as any)
    }
  }, [loading, token, router])

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const borderColor = isDark ? '#282828' : '#e5e5e5'
  const inputBg = isDark ? '#1a1a1a' : '#f5f5f5'

  const meshBg = isDark
    ? [
        'radial-gradient(ellipse 80% 50% at 75% 5%, rgba(91,207,250,0.14) 0%, transparent 100%)',
        'radial-gradient(ellipse 60% 80% at 10% 90%, rgba(245,171,185,0.10) 0%, transparent 100%)',
        `linear-gradient(135deg, #0a0f1e 0%, #100d20 50%, #180c18 100%)`,
      ].join(', ')
    : [
        'radial-gradient(ellipse 80% 50% at 75% 5%, rgba(91,207,250,0.28) 0%, transparent 100%)',
        'radial-gradient(ellipse 60% 80% at 10% 90%, rgba(245,171,185,0.22) 0%, transparent 100%)',
        `linear-gradient(135deg, ${gradients.bgStart} 0%, ${gradients.bgMid} 50%, ${gradients.bgEnd} 100%)`,
      ].join(', ')

  const clearError = () => {
    if (error) setError('')
  }

  const handleSubmit = async () => {
    setError('')
    if (!username.trim()) {
      setError('请输入用户名')
      return
    }
    if (!password) {
      setError('请输入密码')
      return
    }
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      router.replace('/' as any)
    } catch (e: any) {
      setError(e?.message || '登录失败，请检查用户名和密码')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <div
      style={{
        minHeight: '100vh',
        background: meshBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Aurora 光斑 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            backgroundColor: isDark ? 'rgba(91,207,250,0.08)' : 'rgba(91,207,250,0.18)',
            filter: 'blur(100px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '-8%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            backgroundColor: isDark ? 'rgba(245,171,185,0.06)' : 'rgba(245,171,185,0.16)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <Card
        borderRadius={radius['2xl']}
        padding={40}
        maxWidth={400}
        width="100%"
        style={{
          ...glassCard(isDark),
          position: 'relative',
          zIndex: 1,
        }}
      >
        <YStack gap={28} alignItems="center">
          <XStack alignItems="center" gap="$3">
            <Cloud size={36} color={isDark ? '#7dd9fb' : '#5bcffa'} />
            <H2 color={textColor} fontWeight="700">
              LoofCloud
            </H2>
          </XStack>
          <Paragraph color={mutedColor} textAlign="center" fontSize={15}>
            登录以继续使用管理面板
          </Paragraph>

          {Platform.OS === 'web' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              style={{ width: '100%' }}
            >
              <YStack width="100%" gap="$3">
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    clearError()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: 44,
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 0,
                    paddingBottom: 0,
                    fontSize: 15,
                    lineHeight: 20,
                    color: textColor,
                    background: inputBg,
                    border: `1px solid ${error && !username.trim() ? '#ef4444' : borderColor}`,
                    borderRadius: radius.lg,
                    outline: 'none',
                  }}
                />
                <XStack
                  position="relative"
                  alignItems="center"
                  width="100%"
                  height={44}
                  borderWidth={1}
                  borderColor={error && !password ? '#ef4444' : borderColor}
                  borderRadius={radius.lg}
                  backgroundColor={inputBg}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearError()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                    style={{
                      boxSizing: 'border-box',
                      flex: 1,
                      width: '100%',
                      minWidth: 0,
                      height: '100%',
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 0,
                      paddingBottom: 0,
                      fontSize: 15,
                      lineHeight: 20,
                      color: textColor,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                    }}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    style={{
                      padding: 12,
                      marginRight: 4,
                      borderRadius: radius.md,
                      cursor: 'pointer',
                    }}
                    hitSlop={8}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={mutedColor} />
                    ) : (
                      <Eye size={20} color={mutedColor} />
                    )}
                  </Pressable>
                </XStack>
                {error ? (
                  <XStack alignItems="center" gap="$2">
                    <Text color="#ef4444" fontSize={14} flex={1}>
                      {error}
                    </Text>
                  </XStack>
                ) : null}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    border: 0,
                    borderRadius: 999,
                    paddingTop: 14,
                    paddingBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.8 : 1,
                    background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
                    boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  {submitting ? '登录中…' : '登录'}
                </button>
              </YStack>
            </form>
          ) : (
            <YStack width="100%" gap="$3">
              <Input
                placeholder="用户名"
                placeholderTextColor={mutedColor as any}
                value={username}
                onChangeText={(v) => {
                  setUsername(v)
                  clearError()
                }}
                backgroundColor={inputBg}
                borderWidth={1}
                borderColor={error && !username.trim() ? '#ef4444' : borderColor}
                borderRadius={radius.lg}
                color={textColor}
                fontSize={15}
                paddingHorizontal="$4"
                paddingVertical="$3"
                onSubmitEditing={handleSubmit}
              />
              <XStack
                position="relative"
                alignItems="center"
                width="100%"
                borderWidth={1}
                borderColor={error && !password ? '#ef4444' : borderColor}
                borderRadius={radius.lg}
                backgroundColor={inputBg}
              >
                <Input
                  flex={1}
                  placeholder="密码"
                  placeholderTextColor={mutedColor as any}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v)
                    clearError()
                  }}
                  secureTextEntry={!showPassword}
                  backgroundColor="transparent"
                  borderWidth={0}
                  color={textColor}
                  fontSize={15}
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  onSubmitEditing={handleSubmit}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={{
                    padding: 12,
                    marginRight: 4,
                    borderRadius: radius.md,
                    cursor: 'pointer',
                  }}
                  hitSlop={8}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={mutedColor} />
                  ) : (
                    <Eye size={20} color={mutedColor} />
                  )}
                </Pressable>
              </XStack>
              {error ? (
                <XStack alignItems="center" gap="$2">
                  <Text color="#ef4444" fontSize={14} flex={1}>
                    {error}
                  </Text>
                </XStack>
              ) : null}
              <Button
                unstyled
                borderWidth={0}
                borderRadius={999}
                paddingVertical={14}
                alignItems="center"
                justifyContent="center"
                cursor={submitting ? 'not-allowed' : 'pointer'}
                opacity={submitting ? 0.8 : 1}
                style={{
                  background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
                  boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
                }}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text color="#ffffff" fontWeight="600" fontSize={16}>
                  {submitting ? '登录中…' : '登录'}
                </Text>
              </Button>
            </YStack>
          )}
        </YStack>
      </Card>
    </div>
  )
}
