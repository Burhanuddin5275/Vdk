import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as NavigationBar from 'expo-navigation-bar';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Image, Platform, StatusBar, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { width: screenWidth } = Dimensions.get('window');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setHidden(true);
    }
  }, []);

  // Responsive sizing based on screen width
  const getIconSize = (focused: boolean) => {
    const baseSize = screenWidth < 350 ? 20 : screenWidth < 400 ? 28 : 24;
    return focused ? moderateScale(baseSize + 4) : moderateScale(baseSize);
  };

  const getFontSize = (focused: boolean) => {
    const baseSize = screenWidth < 350 ? 11 : screenWidth < 400 ? 8 : 10;
    return focused ? moderateScale(baseSize + 2) : moderateScale(baseSize);
  };

  const getTabBarHeight = () => {
    return screenWidth < 350 ? verticalScale(75) : screenWidth < 400 ? verticalScale(70) : verticalScale(65);
  };

  const getVerticalSpacing = () => {
    return screenWidth < 350 ? verticalScale(4) : screenWidth < 400 ? verticalScale(4) : verticalScale(5);
  };
  return (
    <Tabs
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: colors.tabRedActive,
        tabBarInactiveTintColor: colors.tabRedInactive,
        headerShown: false,
        tabBarStyle: {
          marginBottom:verticalScale(15),
          backgroundColor: 'transparent',
          paddingTop: verticalScale(8),
          paddingBottom: Math.max(insets.bottom, verticalScale(4)),
          paddingHorizontal: scale(8),
          height: getTabBarHeight() + (Platform.OS === 'android' ? insets.bottom : 0),
          borderTopLeftRadius: moderateScale(32),
          borderTopRightRadius: moderateScale(32),
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: verticalScale(4),
          marginHorizontal: scale(2),
        },
        tabBarBackground: () => <TabBarBackground />,
      }}>
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={getIconSize(focused)}
              name="house.fill"
              color={color}
              style={{
                lineHeight: scale(25),
              }}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              color,
              fontWeight: '500',
              fontSize: getFontSize(focused),
              marginTop: getVerticalSpacing(),
              lineHeight: getFontSize(focused),
              textAlign: 'center'
            }}>Home</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={getIconSize(focused)}
              name="cart.fill"
              color={color}
              style={{
                lineHeight: scale(25),
              }}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              color,
              fontWeight: '500',
              fontSize: getFontSize(focused),
              marginTop: getVerticalSpacing(),
              lineHeight: getFontSize(focused) + 2,
              textAlign: 'center'
            }}>Cart</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/Icon/order.png')}
              style={{
                width: getIconSize(focused),
                height: getIconSize(focused),
                tintColor: color,
                resizeMode: 'contain'
              }}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              color,
              fontWeight: '500',
              fontSize: getFontSize(focused),
              marginTop: getVerticalSpacing(),
              lineHeight: getFontSize(focused) + 2,
              textAlign: 'center'
            }}>Orders</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Rewards"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/Icon/reward.png')}
              style={{
                width: getIconSize(focused),
                height: getIconSize(focused),
                tintColor: color,
                resizeMode: 'contain'
              }}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              color,
              fontWeight: '500',
              fontSize: getFontSize(focused),
              marginTop: getVerticalSpacing(),
              lineHeight: getFontSize(focused) + 2,
              textAlign: 'center'
            }}>Rewards</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={getIconSize(focused)}
              name="person.fill"
              color={color}
              style={{
                lineHeight: scale(25),
              }}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{
              color,
              fontWeight: '500',
              fontSize: getFontSize(focused),
              marginTop: getVerticalSpacing(),
              lineHeight: getFontSize(focused) + 2,
              textAlign: 'center'
            }}>Profile</Text>
          ),
        }}
      />
    </Tabs>
  );
}
