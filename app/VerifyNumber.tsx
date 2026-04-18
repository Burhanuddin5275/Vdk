import AlertModal from '@/components/Alert';
import { otpVerify } from '@/services/user';
import { Api_url } from '@/url/url';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Keyboard, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale } from 'react-native-size-matters';

const OTP_LENGTH = 4;
const RESEND_TIME = 19; // seconds

const VerifyNumber = () => {
  const { phone } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIME);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const inputRefs = useRef([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { phone: phoneParam, source } = useLocalSearchParams();

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text:string,idx:number) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[idx] = text;
      setOtp(newOtp);
      if (idx < OTP_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus();
      } else {
        Keyboard.dismiss();
      }
    } else if (text === '') {
      const newOtp = [...otp];
      newOtp[idx] = '';
      setOtp(newOtp);
    }
  };

  const handleKeyPress = (e:any, idx:number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[idx] === '' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (isVerifying) return;

    const code = otp.join('');

    if (!/^\d{4}$/.test(code)) {
      Alert.alert('Invalid code', 'Please enter the 4-digit verification code.');
      return;
    }

    if (!phone) {
      Alert.alert('Error', 'Phone number not found');
      return;
    }

    setIsVerifying(true);

    try {
      console.log("phone", phone)
      const data = await otpVerify({
        number: phone as string,
        otp: code,
      });

      console.log('VERIFY SUCCESS:', data);

      // ✅ SUCCESS FLOW
      if (data.message === 'OTP verified. Please complete your profile.') {
        router.replace({
          pathname: '/Signup',
          params: {
            phone: phone,
            temp_token: data.temp_token,
            verified: 'true',

          },
        });
      } else {
        router.replace({
          pathname: '/ForgetPassword',
          params: {
            phone: phone,
            verified: 'true',
          },
        });
      }

    } catch (error:any) {
      console.log('VERIFY ERROR:', error?.response?.data || error.message);

      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);

    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    if (!phone) {
      Alert.alert('Error', 'Phone number not found');
      return;
    }
    const data = await fetch(`${Api_url}/api/app-users/resend_otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ number: phone }),
    });
    console.log("data", data)
    setTimer(RESEND_TIME);


  };

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground source={require('../assets/images/ss1.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* Logo and DKT Pakistan */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>dkt</Text>
            <Text style={styles.pakistanText}>PAKISTAN</Text>
          </View>
          {/* Heading */}
          <Text style={styles.heading}>Verify phone number!</Text>
          {/* Instruction */}
          <Text style={styles.instruction}>
            Please enter the code that we've{Platform.OS === 'web' ? <br /> : ' '}
            sent to {phone ? phone : 'your phone number'}
          </Text>
          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={ref => { inputRefs.current[idx] = ref; }}
                style={styles.otpInput}
                value={digit}
                onChangeText={text => handleChange(text, idx)}
                onKeyPress={e => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                returnKeyType="done"
                textAlign="center"
                autoFocus={idx === 0}
              />
            ))}
          </View>
          {/* Verify Button */}
          <TouchableOpacity style={[styles.button, isVerifying && { opacity: 0.7 }]} disabled={isVerifying} onPress={handleVerify}>
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify & proceed</Text>
            )}
          </TouchableOpacity>
          {/* Resend Timer or Button */}
          {timer > 0 ? (
            <Text style={styles.resendText}>
              Resend code in {timer < 10 ? `00:0${timer}` : `00:${timer}`}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={[styles.resendText, { textDecorationLine: 'underline' }]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
      <AlertModal
        visible={showErrorModal}
        message="Incorrect Code"
        subtitle="The verification code you entered is incorrect. Please try again."
        onClose={() => setShowErrorModal(false)}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 86,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -4,
    marginBottom: -8,
  },
  pakistanText: {
    fontSize: 25,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  otpInput: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#219653',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default VerifyNumber