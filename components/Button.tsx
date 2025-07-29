import { colors } from '@/theme/colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  children: string;
  onPress?: () => void;
  style?: object;
  disabled?: boolean;
};

const styles = StyleSheet.create({
  button: {
     backgroundColor: '#fff',
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(10),
    marginTop: verticalScale(10),
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: moderateScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(4),
  },
  primary: {
    backgroundColor: colors.white, // You can replace with your primary color
  },
  secondary: {
    backgroundColor: colors.primary, // You can replace with your primary color
  },
  primaryText: {
    color: colors.textPrimary,
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
  },
  secondaryText: {
    color: colors.white,
    fontSize: moderateScale(17),
    fontFamily: 'Medium',
  },
});

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  onPress,
  style,
  disabled,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};