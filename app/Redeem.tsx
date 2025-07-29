import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { verticalScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

const Redeem = () => {
  const router = useRouter();
  return (
    <ImageBackground
      source={require('../assets/images/ss1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={colors.white} />
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 56,
    position: 'relative',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 56,
    alignItems: 'center',
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
    color: colors.white,
    fontSize: 25,
    fontFamily: 'Sigmar',
    lineHeight: 56,
  },
  iconWrap: {
    paddingTop:verticalScale(100),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  checkImg: {
    width: 150,
    height: 150,
    alignSelf: 'center',
  },
  successText: {
    color: colors.white,
    fontSize: 24,
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
  },
  redeemBtn: {
    width: '100%',
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