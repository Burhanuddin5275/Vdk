import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const logout = async () => {
  await AsyncStorage.removeItem('phone');
  router.replace('/(tabs)/Home');
};

const allMenuItems: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }> = [
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
  { label: 'Logout', icon: 'log-out', onPress: logout },
];

export default function Profile() {
  const router = useRouter();
  // const { phone } = useLocalSearchParams();
  const [phone, setPhone] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('phone').then(setPhone);
  }, []);
  const isLoggedIn = !!phone;
  const menuItems = isLoggedIn
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 75 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          {/* Profile Image & Name */}
          {isLoggedIn && (
            <View style={styles.profileSection}>
              <Image source={require('../../assets/images/Ellipse.png')} style={styles.profileImg} />
              <Text style={styles.profileName}>Lorem Ipsum</Text>
            </View>
          )}
          {/* Login Prompt */}
          {!isLoggedIn && (
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
                    <Ionicons name={item.icon} size={24} color={colors.primaryDark} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={24} color={colors.white} />
                </TouchableOpacity>
                {idx !== menuItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
          {/* Delete Account */}
          {isLoggedIn && (
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
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    alignSelf: 'stretch',
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 25,
    fontFamily: 'Sigmar',
    flex: 1,
    marginLeft: "20%",
    marginTop: 2,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.white,
    marginBottom: 10,
  },
  profileName: {
    color: colors.white,
    fontSize: 22,
    fontFamily: 'Sigmar',
    marginBottom: 18,
  },
  menuList: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    paddingVertical: 2,
    marginBottom: 18,
    alignSelf: 'stretch',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  menuLabel: {
    color: colors.white,
    fontSize: 17,
    flex: 1,
    fontFamily: 'PoppinsMedium',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginLeft: 62,
  },
  deleteBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
  },
  loginBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 10,
  },
  loginText: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: 'PoppinsSemi',
  },
});
