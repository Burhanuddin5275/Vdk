import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Api_url } from '../url/url';
import { Ionicons } from '@expo/vector-icons';
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
  const loginWithBiometric = async (phoneNumber: string, password: string) => {
    try {
      setIsLoading(true);
      setError('');

      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+92')) {
        formattedPhone = formattedPhone.startsWith('0')
          ? '+92' + formattedPhone.substring(1)
          : '+92' + formattedPhone;
      }

      const requestBody = {
        number: formattedPhone,
        password: password
      };

      const response = await fetch(`${Api_url}api/app-user/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log(data)
      const token = data.api_token;

      if (!token) {
        throw new Error('No token received');
      }
      if (data.is_active === false) {
        Alert.alert('Account Disabled', 'Your account has been disabled. Please contact support.');
        return;
      }
      login({ phone: formattedPhone, token, password });
      router.replace('/(tabs)/Home');
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to hash password (using SHA-256)
  const handleBiometricLogin = async () => {
    const biometricEnabled = await SecureStore.getItemAsync('biometric_enabled');

    if (biometricEnabled !== 'true') {
      Alert.alert('Disabled', 'Please enable Fingerprint from profile for login.');
      return;
    }
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Not supported', 'Biometric not available');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('No biometrics', 'Set up fingerprint first');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Fingerprint',
        fallbackLabel: 'Use Password',
      });

      if (!result.success) return;

      const savedPhone = await SecureStore.getItemAsync('userPhone');
      const savedPassword = await SecureStore.getItemAsync('userPassword');

      if (!savedPhone || !savedPassword) {
        Alert.alert('Error', 'No saved login found');
        return;
      }

      const formattedPhone = savedPhone.replace('+92', '');

      await loginWithBiometric(formattedPhone, savedPassword);

    } catch (error) {
      console.log('Biometric error:', error);
    }
  };
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

      console.log('Sending login request:', {
        url: `${Api_url}api/app-user/login/`,
        method: 'POST',
        body: requestBody
      });

      const userPhone = formattedPhone;

      const response = await fetch(`${Api_url}api/app-user/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Full API Response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });

      if (!response.ok) {
        throw new Error('Invalid phone number or password');
      }

      // Check if user is active
      if (data.is_active === false) {
        setError('Your account is not active. Please contact support.');
        return;
      }

      // Get the token from the api_token field
      const token = data.api_token;
      console.log('Extracted token:', token);

      if (!token) {
        console.error('No token found in response. Available keys:', Object.keys(data));
        throw new Error('No authentication token received');
      }

      // Save phone number and token to auth context
      login({ phone: userPhone, token, password });
      router.replace('/(tabs)/Home');

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
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{ paddingBottom: 185 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
                autoCapitalize="none"
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
            <TouchableOpacity
              onPress={handleBiometricLogin}
              style={styles.fingerprintBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="finger-print" size={34} color="#fff" />
            </TouchableOpacity>
            {/* Terms */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/Signup')}>
                <Text style={[styles.link, { fontFamily: 'MontserratSemi' }]}>Sign up</Text>
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={() => router.push('/ForgetPassword')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.terms}>
              By continuing, you agree to{''}
              <Text style={styles.link}>Terms & conditions</Text> and <Text style={styles.link}>Privacy policy</Text>.
            </Text>
          </View>
        </ScrollView>
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
  },
  welcome: {
    color: colors.white,
    fontSize: scale(26),
    fontFamily: 'Sigmar',
    textAlign: 'center',
    marginBottom: 25,
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
    color: colors.white,
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
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Montserrat',
  },
  forgotPasswordContainer: {
    alignSelf: 'center',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'MontserratSemi',
    textDecorationLine: 'underline',
  },
  link: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontFamily: 'InterBold',
  },
  fingerprintBtn: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signupText: {
    color: '#fff',
    fontFamily: 'InterRegular',
    fontSize: moderateScale(14),
  },
});

export default Login;