import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { YStack, Text, Card, H2, Separator, Button, Paragraph } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radius } from '@/constants/DesignTokens';

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
              关于 LoofCloud
            </H2>
            <Separator
              marginVertical="$4"
              borderColor="$borderColor"
              width="80%"
            />
            <Paragraph color="$color" textAlign="center">
              LoofCloud 是一个个人云存储管理平台。
            </Paragraph>

            <Button
              unstyled
              borderWidth={0}
              marginTop="$4"
              borderRadius={999}
              height={44}
              width="100%"
              cursor="pointer"
              // @ts-ignore web-only
              style={{
                background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryHover})`,
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              hoverStyle={{ scale: 1.02 }}
              pressStyle={{ scale: 0.97 }}
              onPress={() => router.back()}
            >
              <Text color="#ffffff" fontWeight="600" fontSize={15}>关闭</Text>
            </Button>
          </YStack>
        </Card>

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </YStack>
    </SafeAreaView>
  );
}
