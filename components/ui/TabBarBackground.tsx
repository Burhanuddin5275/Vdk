import React from 'react';
import { View } from 'react-native';
import { verticalScale } from 'react-native-size-matters';

export default function TabBarBackground() {
  // Cream color from screenshot
  const backgroundColor = '#FBF4E4';
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 8,
        top: 0,
        height: verticalScale(85),
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
