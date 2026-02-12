import { YStack, XStack, Text, Card, H2, Separator, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import EditScreenInfo from '@/components/EditScreenInfo';
import { colors, radius, shadows } from '@/constants/DesignTokens';

export default function TabTwoScreen() {
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
              设置
            </H2>
            <Separator
              marginVertical="$4"
              borderColor="$borderColor"
              width="80%"
            />
            <EditScreenInfo path="app/(tabs)/two.tsx" />
            
            <XStack gap="$3" marginTop="$4" flexWrap="wrap" justifyContent="center">
              <Button
                backgroundColor={colors.primary}
                color="#ffffff"
                borderRadius={radius.md}
                fontWeight="600"
                pressStyle={{
                  backgroundColor: colors.primaryHover,
                  scale: 0.98,
                }}
              >
                主要操作
              </Button>
              <Button
                backgroundColor={colors.secondary}
                color="#ffffff"
                borderRadius={radius.md}
                fontWeight="600"
                pressStyle={{
                  backgroundColor: colors.secondaryHover,
                  scale: 0.98,
                }}
              >
                次要操作
              </Button>
            </XStack>
          </YStack>
        </Card>
      </YStack>
    </SafeAreaView>
  );
}
