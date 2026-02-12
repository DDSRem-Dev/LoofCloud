import { Text, TextProps } from 'tamagui';

export function MonoText(props: TextProps) {
  return (
    <Text
      {...props}
      fontFamily="$mono"
      style={[{ fontFamily: 'SpaceMono' }, props.style]}
    />
  );
}
