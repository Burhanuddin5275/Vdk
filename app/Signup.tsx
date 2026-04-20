import SuccessModal from '@/components/SuccessModal';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { numberVerify, registerUser } from '@/services/user';
import * as SecureStore from 'expo-secure-store';
const Signup = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { phone: phoneParam, temp_token } = useLocalSearchParams<{
    phone: string;
    temp_token: string;
  }>();
  const [phone, setPhone] = useState(phoneParam?.replace(/^\+92/, '') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isFromVerification = !!phoneParam;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isValidEmail = (email: any) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const handleSendOtp = async () => {
    if (isSubmitting) return;

    const digitsOnly = (phone || '').replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      Alert.alert('Invalid number', 'Please enter a valid 10-digit phone number.');
      return;
    }

    const e164Phone = `+92${digitsOnly}`;

    // ✅ STEP 1: NOT VERIFIED → OTP FLOW ONLY
    if (!isFromVerification) {
      try {
        setIsSubmitting(true);

        const data = await numberVerify({
          number: e164Phone,
        });

        console.log('number registered:', data);
        if (data.message === 'OTP sent') {
          router.push({
            pathname: '/VerifyNumber',
            params: { phone: e164Phone, source: 'signup' }
          });
        } else {
          Alert.alert('Number already exists');
        }

      } catch (error: any) {
        console.log('FULL ERROR:', error);
        console.log('ERROR RESPONSE:', error?.response);
        console.log('ERROR DATA:', error?.response?.data);

        Alert.alert(
          'Error',
          error?.response?.data?.message || error.message || 'Something went wrong'
        );
      } finally {
        setIsSubmitting(false);
      }

      return; // 🚨 VERY IMPORTANT (stops further execution)
    }

    // ✅ STEP 2: VERIFIED → VALIDATE FULL FORM
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }

    if (!email) {
      Alert.alert('Email Required', 'Please enter your email.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 8) {
      Alert.alert('Password Required', 'Minimum 8 characters required.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (!isAgreed) {
      Alert.alert('Agreement Required', 'Please accept terms and conditions.');
      return;
    }
    // ✅ STEP 3: FINAL REGISTER
    try {
      setIsSubmitting(true);
      console.log('phoneParam:', phoneParam);
      console.log('temp_token:', temp_token);
      const data = await registerUser({
        number: phoneParam,
        temp_token: temp_token,
        name,
        email,
        password,
      });

      console.log('User registered:', data);
      await SecureStore.setItemAsync('userPhone',  phoneParam);
      await SecureStore.setItemAsync('userPassword', password);
      setShowSuccessModal(true);

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/Login');
  };

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
            <Image source={require('../assets/images/dkt.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.welcome}>Welcome! Create your account</Text>

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
                placeholderTextColor="#1A1A1A"
                maxLength={10}
                editable={!phoneParam}
              />
            </View>

            {isFromVerification && (
              <View style={{ marginTop: 16 }}>
                <View style={[styles.inputWrap, { marginBottom: 15 }]}>
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter profile name"
                    placeholderTextColor="#1A1A1A"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <View style={[styles.inputWrap, { marginBottom: 15 }]}>
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    placeholder="Enter Email"
                    placeholderTextColor="#1A1A1A"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <View style={[styles.inputWrap, { marginBottom: 15 }]}>
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create Password"
                    placeholderTextColor="#1A1A1A"
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
                <View style={[styles.inputWrap, { marginBottom: 4 }]}>
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Enter Confirm Password"
                    placeholderTextColor="#1A1A1A"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
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
                {email.length > 0 && !isValidEmail(email) && (
                  <Text style={styles.errorText}>
                    Please enter a valid email address
                  </Text>
                )}
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setIsAgreed(!isAgreed)}
                  >
                    {isAgreed && <View style={styles.checkboxInner} />}
                  </TouchableOpacity>

                  <Text style={styles.checkboxText}>
                    I agree to{' '}
                    <Text style={styles.link}>Terms & Conditions</Text> and{' '}
                    <Text style={styles.link}>Privacy Policy</Text>
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={[styles.continueBtn, (isSubmitting || (isFromVerification && !password && !email)) && { opacity: 0.7 }]}
              onPress={handleSendOtp}
              disabled={
                isSubmitting ||
                (isFromVerification &&
                  (!password || !email || !isAgreed))
              }
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

            <Text style={styles.terms}>
              By continuing, you agree to{' '}
              <Text style={styles.link}> Terms & conditions </Text> and
              <Text style={styles.link}> Privacy policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>

      <SuccessModal
        visible={showSuccessModal}
        message="Account created successfully"
        subtitle="You can now use this account for login"
        autoCloseDelay={2000}
        onClose={handleSuccessModalClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.primaryDark },
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 70, paddingHorizontal: 24 },
  logo: { width: '100%' },
  welcome: { color: colors.white, fontSize: 26, fontFamily: 'Sigmar', textAlign: 'center', marginBottom: 32 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 5, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, position: 'relative' },
  passwordToggle: { position: 'absolute', right: 16, padding: 8 },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 14,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
  },

  checkboxText: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  errorText: { color: 'white', fontSize: 12, marginLeft: 12, marginTop: 4, fontFamily: 'Inter-Regular' },
  flagWrap: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  flag: { width: 32, height: 32, borderRadius: 16, marginRight: 4 },
  countryCode: { fontSize: 16, color: colors.black, fontFamily: 'MontserratSemi', marginRight: 4 },
  input: { flex: 1, fontSize: 20, color: colors.textPrimary, fontFamily: 'MontserratSemi', letterSpacing: 1, borderWidth: 0, backgroundColor: 'transparent' },
  continueBtn: { backgroundColor: '#FBF4E4', borderRadius: 16, width: '100%', alignItems: 'center', paddingVertical: 16, marginBottom: 18, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  continueBtnText: { color: colors.textPrimary, fontSize: moderateScale(16), fontFamily: 'MontserratSemi' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { color: '#E0E0E0', fontSize: 14 },
  loginLink: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  terms: { color: '#fff', fontSize: 14, textAlign: 'center', marginTop: 8, fontFamily: 'InterRegular' },
  link: { color: '#fff', textDecorationLine: 'underline', fontFamily: 'InterBold' },
});

export default Signup;
