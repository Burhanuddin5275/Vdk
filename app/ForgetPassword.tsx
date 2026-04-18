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
import { Forgetpassword, ResetPassword } from '@/services/user';

const ForgetPassword = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { phone: phoneParam } = useLocalSearchParams();

  const [phone, setPhone] = useState(phoneParam?.toString().replace(/^\+92/, '') || '');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

 const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (isSubmitting) return;

    const digitsOnly = (phone || '').replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      Alert.alert('Invalid number', 'Please enter a valid 10-digit phone number.');
      return;
    }

    const e164Phone = `+92${digitsOnly}`;

    // =========================
    // STEP 1: SEND OTP
    // =========================
    if (step === 'phone') {
      try {
        setIsSubmitting(true);

        const data = await Forgetpassword({
          number: e164Phone,
        });

        console.log('OTP SENT:', data);

        setStep('otp'); // show OTP + password UI

      } catch (error:any) {
        Alert.alert(
          'Error',
          error?.response?.data?.message || error.message || 'Something went wrong'
        );
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    // =========================
    // STEP 2: RESET PASSWORD
    // =========================
    if (step === 'otp') {
      if (!otp) {
        Alert.alert('OTP Required', 'Please enter OTP');
        return;
      }

      if (!password || password.length < 8) {
        Alert.alert('Password Required', 'Minimum 8 characters required.');
        return;
      }

      try {
        setIsSubmitting(true);

        const data = await ResetPassword({
          number: e164Phone,
          otp: otp,
          new_password: password,
        });

        console.log('PASSWORD RESET:', data);

        setShowSuccessModal(true);

      } catch (error:any) {
        Alert.alert(
          'Error',
          error?.response?.data?.message || error.message
        );
      } finally {
        setIsSubmitting(false);
      }
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

            <Text style={styles.welcome}>Forget Password</Text>

            {/* PHONE INPUT */}
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
                editable={step === 'phone'}
              />
            </View>

            {/* OTP INPUT (NO UI CHANGE, JUST ADDED) */}
            {step === 'otp' && (
              <View>

                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={4}
                    placeholder="Enter OTP"
                    keyboardType="number-pad"
                    placeholderTextColor="#1A1A1A"
                  />
                </View>

                <View style={styles.inputWrap}>
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="New Password"
                    placeholderTextColor="#1A1A1A"
                    secureTextEntry={!showPassword}
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

              </View>
            )}

            {/* BUTTON */}
            <TouchableOpacity
              style={[styles.continueBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSendOtp}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.continueBtnText}>
                  {step === 'otp' ? 'Reset Password' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>

            {/* LOGIN */}
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

      {/* SUCCESS MODAL */}
      <SuccessModal
        visible={showSuccessModal}
        message="Password reset successfully"
        subtitle="You can now login with new password"
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
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 5, width: '100%', elevation: 2, position: 'relative' },
  passwordToggle: { position: 'absolute', right: 16, padding: 8 },
  flagWrap: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  flag: { width: 32, height: 32, borderRadius: 16, marginRight: 4 },
  countryCode: { fontSize: 16, color: colors.black },
  input: { flex: 1, fontSize: 20, color: colors.textPrimary },
  continueBtn: { backgroundColor: '#FBF4E4', borderRadius: 16, width: '100%', alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  continueBtnText: { color: colors.textPrimary, fontSize: moderateScale(16) },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { color: '#E0E0E0', fontSize: 14 },
  loginLink: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  terms: { color: '#fff', fontSize: 14, textAlign: 'center', marginTop: 8 },
  link: { color: '#fff', textDecorationLine: 'underline' },
});

export default ForgetPassword;