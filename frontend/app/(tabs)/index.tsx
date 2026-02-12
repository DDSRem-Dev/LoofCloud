import { YStack, XStack, Text, Card, H2, H4, Paragraph, Separator } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import EditScreenInfo from '@/components/EditScreenInfo';
import { colors, radius, shadows } from '@/constants/DesignTokens';

export default function TabOneScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        flex={1}
        backgroundColor="$background"
        padding="$4"
        alignItems="center"
        justifyContent="center"
        gap="$4"
      >
        <Card
          backgroundColor="$cardBackground"
          borderRadius={radius.lg}
          padding="$4"
          width="100%"
          maxWidth={600}
          elevation={2}
          shadowColor="$shadowColor"
        >
          <YStack gap="$3" alignItems="center">
            <H2 color="$color" fontWeight="600">
              欢迎使用 LoofCloud
            </H2>
            <Separator
              marginVertical="$4"
              borderColor="$borderColor"
              width="80%"
            />
            <EditScreenInfo path="app/(tabs)/index.tsx" />
          </YStack>
        </Card>
      </YStack>
    </SafeAreaView>
  );
}
