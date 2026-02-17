import React, { useState } from 'react'
import { YStack, XStack, Text, Card, H2, Button, Paragraph } from 'tamagui'
import { ScrollView, useWindowDimensions } from 'react-native'
import { Search, Upload, File, Image, FileText, Archive, MoreHorizontal, FolderOpen } from 'lucide-react-native'
import { radius, gradients, darkGradients, glassCard } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'
import { StyledInput } from '@/components/shared/StyledInput'

interface FileItem {
  name: string
  type: 'image' | 'document' | 'archive' | 'other'
  size: string
  modified: string
}

const mockFiles: FileItem[] = [
  { name: 'project-report-2026.pdf', type: 'document', size: '2.4 MB', modified: '2026-02-13' },
  { name: 'design-assets.zip', type: 'archive', size: '156 MB', modified: '2026-02-12' },
  { name: 'hero-banner.png', type: 'image', size: '4.8 MB', modified: '2026-02-12' },
  { name: 'meeting-notes.md', type: 'document', size: '12 KB', modified: '2026-02-11' },
  { name: 'backup-0212.tar.gz', type: 'archive', size: '1.2 GB', modified: '2026-02-10' },
  { name: 'logo-dark.svg', type: 'image', size: '24 KB', modified: '2026-02-09' },
  { name: 'config.yaml', type: 'other', size: '3.1 KB', modified: '2026-02-08' },
  { name: 'database-dump.sql', type: 'other', size: '89 MB', modified: '2026-02-07' },
]

function getFileIcon(type: FileItem['type']) {
  switch (type) {
    case 'image': return Image
    case 'document': return FileText
    case 'archive': return Archive
    default: return File
  }
}

function getFileColor(type: FileItem['type'], isDark: boolean) {
  switch (type) {
    case 'image': return isDark ? '#a78bfa' : '#7c3aed'
    case 'document': return isDark ? '#7dd9fb' : '#5bcffa'
    case 'archive': return isDark ? '#fbbf24' : '#d97706'
    default: return isDark ? '#60a5fa' : '#3b82f6'
  }
}

export default function FilesScreen() {
  const { isDark } = useAppTheme()
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const [searchQuery, setSearchQuery] = useState('')

  const textColor = isDark ? '#f2f2f2' : '#333333'
  const mutedColor = isDark ? '#a1a1a1' : '#666666'
  const borderColor = isDark ? '#282828' : '#e5e5e5'

  const filteredFiles = mockFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isMobile ? 16 : 32 }}>
      <YStack gap={isMobile ? 20 : 24} maxWidth={1200}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3" className="stagger-item" style={{ '--stagger-delay': '0ms' } as any}>
          <YStack gap="$2" flex={1} minWidth={200}>
            <H2 color={textColor} fontWeight="700" fontSize={isMobile ? 22 : undefined}>
              文件管理
            </H2>
            {!isMobile && (
              <Paragraph color={mutedColor} fontSize={15}>
                管理和浏览你的云端文件。
              </Paragraph>
            )}
          </YStack>
          <Button
            unstyled
            borderWidth={0}
            borderRadius={999}
            paddingHorizontal={isMobile ? 20 : 24}
            height={40}
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            // @ts-ignore web-only
            style={{
              background: isDark ? darkGradients.shokaButton : gradients.shokaButton,
              boxShadow: '0 4px 15px rgba(91, 207, 250, 0.35)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
            }}
            hoverStyle={{ scale: 1.03 }}
            pressStyle={{ scale: 0.97 }}
          >
            <XStack alignItems="center" gap="$2">
              <Upload size={16} color="#ffffff" />
              <Text color="#ffffff" fontWeight="600" fontSize={14}>
                上传文件
              </Text>
            </XStack>
          </Button>
        </XStack>

        {/* Search Bar */}
        <Card
          borderRadius={radius.xl}
          padding={isMobile ? '$3' : '$4'}
          // @ts-ignore web-only
          className="stagger-item"
          style={{ ...glassCard(isDark), '--stagger-delay': '80ms' } as any}
        >
          <XStack alignItems="center" gap="$3">
            <Search size={18} color={mutedColor} />
            <StyledInput
              flex={1}
              placeholder="搜索文件..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </XStack>
        </Card>

        {/* File List */}
        <Card
          borderRadius={radius.xl}
          // @ts-ignore web-only
          style={glassCard(isDark)}
        >
          {/* Table Header - desktop only */}
          {!isMobile && (
            <XStack
              paddingHorizontal="$5"
              paddingVertical="$3"
              borderBottomWidth={1}
              borderBottomColor={borderColor}
            >
              <Text flex={1} fontSize={13} color={mutedColor} fontWeight="600">
                文件名
              </Text>
              <Text width={100} fontSize={13} color={mutedColor} fontWeight="600" textAlign="right">
                大小
              </Text>
              <Text width={120} fontSize={13} color={mutedColor} fontWeight="600" textAlign="right">
                修改时间
              </Text>
              <Text width={50} fontSize={13} color={mutedColor} fontWeight="600" textAlign="right">
                操作
              </Text>
            </XStack>
          )}

          {/* File Rows */}
          {filteredFiles.length === 0 ? (
            <YStack padding="$8" alignItems="center" gap="$3">
              <FolderOpen size={40} color={mutedColor} />
              <Text color={mutedColor} fontSize={15}>
                没有找到匹配的文件
              </Text>
            </YStack>
          ) : (
            filteredFiles.map((file, index) => {
              const Icon = getFileIcon(file.type)
              const iconColor = getFileColor(file.type, isDark)

              if (isMobile) {
                // Mobile: compact card-style rows
                return (
                  <XStack
                    key={file.name}
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    alignItems="center"
                    gap="$3"
                    // @ts-ignore web-only
                    className="stagger-item"
                    style={{ '--stagger-delay': `${160 + index * 50}ms` } as any}
                    {...(index < filteredFiles.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: borderColor,
                    })}
                  >
                    <YStack
                      backgroundColor={`${iconColor}18`}
                      borderRadius={radius.md}
                      padding="$1.5"
                    >
                      <Icon size={20} color={iconColor} />
                    </YStack>
                    <YStack flex={1} gap={2}>
                      <Text fontSize={14} color={textColor} fontWeight="500" numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text fontSize={12} color={mutedColor}>
                        {file.size} · {file.modified}
                      </Text>
                    </YStack>
                    <Button
                      unstyled
                      borderWidth={0}
                      borderRadius={radius.md}
                      padding="$2"
                      cursor="pointer"
                      backgroundColor="transparent"
                      hoverStyle={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      }}
                    >
                      <MoreHorizontal size={18} color={mutedColor} />
                    </Button>
                  </XStack>
                )
              }

              // Desktop: table rows
              return (
                <XStack
                  key={file.name}
                  paddingHorizontal="$5"
                  paddingVertical="$3.5"
                  alignItems="center"
                  hoverStyle={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)',
                  }}
                  // @ts-ignore web-only
                  className="stagger-item"
                  {...(index < filteredFiles.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: borderColor,
                  })}
                  // @ts-ignore
                  style={{ cursor: 'default', '--stagger-delay': `${index * 50}ms` } as any}
                >
                  <XStack flex={1} alignItems="center" gap="$3">
                    <YStack
                      backgroundColor={`${iconColor}18`}
                      borderRadius={radius.md}
                      padding="$1.5"
                    >
                      <Icon size={18} color={iconColor} />
                    </YStack>
                    <Text fontSize={14} color={textColor} fontWeight="500">
                      {file.name}
                    </Text>
                  </XStack>
                  <Text width={100} fontSize={13} color={mutedColor} textAlign="right">
                    {file.size}
                  </Text>
                  <Text width={120} fontSize={13} color={mutedColor} textAlign="right">
                    {file.modified}
                  </Text>
                  <YStack width={50} alignItems="flex-end">
                    <Button
                      unstyled
                      borderWidth={0}
                      padding="$1.5"
                      borderRadius={radius.md}
                      cursor="pointer"
                      backgroundColor="transparent"
                      hoverStyle={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      }}
                    >
                      <MoreHorizontal size={16} color={mutedColor} />
                    </Button>
                  </YStack>
                </XStack>
              )
            })
          )}
        </Card>
      </YStack>
    </ScrollView>
  )
}
