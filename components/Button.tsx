import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { useFonts } from 'expo-font';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  children: string;
  onPress?: () => void;
  style?: object;
};

const styles = StyleSheet.create({
  button: {
     backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primary: {
    backgroundColor: colors.white, // You can replace with your primary color
  },
  secondary: {
    backgroundColor: colors.primary, // You can replace with your primary color
  },
  primaryText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: 'SemiBold',
  },
  secondaryText: {
    color: colors.white,
    fontSize: 17,
    fontFamily: 'Medium',
  },
});

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  onPress,
  style,
}) => {
    const [loaded]=useFonts({
      SemiBold:require("../assets/fonts/Poppins-SemiBold.ttf"),
      Medium:require("../assets/fonts/Poppins-Medium.ttf"),
    })
  
    useEffect(()=>{
      if(loaded){
        return;
      }
    },[loaded])
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        style,
      ]}
      onPress={onPress}
    >
      <Text style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};