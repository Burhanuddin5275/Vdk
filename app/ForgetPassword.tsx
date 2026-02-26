import SuccessModal from '@/components/SuccessModal';
import { colors } from '@/theme/colors';
import { Api_url } from '@/url/url';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import {fetchUsers} from '@/services/user';
const ForgetPassword = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { phone: phoneParam } = useLocalSearchParams<{ phone?: string }>();
  const [phone, setPhone] = useState(phoneParam?.replace(/^\+92/, '') || '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const isFromVerification = !!phoneParam;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    return;
  }, []);
const handleUpdatePassword = async () => {
  if (isSubmitting || !password) return;

  try {
    setIsSubmitting(true);
    const e164Phone = `+92${phone}`;

    // Fetch users and find the current user
    const users = await fetchUsers();
    const user = users.find(u => u.number === e164Phone);
    
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    // Update the password
    const response = await fetch(`http://192.168.1.108:8000/api/reset-password/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json',

      },
      body: JSON.stringify(
        {
          number: e164Phone,
      new_password:password,
          otp: otp 
          }
        )
    }); 
console.log("Api",response);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to update password');
    }

    Alert.alert('Success', 'Password updated successfully', [
      { text: 'OK', onPress: () => router.replace('/Login') }
    ]); 

  } catch (error) {
    console.error('Update password error:', error);
  } finally {
    setIsSubmitting(false);
  }
};
 const handleSendOtp = async () => {
  if (isSubmitting) return;

  const digitsOnly = (phone || '').replace(/\D/g, '');
  if (digitsOnly.length !== 10) {
    Alert.alert('Error', 'Please enter a valid 10-digit phone number');
    return;
  }
  const e164Phone = `+92${digitsOnly}`;

  try {
    setIsSubmitting(true);
    
  const response = await fetch(`${Api_url}api/forgot-password/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ number: e164Phone })
    }); 
  
      const data = await response.json();
      console.log('OTP sent successfully:', data.otp);
    setOtp(data.otp);
    const users = await fetchUsers();
    
    // Find user by phone number
    const user = users.find(u => u.number === e164Phone);
    
    if (!user) {
      Alert.alert('Error', 'No account found with this phone number');
      return;
    }

    // // If user found, navigate to verification screen with the phone number
    // router.push({
    //   pathname: '/VerifyNumber',
    //   params: { 
    //     phone: e164Phone,
    //     source: 'forgot'  // Indicate this is a password reset flow
    //   }
    // });

  } catch (error) {
    console.error('Error finding user:', error);
    Alert.alert('Error', 'Failed to verify phone number. Please try again.');
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
            {/* Logo */}
            <Image source={require('../assets/images/dkt.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.welcome}>Forget Password</Text>


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
                editable={!phoneParam}
              />
            </View>

            {otp && (
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

 {
    otp ? (
        <TouchableOpacity
        onPress={handleUpdatePassword}
        style={[styles.continueBtn, (isSubmitting || (isFromVerification && !password)) && { opacity: 0.7 }]}
        disabled={isSubmitting || (isFromVerification && !password)}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.continueBtnText}>
           Update Password
          </Text>
        )}
      </TouchableOpacity>
    ) : (
        <TouchableOpacity
        onPress={handleSendOtp}
        disabled={isSubmitting || (isFromVerification && !password)}
        style={[styles.continueBtn, (isSubmitting || (isFromVerification && !password)) && { opacity: 0.7 }]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.continueBtnText}>
           Continue
          </Text>
        )}
      </TouchableOpacity>
    )
 }
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
    color: 'white',
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

export default ForgetPassword;