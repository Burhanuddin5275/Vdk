import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, verticalScale } from 'react-native-size-matters';

const Signup = () => {
  const { phone: phoneParam } = useLocalSearchParams<{ phone?: string }>();
  const [phone, setPhone] = useState(phoneParam?.replace(/^\+92/, '') || '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isFromVerification = !!phoneParam;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    return;
  }, []);

  const handleSendOtp = async () => {
    if (isSubmitting) return;

    const digitsOnly = (phone || '').replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      Alert.alert('Invalid number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    
    if (isFromVerification && (!password || password.length < 8)) {
      Alert.alert('Password Required', 'Please enter a password with at least 8 characters.');
      return;
    }
    
    const e164Phone = `+92${digitsOnly}`;

    // If we're in verification mode (from verification screen) and password is provided
    if (isFromVerification && password) {
      try {
        setIsSubmitting(true);
        const requestBody = {
          number: e164Phone,
          password: password,
        };
        
        console.log('Sending request to register user:', {
          url: 'http://192.168.1.111:8000/api/app-users/',
          method: 'POST',
          body: requestBody
        });

        const response = await fetch('http://192.168.1.111:8000/api/app-users/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const responseData = await response.json().catch(() => ({}));
        console.log('Registration response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });

        if (!response.ok) {
          const errorMessage = responseData.detail || 
                             responseData.message || 
                             Object.values(responseData).flat().join('\n') ||
                             `HTTP ${response.status} - ${response.statusText}`;
          throw new Error(errorMessage);
        }

        // Navigate to login or home screen after successful registration
        Alert.alert('Success', 'Account created successfully! Please login to continue.', [
          { text: 'OK', onPress: () => router.replace('/Login') }
        ]);

      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to create account. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Original OTP flow
      try {
        setIsSubmitting(true);
        // Directly navigate to VerifyNumber with the phone number
        router.push({
          pathname: '/VerifyNumber',
          params: { phone: e164Phone }
        });
      } catch (error: any) {
        Alert.alert('Network/Error', error?.message || 'Something went wrong. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground source={require('../assets/images/ss1.png')} style={styles.bg} resizeMode="cover">
        <View style={styles.container}>
          {/* Logo */}
          <Image source={require('../assets/images/dkt.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.welcome}>Welcome! Create your account</Text>

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
              editable={!phoneParam} // Disable editing if phone is pre-filled
            />
          </View>

          {isFromVerification && (
            <View style={{ marginTop: 16 }}>
              <View style={[styles.inputWrap, { marginBottom: 4 }]}>
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create Password"
                  placeholderTextColor={"#1A1A1A"}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {password.length > 0 && password.length < 8 && (
                <Text style={styles.errorText}>
                  Password must be at least 8 characters long
                </Text>
              )}
            </View>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueBtn, (isSubmitting || (isFromVerification && !password)) && { opacity: 0.7 }]}
            onPress={handleSendOtp}
            disabled={isSubmitting || (isFromVerification && !password)}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.continueBtnText}>
                {isFromVerification ? 'Create Account' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to{''}
            <Text style={styles.link}> Terms & conditions </Text> and
            <Text style={styles.link}> Privacy policy</Text>.
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
    paddingTop: 70,
    paddingHorizontal: 24,
  },
  logo: {
    width: "100%",
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
    paddingVertical: 5,
    marginBottom: 5,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  passwordToggleText: {
    color: colors.primary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginLeft: 12,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
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
    backgroundColor: 'transparent'
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
  continueBtnText: {
    color: colors.textPrimary,
    fontSize: moderateScale(16),
    fontFamily: 'MontserratSemi',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
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