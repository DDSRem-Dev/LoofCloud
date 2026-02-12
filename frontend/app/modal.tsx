import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { YStack, XStack, Text, Card, H2, Separator, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import EditScreenInfo from '@/components/EditScreenInfo';
import { colors, radius, shadows } from '@/constants/DesignTokens';

export default function ModalScreen() {
  const router = useRouter();

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
          elevation={3}
          shadowColor="$shadowColor"
        >
          <YStack gap="$3" alignItems="center">
            <H2 color="$color" fontWeight="600">
              信息
            </H2>
            <Separator
              marginVertical="$4"
              borderColor="$borderColor"
              width="80%"
            />
            <EditScreenInfo path="app/modal.tsx" />

            <Button
              marginTop="$4"
              backgroundColor={colors.primary}
              color="#ffffff"
              borderRadius={radius.md}
              fontWeight="600"
              width="100%"
              pressStyle={{
                backgroundColor: colors.primaryHover,
                scale: 0.98,
              }}
              onPress={() => router.back()}
            >
              关闭
            </Button>
          </YStack>
        </Card>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </YStack>
    </SafeAreaView>
  );
}
