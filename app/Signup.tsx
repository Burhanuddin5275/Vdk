import { colors } from '@/theme/colors';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale } from 'react-native-size-matters';

const Signup = () => {
  const [phone, setPhone] = useState('');
  const insets = useSafeAreaInsets();
  
    useEffect(() => {
  return;
    }, []);

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground source={require('../assets/images/ss1.png')} style={styles.bg} resizeMode="cover">
        <View style={styles.container}>
          {/* Logo */}
          <Image source={require('../assets/images/dkt.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.welcome}>Welcome! sign to your account!</Text>
          {/* Phone Input */}
          <View style={styles.inputWrap}>
            <View style={styles.flagWrap}>
              <Image source={require('../assets/images/flag.png')} style={styles.flag} resizeMode="contain" />
              <Text style={styles.countryCode}>+92</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="number-pad"
              placeholder="Phone Number"
              placeholderTextColor={"#1A1A1A"}
              maxLength={10}
            />
          </View>
          {/* Continue Button */}
          <TouchableOpacity style={styles.continueBtn}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to{''}
            <Text style={styles.link}>Terms & conditions</Text> and <Text style={styles.link}>Privacy policy</Text>.
          </Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  logo: {
    width: "100%",
    height: "30%",
  },
  welcome: {
    color: colors.white,
    fontSize: 26,
    fontFamily: 'Sigmar',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 18,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  flagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  flag: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 16,
    color: colors.black,
    fontFamily: 'MontserratSemi',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: colors.textPrimary,
    fontFamily: 'MontserratSemi',
    letterSpacing: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  continueBtn: {
    backgroundColor: '#FBF4E4',
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 18,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  continueText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: 'MontserratSemi',
  },
  terms: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'InterRegular',
  },
  link: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontFamily: 'InterBold',
  },
});

export default Signup;