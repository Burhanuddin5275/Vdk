import { colors } from '@/theme/colors';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale } from 'react-native-size-matters';

const Signup = () => {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
    useEffect(() => {
  return;
    }, []);

  const handleSendOtp = async () => {
    if (isSubmitting) return;

    // Normalize to E.164 for Pakistan (+92XXXXXXXXXX)
    const digitsOnly = (phone || '').replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      Alert.alert('Invalid number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    // Force E.164: +92XXXXXXXXXX
    const e164Phone = `+92${digitsOnly}`;

    try {
      setIsSubmitting(true);
      const endpoint = 'http://192.168.1.111:8000/api/send-otp/';

      const last10 = digitsOnly.slice(-10);
      const phoneCandidates = [
        `+92${last10}`,
        `0${last10}`,
        `92${last10}`,
        last10,
      ];
      const keyCandidates: Array<'phone' | 'phone_number' | 'mobile' | 'mobile_number' | 'msisdn'> = [
        'phone',
        'phone_number',
        'mobile',
        'mobile_number',
        'msisdn',
      ];

      const attemptJson = async (payloadKey: string, value: string) => {
        return fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ [payloadKey]: value }),
        });
      };

      const attemptFormUrl = async (payloadKey: string, value: string) => {
        const form = new URLSearchParams();
        form.append(payloadKey, value);
        return fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json, text/plain, */*',
          },
          body: form.toString(),
        });
      };

      let response: Response | null = null;
      let usedValue: string | undefined;
      let errorMessage: string | undefined;

      for (const key of keyCandidates) {
        if (response) break;
        for (const value of phoneCandidates) {
          // Try JSON
          try {
            const resJson = await attemptJson(key, value);
            if (resJson.ok) {
              response = resJson;
              usedValue = value;
              break;
            } else {
              const text = await resJson.text();
              if (text) {
                try {
                  const parsed = JSON.parse(text);
                  errorMessage = parsed?.message || parsed?.detail || JSON.stringify(parsed);
                } catch {
                  errorMessage = text;
                }
              } else {
                errorMessage = `Request failed (${resJson.status}).`;
              }
            }
          } catch (e: any) {
            errorMessage = e?.message || 'Network error';
          }

          if (response) break;

          // Try x-www-form-urlencoded
          try {
            const resForm = await attemptFormUrl(key, value);
            if (resForm.ok) {
              response = resForm;
              usedValue = value;
              break;
            } else {
              const text = await resForm.text();
              if (text) {
                try {
                  const parsed = JSON.parse(text);
                  errorMessage = parsed?.message || parsed?.detail || JSON.stringify(parsed);
                } catch {
                  errorMessage = text;
                }
              } else {
                errorMessage = `Request failed (${resForm.status}).`;
              }
            }
          } catch (e: any) {
            errorMessage = e?.message || 'Network error';
          }
        }
      }

      if (!response) {
        Alert.alert('Error sending OTP', errorMessage || 'Phone number required');
        return;
      }

      // Navigate to VerifyNumber page with the phone number as a parameter
      router.push({
        pathname: '/VerifyNumber',
        params: { phone: usedValue || e164Phone }
      });
    } catch (error: any) {
      Alert.alert('Network/Error', error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <TouchableOpacity style={[styles.continueBtn, isSubmitting && { opacity: 0.7 }]} onPress={handleSendOtp} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.continueText}>Continue</Text>
            )}
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