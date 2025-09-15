import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { returnTo } = useLocalSearchParams();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  // Function to hash password (using SHA-256)

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Please enter both phone number and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Add country code if not present
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+92')) {
        // Remove leading 0 if present
        formattedPhone = formattedPhone.startsWith('0') 
          ? '+92' + formattedPhone.substring(1)
          : '+92' + formattedPhone;
      }

      const requestBody = {
        number: formattedPhone,
        password: password
      };
      
      // Ensure we store the formatted phone number with +92
      const userPhone = formattedPhone;
      
      console.log('Sending login request:', {
        url: 'http://192.168.1.111:8000/api/app-user/login/',
        method: 'POST',
        body: requestBody
      });
      
      const response = await fetch('http://192.168.1.111:8000/api/app-user/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid credentials');
      }

     
      // Use the formatted phone number we already have
      
      // Save only the phone number to auth context
      login(userPhone);
      
      // Redirect to the previous screen or default to Profile
      const redirectTo = returnTo ? decodeURIComponent(returnTo as string) : '/(tabs)/Profile';
      
      // Navigate to the target screen with phone number in params
      router.replace({
        pathname: redirectTo as any,
        params: { phone: userPhone }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
    useEffect(() => {
      // No longer needed as fonts are loaded globally
    }, []);

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
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

          {/* Password Input */}
          <View style={[styles.inputWrap, { marginTop: 16 }]}>
            <TextInput
              style={[styles.input, { flex: 1, paddingRight: 40 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={"#1A1A1A"}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.passwordToggleText}>
                {showPassword ? 'HIDE' : 'SHOW'}
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Continue Button */}
          <TouchableOpacity 
            style={[styles.continueBtn, isLoading && styles.disabledBtn]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.continueText}>
              {isLoading ? 'Logging in...' : 'Continue'}
            </Text>
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
    fontSize: scale(26),
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
    paddingVertical: 5,
    marginBottom: 5,
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
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  passwordToggleText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 10,
    width: '100%',
    textAlign: 'left',
    paddingLeft: 10,
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
    fontSize: moderateScale(16),
    fontFamily: 'MontserratSemi',
  },
  disabledBtn: {
    opacity: 0.7,
  },
  terms: {
    color: '#fff',
    fontSize: moderateScale(14),
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