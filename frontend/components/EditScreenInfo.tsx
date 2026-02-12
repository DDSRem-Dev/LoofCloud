import React from 'react';
import { YStack, XStack, Text, Paragraph, Card } from 'tamagui';
import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';
import { colors, radius } from '@/constants/DesignTokens';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <YStack gap="$4" alignItems="center" width="100%">
      <YStack gap="$3" alignItems="center" paddingHorizontal="$4">
        <Paragraph
          color="$color"
          fontSize="$5"
          textAlign="center"
          opacity={0.8}
        >
          打开此屏幕的代码：
        </Paragraph>

        <Card
          backgroundColor="$backgroundHover"
          borderRadius={radius.sm}
          padding="$3"
          marginVertical="$2"
          width="100%"
        >
          <MonoText>{path}</MonoText>
        </Card>

        <Paragraph
          color="$color"
          fontSize="$5"
          textAlign="center"
          opacity={0.8}
        >
          修改任何文本，保存文件，应用将自动更新。
        </Paragraph>
      </YStack>

      <YStack marginTop="$4" alignItems="center" paddingHorizontal="$4">
        <ExternalLink href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet">
          <Text
            color={colors.primary}
            fontSize="$4"
            textAlign="center"
            textDecorationLine="underline"
          >
            如果应用在更改后没有自动更新，请点击这里
          </Text>
        </ExternalLink>
      </YStack>
    </YStack>
  );
}
