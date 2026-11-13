import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();
  const backgroundColor =
    colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          overflow: 'hidden',
        },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  const { bottom } = useSafeAreaInsets();
  return bottom;
}