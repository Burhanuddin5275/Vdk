import React, { useEffect, useRef, useState } from 'react';
import { ImageBackground, Keyboard, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale } from 'react-native-size-matters';

const OTP_LENGTH = 4;
const RESEND_TIME = 19; // seconds

const VerifyNumber = () => {
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState<number>(RESEND_TIME);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, idx: number) => {
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

  const handleKeyPress = (e: { nativeEvent: { key: string } }, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[idx] === '' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimer(RESEND_TIME);
      // Trigger resend logic here
    }
  };

  return (
    <SafeAreaView style={{flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4))}}>
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
        <Text style={styles.instruction}>Please enter the code that we've{Platform.OS === 'web' ? <br /> : null} sent to +92 323 933904</Text>
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
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Verify & proceed</Text>
        </TouchableOpacity>
        {/* Resend Timer */}
        <Text style={styles.resendText} onPress={handleResend}>
          Resend code in {timer < 10 ? `00:0${timer}` : `00:${timer}`}
        </Text>
      </View>
    </ImageBackground>
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