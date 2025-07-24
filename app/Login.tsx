import { colors } from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [loaded] = useFonts({
   MontserratSemi: require("../assets/fonts/Montserrat-SemiBold.ttf"),
      PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
      PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
      PoppinsSemi: require("../assets/fonts/Poppins-SemiBold.ttf"),
      Sigmar: require("../assets/fonts/Sigmar-Regular.ttf"),
    })
  const router = useRouter();
  const allowedPhones = ['3239339045', '30012345673', '3123456789']; // Example numbers

  const handleLogin = async () => {
    if (allowedPhones.includes(phone)) {
      await AsyncStorage.setItem('phone', phone);
      router.replace('/(tabs)/Profile');
    } else {
      alert('Invalid phone number');
    }
  };
  
    useEffect(() => {
      if (loaded) {
  return;
      }
    }, [loaded]);

  return (
    <ImageBackground source={require('../assets/images/ss1.png')} style={styles.bg} resizeMode="cover">
        <View style={styles.container}>
          {/* Logo */}
          <Image source={require('../assets/images/dkt.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.welcome}>Welcome! Login to your account!</Text>
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
          <TouchableOpacity style={styles.continueBtn} onPress={handleLogin}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to{''}
            <Text style={styles.link}>Terms & conditions</Text> and <Text style={styles.link}>Privacy policy</Text>.
          </Text>
        </View>
    </ImageBackground>
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

export default Login;