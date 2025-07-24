import React from 'react';
import { View } from 'react-native';

export default function TabBarBackground() {
  // Cream color from screenshot
  const backgroundColor = '#F8F1E6';
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 8,
        top: 0,
        height: 100,
        backgroundColor,
        borderTopLeftRadius: 38,
        borderTopRightRadius: 38,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
        zIndex: -1,
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
