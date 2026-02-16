import React, { useCallback, useState } from 'react'
import {
  YStack,
  XStack,
  Text,
  Card,
  H2,
  H4,
  Paragraph,
  Input,
  Button,
} from 'tamagui'
import { ScrollView, Platform, Pressable, Modal, View } from 'react-native'
import { Users, UserPlus, Shield, User, Pencil, X, Plus } from 'lucide-react-native'
import { radius, gradients, darkGradients, glassCard } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useMobile } from '@/components/shared/Sidebar'
import {
  apiListUsers,
  apiCreateUser,
  apiUpdateUser,
  apiUpdateMe,
  type UserResponse,
} from '@/lib/api'

const CARD_STAGGER = 100
const ROW_STAGGER = 50
const MODAL_ANIM_MS = 250

type UserTab = 'current' | 'list'

export default function UsersScreen() {
  const { isDark } = useAppTheme()
  const { token, user, refreshUser } = useAuth()
  const isMobile = useMobile()

  const [activeTab, setActiveTab] = useState<UserTab>('current')
  const [userList, setUserList] = useState<UserResponse[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [createUsername, setCreateUsername] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRole, setCreateRole] = useState<'admin' | 'user'>('user')
  const [createIsActive, setCreateIsActive] = useState(true)
  const [createError, setCreateError] = useState('')
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createModalRevealed, setCreateModalRevealed] = useState(false)
  const [editModalRevealed, setEditModalRevealed] = useState(false)

  const [editUsername, setEditUsername] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editError, setEditError] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editRowUsername, setEditRowUsername] = useState('')
  const [editRowPassword, setEditRowPassword] = useState('')
  const [editRowRole, setEditRowRole] = useState<'admin' | 'user'>('user')
  const [editRowActive, setEditRowActive] = useState(true)
  const [editRowError, setEditRowError] = useState('')
  const [editRowSubmitting, setEditRowSubmitting] = useState(false)

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const borderColor = isDark ? '#282828' : '#e5e5e5'
  const inputBg = isDark ? '#1a1a1a' : '#f5f5f5'

  const isAdmin = user?.role === 'admin'

  const loadUserList = useCallback(async () => {
    if (!token || !isAdmin) return
    setLoadingList(true)
    try {
      const list = await apiListUsers(token)
      setUserList(list)
    } catch {
      setUserList([])
    } finally {
      setLoadingList(false)
    }
  }, [token, isAdmin])

  React.useEffect(() => {
    if (isAdmin) loadUserList()
  }, [isAdmin, loadUserList])

  React.useEffect(() => {
    if (createModalOpen) {
      setCreateModalRevealed(false)
      const t = setTimeout(() => setCreateModalRevealed(true), 0)
      return () => clearTimeout(t)
    } else {
      setCreateModalRevealed(false)
    }
  }, [createModalOpen])

  React.useEffect(() => {
    if (editingUserId !== null) {
      setEditModalRevealed(false)
      const t = setTimeout(() => setEditModalRevealed(true), 0)
      return () => clearTimeout(t)
    } else {
      setEditModalRevealed(false)
    }
  }, [editingUserId])

  const handleCreateUser = async () => {
    setCreateError('')
    if (!createUsername.trim() || !createPassword) {
      setCreateError('请填写用户名和密码')
      return
    }
    if (!token) return
    setCreateSubmitting(true)
    try {
      await apiCreateUser(token, {
        username: createUsername.trim(),
        password: createPassword,
        role: createRole,
        is_active: createIsActive,
      })
      setCreateUsername('')
      setCreatePassword('')
      setCreateRole('user')
      setCreateIsActive(true)
      setCreateModalOpen(false)
      await loadUserList()
      await refreshUser()
    } catch (e: any) {
      setCreateError(e?.message || '创建失败')
    } finally {
      setCreateSubmitting(false)
    }
  }

  const handleUpdateMe = async () => {
    setEditError('')
    if (!editUsername.trim() && !editPassword) {
      setEditError('请填写新用户名或新密码')
      return
    }
    if (!token) return
    setEditSubmitting(true)
    try {
      await apiUpdateMe(token, {
        username: editUsername.trim() || undefined,
        password: editPassword || undefined,
      })
      setEditUsername('')
      setEditPassword('')
      await refreshUser()
    } catch (e: any) {
      setEditError(e?.message || '更新失败')
    } finally {
      setEditSubmitting(false)
    }
  }

  const startEditUser = (u: UserResponse) => {
    setEditingUserId(u.id)
    setEditRowUsername(u.username)
    setEditRowPassword('')
    setEditRowRole((u.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user')
    setEditRowActive(u.is_active)
    setEditRowError('')
  }

  const cancelEditUser = () => {
    setEditingUserId(null)
    setEditRowUsername('')
    setEditRowPassword('')
    setEditRowActive(true)
    setEditRowError('')
  }

  const handleUpdateUser = async () => {
    if (!token || !editingUserId) return
    setEditRowError('')
    if (!editRowUsername.trim()) {
      setEditRowError('请填写用户名')
      return
    }
    setEditRowSubmitting(true)
    try {
      await apiUpdateUser(token, editingUserId, {
        username: editRowUsername.trim(),
        password: editRowPassword || undefined,
        role: editRowRole,
        is_active: editRowActive,
      })
      cancelEditUser()
      await loadUserList()
      await refreshUser()
    } catch (e: any) {
      setEditRowError(e?.message || '更新失败')
    } finally {
      setEditRowSubmitting(false)
    }
  }

  /** 角色分段选择器：普通用户 | 管理员 */
  /** 是否启用开关（与配置页风格一致） */
  const ActiveToggle = ({
    checked,
    onToggle,
  }: {
    checked: boolean
    onToggle: () => void
  }) => {
    const trackColor = checked
      ? (isDark ? '#5bcffa' : '#f5abb9')
      : (isDark ? '#3a3a3a' : '#d4d4d4')
    return (
      <Pressable onPress={onToggle} style={{ flexShrink: 0 }} role="switch" aria-checked={checked}>
        <View
          style={{
            width: 48,
            height: 26,
            borderRadius: 13,
            backgroundColor: trackColor,
            padding: 3,
            justifyContent: 'center',
            transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
          } as any}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transform: checked ? 'translateX(22px)' : 'translateX(0)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            } as any}
          />
        </View>
      </Pressable>
    )
  }

  const RoleSegment = ({
    value,
    onChange,
  }: {
    value: 'admin' | 'user'
    onChange: (v: 'admin' | 'user') => void
  }) => (
    <XStack
      width="100%"
      height={44}
      borderRadius={radius.lg}
      backgroundColor={inputBg}
      borderWidth={1}
      borderColor={borderColor}
      padding={4}
      gap={0}
    >
      <Pressable
        onPress={() => onChange('user')}
        style={{
          flex: 1,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: value === 'user' ? (isDark ? 'rgba(91,207,250,0.25)' : 'rgba(91,207,250,0.2)') : 'transparent',
          borderWidth: value === 'user' ? 0 : 0,
          transition: 'background-color 0.2s ease',
        } as any}
      >
        <Text
          fontSize={14}
          fontWeight={value === 'user' ? '600' : '500'}
          color={value === 'user' ? (isDark ? '#7dd9fb' : '#5bcffa') : mutedColor}
        >
          普通用户
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('admin')}
        style={{
          flex: 1,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: value === 'admin' ? (isDark ? 'rgba(245,171,185,0.25)' : 'rgba(245,171,185,0.2)') : 'transparent',
          transition: 'background-color 0.2s ease',
        } as any}
      >
        <Text
          fontSize={14}
          fontWeight={value === 'admin' ? '600' : '500'}
          color={value === 'admin' ? (isDark ? '#f7bdc8' : '#e88595') : mutedColor}
        >
          管理员
        </Text>
      </Pressable>
    </XStack>
  )

  const cardStyle = (staggerIndex: number) =>
    ({
      ...glassCard(isDark),
      transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
      cursor: Platform.OS === 'web' ? 'default' : undefined,
      '--stagger-delay': `${staggerIndex * CARD_STAGGER}ms`,
    } as any)

  return (
    <>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: isMobile ? 16 : 32,
        paddingBottom: isMobile ? 32 : 48,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
      }}
      showsVerticalScrollIndicator={false}
    >
      <YStack gap={isMobile ? 20 : 28} width="100%">
        {/* Header */}
        <YStack gap="$2">
          <H2 color={textColor} fontWeight="700" fontSize={isMobile ? 22 : undefined}>
            用户管理
          </H2>
          <Paragraph color={mutedColor} fontSize={isMobile ? 14 : 15}>
            查看当前账号、修改用户名与密码；管理员可创建用户并查看列表。
          </Paragraph>
        </YStack>

        {/* 二级菜单栏 */}
        <XStack
          width="100%"
          borderRadius={radius.xl}
          padding={isMobile ? '$2' : '$3'}
          className="stagger-item"
          style={{ ...glassCard(isDark), gap: 0, flexWrap: 'wrap', '--stagger-delay': '0ms' } as any}
        >
          <Pressable
            onPress={() => setActiveTab('current')}
            style={{
              flex: isMobile ? 1 : undefined,
              minWidth: isMobile ? 0 : undefined,
              minHeight: 44,
              paddingVertical: isMobile ? 12 : 14,
              paddingHorizontal: isMobile ? 12 : 20,
              borderRadius: radius.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: activeTab === 'current' ? (isDark ? 'rgba(91,207,250,0.2)' : 'rgba(91,207,250,0.15)') : 'transparent',
              borderWidth: 1,
              borderColor: activeTab === 'current' ? (isDark ? 'rgba(91,207,250,0.4)' : 'rgba(91,207,250,0.35)') : 'transparent',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
              cursor: 'pointer',
            } as any}
          >
            <User size={18} color={activeTab === 'current' ? (isDark ? '#7dd9fb' : '#5bcffa') : mutedColor} />
            <Text
              color={activeTab === 'current' ? textColor : mutedColor}
              fontWeight={activeTab === 'current' ? '600' : '500'}
              fontSize={isMobile ? 13 : 14}
            >
              当前用户
            </Text>
          </Pressable>
          {isAdmin && (
              <Pressable
                onPress={() => setActiveTab('list')}
                style={{
                  flex: isMobile ? 1 : undefined,
                  minWidth: isMobile ? 0 : undefined,
                  minHeight: 44,
                  paddingVertical: isMobile ? 12 : 14,
                  paddingHorizontal: isMobile ? 12 : 20,
                  borderRadius: radius.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: activeTab === 'list' ? (isDark ? 'rgba(91,207,250,0.2)' : 'rgba(91,207,250,0.15)') : 'transparent',
                  borderWidth: 1,
                  borderColor: activeTab === 'list' ? (isDark ? 'rgba(91,207,250,0.4)' : 'rgba(91,207,250,0.35)') : 'transparent',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                  cursor: 'pointer',
                } as any}
              >
                <Users size={18} color={activeTab === 'list' ? (isDark ? '#7dd9fb' : '#5bcffa') : mutedColor} />
                <Text
                  color={activeTab === 'list' ? textColor : mutedColor}
                  fontWeight={activeTab === 'list' ? '600' : '500'}
                  fontSize={isMobile ? 13 : 14}
                >
                  用户列表
                </Text>
              </Pressable>
          )}
        </XStack>

        {/* 当前用户 */}
        {(activeTab === 'current' || !isAdmin) && (
        <Card
          borderRadius={radius.xl}
          padding={isMobile ? '$4' : '$5'}
          width="100%"
          maxWidth="100%"
          overflow="hidden"
          className="stagger-item"
          style={cardStyle(0)}
          // @ts-ignore web hover
          hoverStyle={
            Platform.OS === 'web'
              ? {
                  style: {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                      : '0 12px 40px rgba(91,207,250,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
                  },
                }
              : undefined
          }
        >
          <YStack gap="$4" width="100%" minWidth={0}>
            <XStack alignItems="center" gap="$3">
              <YStack
                backgroundColor={isDark ? 'rgba(91,207,250,0.15)' : 'rgba(91,207,250,0.1)'}
                borderRadius={radius.lg}
                padding="$2"
              >
                <User size={20} color={isDark ? '#7dd9fb' : '#5bcffa'} />
              </YStack>
              <H4 color={textColor} fontWeight="600">
                当前用户
              </H4>
            </XStack>
            {user && (
              <XStack
                width="100%"
                paddingVertical="$3"
                paddingHorizontal="$2"
                alignItems="center"
                gap="$3"
                flexDirection="row"
              >
                <YStack flex={1} minWidth={0} gap="$1" justifyContent="center">
                  <Text fontSize={14} color={mutedColor}>
                    用户名
                  </Text>
                  <Text fontSize={16} color={textColor} fontWeight="600" numberOfLines={1}>
                    {user.username}
                  </Text>
                </YStack>
                <XStack alignItems="center" gap="$2" flexShrink={0}>
                  {user.role === 'admin' ? (
                    <Shield size={18} color={isDark ? '#7dd9fb' : '#5bcffa'} />
                  ) : null}
                  <Text fontSize={14} color={mutedColor}>
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </Text>
                </XStack>
              </XStack>
            )}
            <YStack gap="$3" width="100%" minWidth={0}>
              <Text fontSize={14} color={textColor} fontWeight="500">
                修改用户名或密码
              </Text>
              <XStack
                width="100%"
                gap={isMobile ? '$3' : '$4'}
                flexWrap="wrap"
                alignItems="flex-end"
                flexDirection={isMobile ? 'column' : 'row'}
              >
                <Input
                  placeholder="新用户名"
                  placeholderTextColor={mutedColor}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  backgroundColor={inputBg}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius={radius.lg}
                  color={textColor}
                  fontSize={14}
                  paddingHorizontal="$3"
                  paddingVertical={isMobile ? 14 : undefined}
                  width={isMobile ? '100%' : 200}
                  minWidth={isMobile ? undefined : 200}
                  minHeight={44}
                  flexShrink={0}
                />
                <Input
                  placeholder="新密码"
                  placeholderTextColor={mutedColor}
                  value={editPassword}
                  onChangeText={setEditPassword}
                  secureTextEntry
                  backgroundColor={inputBg}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius={radius.lg}
                  color={textColor}
                  fontSize={14}
                  paddingHorizontal="$3"
                  paddingVertical={isMobile ? 14 : undefined}
                  width={isMobile ? '100%' : 200}
                  minWidth={isMobile ? undefined : 200}
                  minHeight={44}
                  flexShrink={0}
                />
                <Button
                  unstyled
                  borderWidth={0}
                  borderRadius={999}
                  paddingHorizontal={24}
                  height={44}
                  flexShrink={0}
                  alignSelf={isMobile ? 'stretch' : undefined}
                  alignItems="center"
                  justifyContent="center"
                  cursor={editSubmitting ? 'not-allowed' : 'pointer'}
                  style={{
                    background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
                    boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
                    transition: 'opacity 0.2s ease',
                  }}
                  onPress={handleUpdateMe}
                  disabled={editSubmitting}
                >
                  <Text color="#ffffff" fontWeight="600" fontSize={14}>
                    {editSubmitting ? '保存中…' : '保存'}
                  </Text>
                </Button>
              </XStack>
              {editError ? (
                <Text color="#ef4444" fontSize={14}>
                  {editError}
                </Text>
              ) : null}
            </YStack>
          </YStack>
        </Card>
        )}

        {isAdmin && activeTab === 'list' && (
            <Card
              borderRadius={radius.xl}
              padding={isMobile ? '$4' : '$5'}
              className="stagger-item"
              style={cardStyle(1)}
              // @ts-ignore web hover
              hoverStyle={
                Platform.OS === 'web'
                  ? {
                      style: {
                        transform: 'translateY(-2px)',
                        boxShadow: isDark
                          ? '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                          : '0 12px 40px rgba(91,207,250,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
                      },
                    }
                  : undefined
              }
            >
              <YStack gap="$4" width="100%" minWidth={0}>
                <XStack alignItems="center" justifyContent="space-between" gap="$3">
                  <XStack alignItems="center" gap="$3">
                    <YStack
                      backgroundColor={isDark ? 'rgba(91,207,250,0.15)' : 'rgba(91,207,250,0.1)'}
                      borderRadius={radius.lg}
                      padding="$2"
                    >
                      <Users size={20} color={isDark ? '#7dd9fb' : '#5bcffa'} />
                    </YStack>
                    <H4 color={textColor} fontWeight="600">
                      用户列表
                    </H4>
                  </XStack>
                  <Button
                    unstyled
                    borderWidth={0}
                    onPress={() => {
                      setCreateError('')
                      setCreateModalOpen(true)
                    }}
                    alignItems="center"
                    justifyContent="center"
                    width={40}
                    height={40}
                    borderRadius={999}
                    cursor="pointer"
                    style={{
                      background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
                      boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Plus size={22} color="#ffffff" strokeWidth={2.5} />
                  </Button>
                </XStack>

                {/* 用户列表（可编辑） */}
                {loadingList ? (
                  <Text color={mutedColor} paddingVertical="$2">
                    加载中…
                  </Text>
                ) : userList.length === 0 ? (
                  <Text color={mutedColor} paddingVertical="$2">
                    暂无用户，点击右上角 + 添加
                  </Text>
                ) : (
                  <YStack gap={0}>
                    {userList.map((u, index) => (
                      <XStack
                        key={u.id}
                        paddingVertical={isMobile ? '$3' : '$2'}
                        paddingHorizontal="$3"
                        alignItems="center"
                        gap="$3"
                        borderBottomWidth={index < userList.length - 1 ? 1 : 0}
                        borderBottomColor={borderColor}
                        // @ts-ignore web-only
                        className="stagger-item"
                        style={{ '--stagger-delay': `${index * ROW_STAGGER}ms` } as any}
                      >
                        <YStack flex={1} minWidth={0}>
                          <Text
                            fontSize={isMobile ? 15 : 14}
                            color={textColor}
                            fontWeight="500"
                            numberOfLines={1}
                          >
                            {u.username}
                          </Text>
                          <Text fontSize={12} color={mutedColor}>
                            {u.role === 'admin' ? '管理员' : '普通用户'}
                            {!u.is_active ? ' · 已禁用' : ''}
                          </Text>
                        </YStack>
                        <XStack alignItems="center" gap="$2">
                          {u.role === 'admin' && (
                            <Shield size={16} color={isDark ? '#7dd9fb' : '#5bcffa'} />
                          )}
                          <Pressable
                            onPress={() => startEditUser(u)}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              borderRadius: radius.lg,
                              backgroundColor: isDark ? 'rgba(91,207,250,0.15)' : 'rgba(91,207,250,0.1)',
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              cursor: 'pointer',
                            } as any}
                          >
                            <Pencil size={14} color={isDark ? '#7dd9fb' : '#5bcffa'} />
                            <Text fontSize={13} color={isDark ? '#7dd9fb' : '#5bcffa'} fontWeight="500">
                              编辑
                            </Text>
                          </Pressable>
                        </XStack>
                      </XStack>
                    ))}
                  </YStack>
                )}
              </YStack>
            </Card>
        )}
      </YStack>
    </ScrollView>

    {/* 添加用户 - 二级弹层（与背景虚化同时长进入） */}
    <Modal
      visible={createModalOpen}
      transparent
      animationType="none"
      onRequestClose={() => setCreateModalOpen(false)}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: createModalRevealed ? 1 : 0,
          transition: `opacity ${MODAL_ANIM_MS}ms ease-out, backdrop-filter ${MODAL_ANIM_MS}ms ease-out`,
        } as any}
        onPress={() => setCreateModalOpen(false)}
      >
        <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 400 }}>
          <Card
            borderRadius={radius['2xl']}
            padding="$5"
            width="100%"
            style={glassCard(isDark)}
          >
            <YStack gap="$4">
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap="$3">
                  <YStack
                    backgroundColor={isDark ? 'rgba(245,171,185,0.15)' : 'rgba(245,171,185,0.1)'}
                    borderRadius={radius.lg}
                    padding="$2"
                  >
                    <UserPlus size={20} color={isDark ? '#f7bdc8' : '#f5abb9'} />
                  </YStack>
                  <H4 color={textColor} fontWeight="600">
                    添加用户
                  </H4>
                </XStack>
                <Pressable
                  onPress={() => setCreateModalOpen(false)}
                  style={{ padding: 8, cursor: 'pointer' }}
                  hitSlop={8}
                >
                  <X size={22} color={mutedColor} />
                </Pressable>
              </XStack>
              <YStack gap="$3" width="100%">
                <Input
                  placeholder="用户名"
                  placeholderTextColor={mutedColor}
                  value={createUsername}
                  onChangeText={setCreateUsername}
                  backgroundColor={inputBg}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius={radius.lg}
                  color={textColor}
                  fontSize={14}
                  paddingHorizontal="$3"
                  paddingVertical={14}
                  width="100%"
                  minHeight={44}
                />
                <Input
                  placeholder="密码"
                  placeholderTextColor={mutedColor}
                  value={createPassword}
                  onChangeText={setCreatePassword}
                  secureTextEntry
                  backgroundColor={inputBg}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius={radius.lg}
                  color={textColor}
                  fontSize={14}
                  paddingHorizontal="$3"
                  paddingVertical={14}
                  width="100%"
                  minHeight={44}
                />
                <YStack gap="$2">
                  <Text fontSize={13} color={mutedColor}>
                    角色
                  </Text>
                  <RoleSegment value={createRole} onChange={setCreateRole} />
                </YStack>
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize={13} color={mutedColor}>
                    是否启用
                  </Text>
                  <ActiveToggle checked={createIsActive} onToggle={() => setCreateIsActive((v) => !v)} />
                </XStack>
                {createError ? (
                  <Text color="#ef4444" fontSize={14}>
                    {createError}
                  </Text>
                ) : null}
                <XStack gap="$3" paddingTop="$2">
                  <Button
                    unstyled
                    borderWidth={0}
                    flex={1}
                    height={44}
                    borderRadius={999}
                    alignItems="center"
                    justifyContent="center"
                    cursor={createSubmitting ? 'not-allowed' : 'pointer'}
                    style={{
                      background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
                      boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
                      transition: 'opacity 0.2s ease',
                    }}
                    onPress={handleCreateUser}
                    disabled={createSubmitting}
                  >
                    <Text color="#ffffff" fontWeight="600" fontSize={14}>
                      {createSubmitting ? '创建中…' : '创建'}
                    </Text>
                  </Button>
                  <Button
                    unstyled
                    flex={1}
                    height={44}
                    borderRadius={999}
                    borderWidth={1}
                    borderColor={borderColor}
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onPress={() => setCreateModalOpen(false)}
                  >
                    <Text color={mutedColor} fontWeight="500" fontSize={14}>
                      取消
                    </Text>
                  </Button>
                </XStack>
              </YStack>
            </YStack>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>

    {/* 编辑用户 - 二级弹层（与背景虚化同时长进入） */}
    <Modal
      visible={editingUserId !== null}
      transparent
      animationType="none"
      onRequestClose={cancelEditUser}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: editModalRevealed ? 1 : 0,
          transition: `opacity ${MODAL_ANIM_MS}ms ease-out, backdrop-filter ${MODAL_ANIM_MS}ms ease-out`,
        } as any}
        onPress={cancelEditUser}
      >
        <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 400 }}>
          <Card
            borderRadius={radius['2xl']}
            padding="$5"
            width="100%"
            style={glassCard(isDark)}
          >
            <YStack gap="$4">
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap="$3">
                  <YStack
                    backgroundColor={isDark ? 'rgba(91,207,250,0.15)' : 'rgba(91,207,250,0.1)'}
                    borderRadius={radius.lg}
                    padding="$2"
                  >
                    <Pencil size={20} color={isDark ? '#7dd9fb' : '#5bcffa'} />
                  </YStack>
                  <H4 color={textColor} fontWeight="600">
                    编辑用户
                  </H4>
                </XStack>
                <Pressable
                  onPress={cancelEditUser}
                  style={{ padding: 8, cursor: 'pointer' }}
                  hitSlop={8}
                >
                  <X size={22} color={mutedColor} />
                </Pressable>
              </XStack>
              <YStack gap="$3" width="100%">
                <Input
                  placeholder="用户名"
                  placeholderTextColor={mutedColor}
                  value={editRowUsername}
                  onChangeText={setEditRowUsername}
                  backgroundColor={inputBg}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius={radius.lg}
                  color={textColor}
                  fontSize={14}
                  paddingHorizontal="$3"
                  paddingVertical={14}
                  width="100%"
                  minHeight={44}
                />
                <Input
                  placeholder="新密码（不填则不修改）"
                  placeholderTextColor={mutedColor}
                  value={editRowPassword}
                  onChangeText={setEditRowPassword}
                  secureTextEntry
                  backgroundColor={inputBg}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius={radius.lg}
                  color={textColor}
                  fontSize={14}
                  paddingHorizontal="$3"
                  paddingVertical={14}
                  width="100%"
                  minHeight={44}
                />
                <YStack gap="$2">
                  <Text fontSize={13} color={mutedColor}>
                    角色
                  </Text>
                  <RoleSegment value={editRowRole} onChange={setEditRowRole} />
                </YStack>
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize={13} color={mutedColor}>
                    是否启用
                  </Text>
                  <ActiveToggle checked={editRowActive} onToggle={() => setEditRowActive((v) => !v)} />
                </XStack>
                {editRowError ? (
                  <Text color="#ef4444" fontSize={14}>
                    {editRowError}
                  </Text>
                ) : null}
                <XStack gap="$3" paddingTop="$2">
                  <Button
                    unstyled
                    borderWidth={0}
                    flex={1}
                    height={44}
                    borderRadius={999}
                    alignItems="center"
                    justifyContent="center"
                    cursor={editRowSubmitting ? 'not-allowed' : 'pointer'}
                    style={{
                      background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
                      boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
                      transition: 'opacity 0.2s ease',
                    }}
                    onPress={handleUpdateUser}
                    disabled={editRowSubmitting}
                  >
                    <Text color="#ffffff" fontWeight="600" fontSize={14}>
                      {editRowSubmitting ? '保存中…' : '保存'}
                    </Text>
                  </Button>
                  <Button
                    unstyled
                    flex={1}
                    height={44}
                    borderRadius={999}
                    borderWidth={1}
                    borderColor={borderColor}
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onPress={cancelEditUser}
                  >
                    <Text color={mutedColor} fontWeight="500" fontSize={14}>
                      取消
                    </Text>
                  </Button>
                </XStack>
              </YStack>
            </YStack>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
    </>
  )
}
