import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/(tabs)/Home');
  };

  const allMenuItems = [
    { label: 'My orders', icon: 'cart', onPress: () => {router.push('/Orders')} },
    { label: 'Chat', icon: 'chatbubble-ellipses', onPress: () => {} },
    { label: 'Wishlist', icon: 'heart', onPress: () => {router.push('/Wishlist')} },
    { label: 'Manage addresses', icon: 'location', onPress: () => {} },
    { label: 'Manage profile', icon: 'person-circle', onPress: () => {} },
    { label: 'Contact us', icon: 'paper-plane', onPress: () => {} },
    { label: 'About us', icon: 'information-circle', onPress: () => {} },
    { label: 'Terms & conditions', icon: 'document-text', onPress: () => {} },
    { label: 'Redeemed', icon: 'gift', onPress: () => {} },
    { label: 'Privacy policy', icon: 'shield-checkmark', onPress: () => {} },
    { label: 'Logout', icon: 'log-out', onPress: handleLogout },
  ];

  const menuItems = isAuthenticated
    ? allMenuItems
    : allMenuItems.filter(item => [
        'Contact us',
        'Chat',
        'About us',
        'Terms & conditions',
        'Redeemed',
        'Privacy policy',
      ].includes(item.label));
  // Removed hardware back button logout logic
  return (
    <ImageBackground
      source={require('../../assets/images/ss1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: verticalScale(75) }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={moderateScale(24)} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          {/* Profile Image & Name */}
          {isAuthenticated && (
            <View style={styles.profileSection}>
              <Image source={require('../../assets/images/Ellipse.png')} style={styles.profileImg} />
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            </View>
          )}
          {/* Login Prompt */}
          {!isAuthenticated && (
            <TouchableOpacity style={styles.loginBox} onPress={() => router.push('/Login')}>
              <Text style={styles.loginText}>Login to unlock more Features!</Text>
            </TouchableOpacity>
          )}
          {/* Menu Items */}
          <View style={styles.menuList}>
            {menuItems.map((item, idx) => (
              <View key={item.label}>
                <TouchableOpacity style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={item.icon} size={moderateScale(24)} color={colors.primaryDark} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={moderateScale(24)} color={colors.white} />
                </TouchableOpacity>
                {idx !== menuItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
          {/* Delete Account */}
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'Are you sure you want to delete this account?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete', style: 'destructive', onPress: () => {
                        router.replace('/(tabs)/Profile');
                      }
                    },
                  ]
                );
              }}
            >
              <Text style={styles.deleteText}>Delete this account</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(60),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(18),
    alignSelf: 'stretch',
  },
  backBtn: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  headerTitle: {
    color: colors.white,
    fontSize: moderateScale(25),
    fontFamily: 'Sigmar',
    flex: 1,
    marginLeft: "20%",
    marginTop: verticalScale(2),
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  profileImg: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: moderateScale(4),
    borderColor: colors.white,
    marginBottom: verticalScale(10),
  },
  profileName: {
    color: colors.white,
    fontSize: moderateScale(22),
    fontFamily: 'Sigmar',
    marginBottom: verticalScale(18),
  },
  menuList: {
    backgroundColor: 'transparent',
    borderRadius: moderateScale(18),
    paddingVertical: verticalScale(2),
    marginBottom: verticalScale(18),
    alignSelf: 'stretch',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(6),
  },
  iconCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(18),
  },
  menuLabel: {
    color: colors.white,
    fontSize: moderateScale(17),
    flex: 1,
    fontFamily: 'PoppinsMedium',
  },
  divider: {
    height: verticalScale(1),
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginLeft: scale(62),
  },
  deleteBtn: {
    alignSelf: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(18),
  },
  deleteText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
  },
  loginBox: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(12),
    alignItems: 'center',
    marginBottom: verticalScale(28),
    marginTop: verticalScale(10),
  },
  loginText: {
    color: colors.primary,
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
  },
});
