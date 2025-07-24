import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Text } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: colors.tabRedActive,
        tabBarInactiveTintColor: colors.tabRedInactive,
        headerShown: false,
        tabBarLabelStyle: {
          fontWeight: 'bold',
          fontSize: 15,
        },
        tabBarStyle: {
          backgroundColor: 'transparent',
          position: 'absolute',
          height: 85,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
       
        },
        tabBarBackground: () => <TabBarBackground />, 
      }}>
      <Tabs.Screen
        name="Home"
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={focused ? 32 : 30} name="house.fill" color={color} />, 
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontWeight: '500', fontSize: focused ? 15 : 14, marginTop: 4 }}>Home</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={focused ? 32 : 30} name="cart.fill" color={color} />, 
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontWeight: '500', fontSize: focused ? 15 : 14, marginTop: 4 }}>Cart</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={focused ? 32 : 30} name="book.fill" color={color} />, 
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontWeight: '500', fontSize: focused ? 15 : 14, marginTop: 4 }}>Orders</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Rewards"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={focused ? 32 : 30} name="bag.fill" color={color} />, 
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontWeight: '500', fontSize: focused ? 15 : 14, marginTop: 4 }}>Rewards</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={focused ? 32 : 30} name="person.fill" color={color} />, 
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontWeight: '500', fontSize: focused ? 15 : 14, marginTop: 4 }}>Profile</Text>
          ),
        }}
      />
    </Tabs>
  );
}
