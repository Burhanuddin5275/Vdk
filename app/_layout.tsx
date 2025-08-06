import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { persistor, store } from '@/store/store';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Sigmar: require('../assets/fonts/Sigmar-Regular.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-Medium.ttf'),
    PoppinsSemi: require('../assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    InterRegular: require('../assets/fonts/Inter-Regular.ttf'),
    InterBold: require('../assets/fonts/Inter-Bold.ttf'),
    Sacramento: require('../assets/fonts/Sacramento-Regular.ttf'),
    RussoOne: require('../assets/fonts/RussoOne-Regular.ttf'),
    Montserrat: require('../assets/fonts/Montserrat-SemiBold.ttf'),

  });

  if (!fontsLoaded) {
    return null; // Or a splash/loading component
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="Categories" options={{ headerShown: false }} />
            <Stack.Screen name="Brands" options={{ headerShown: false }} />
            <Stack.Screen name="BestSeller" options={{ headerShown: false }} />
            <Stack.Screen name="Mall" options={{ headerShown: false }} />
            <Stack.Screen name="Redeem" options={{ headerShown: false }} />
            <Stack.Screen name="Redeemed" options={{ headerShown: false }} />
            <Stack.Screen name="Products" options={{ headerShown: false }} />
            <Stack.Screen name="Checkout" options={{ headerShown: false }} />
            <Stack.Screen name="ShippingAddress" options={{ headerShown: false }} />
            <Stack.Screen name="Address" options={{ headerShown: false }} />
            <Stack.Screen name="ChooseShipping" options={{ headerShown: false }} />
            <Stack.Screen name="PaymentMethod" options={{ headerShown: false }} />
            <Stack.Screen name="Payment" options={{ headerShown: false }} />
            <Stack.Screen name="OrderTracker" options={{ headerShown: false }} />
            <Stack.Screen name="OrderReview" options={{ headerShown: false }} />
            <Stack.Screen name="Card" options={{ headerShown: false }} />
            <Stack.Screen name="Wishlist" options={{ headerShown: false }} />
            <Stack.Screen name="Login" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
