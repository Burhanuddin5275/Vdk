import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

const Redeem = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground
        source={require('../assets/images/ss1.png')}
        style={styles.background}
        resizeMode="cover"
      >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={moderateScale(28)} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redeem</Text>
        </View>
        {/* Success Icon */}
        <View style={styles.iconWrap}>
          <Image
            source={require('../assets/images/Check.png')}
            style={styles.checkImg}
            resizeMode="contain"
          />
        </View>
        {/* Success Text */}
        <Text style={styles.successText}>{`Redeem Application
Sent Successful!`}</Text>
      </View>
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.redeemBtn}>
          <Text style={styles.redeemBtnText}>View Redeemed Item</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: verticalScale(80),
    position: 'relative',
    paddingHorizontal: scale(18),
    marginTop: verticalScale(20),
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    zIndex: 1,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: moderateScale(28),
    color: '#fff',
    fontFamily: 'Sigmar',
    letterSpacing: 1,
    lineHeight: verticalScale(55),
  },
  iconWrap: {
    paddingTop: verticalScale(100),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  checkImg: {
    width: scale(150),
    height: verticalScale(150),
    alignSelf: 'center',
  },
  successText: {
    color: colors.white,
    fontSize: moderateScale(24),
    fontFamily: 'PoppinsSemi',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.secondaryLight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(100),
  },
  redeemBtn: {
    width: '100%',
    height: verticalScale(50),
    borderRadius: 26,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemBtnText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: 'PoppinsSemi',
  },
});

export default Redeem;