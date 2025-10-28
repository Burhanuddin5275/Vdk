import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchUsers, UserItem } from '@/services/user';
import { Api_url, img_url } from '@/url/url';
import SuccessModal from '@/components/SuccessModal';
const { width } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();
  const { isAuthenticated, phone, logout, token } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<UserItem | string | null | undefined>(undefined);
  const [userId, setUserId] = useState<string | number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchUsers();
        const matchedUser = users.find((u) => u.number === phone);

        if (matchedUser) {
          setUser(matchedUser);
          setUserId(matchedUser.id);
          console.log('Matched user:', matchedUser);
          console.log('Matched user ID:', matchedUser.id);
        } else {
          console.log('No user found with phone:', phone);
          setUser(token);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setUser(token);
      }
    };

    if (phone) {
      loadUsers();
    } else {
      setUser(token); // Fallback to token if no phone
    }

  }, [phone, token]);
  const handleLogout = () => {
    logout();
    router.push('/(tabs)/Home');
    router.replace('/(tabs)/Home');
  };
  const deleteAccount = async (): Promise<void> => {
    const url = `${Api_url}api/account-delete/${userId}/`;
    console.log('Attempting to delete account with URL:', url);
    console.log('userId value:', userId);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.status} ${response.statusText}`);
      }
      setShowSuccessModal(true); 
      console.log('Account deletion successful');
    } catch (error) {
      clearTimeout(timeoutId);
    }
  };
  const allMenuItems = [
    { label: 'My orders', icon: 'cart', onPress: () => { router.push('/Orders') } },
    { label: 'Chat', icon: 'chatbubble-ellipses', onPress: () => { router.push('/Chat') } },
    { label: 'Wishlist', icon: 'heart', onPress: () => { router.push('/Wishlist') } },
    { label: 'Manage addresses', icon: 'location', onPress: () => { router.push('/ShippingAddress') } },
    { label: 'Manage profile', icon: 'person-circle', onPress: () => { router.push('/ManageProfile') } },
    { label: 'Contact us', icon: 'paper-plane', onPress: () => { } },
    { label: 'About us', icon: 'information-circle', onPress: () => { } },
    { label: 'Terms & conditions', icon: 'document-text', onPress: () => { } },
    { label: 'Redeemed', icon: 'gift', onPress: () => { router.push('/Redeemed') } },
    { label: 'Privacy policy', icon: 'shield-checkmark', onPress: () => { } },
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
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    logout();
    router.replace('/(tabs)/Home');
  };
  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground
        source={require('../../assets/images/ss1.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {showDeleteModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Delete this account</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete this customer account? By proceeding, all the data will be removed permanently.
              </Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    setShowDeleteModal(false);
                    await deleteAccount();
                    setShowSuccessModal(true);
                   
                  } catch (error) {
                    console.error('Error during account deletion process:', error);
                    alert('Failed to delete account. Please try again later.');
                    setShowDeleteModal(false);
                  }
                }}
              >
                <Text style={styles.modalDelete}>Yes, delete account</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: verticalScale(75) }}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={moderateScale(28)} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile</Text>
            </View>
            {/* Profile Image & Name */}
            {isAuthenticated && (
              <View style={styles.profileSection}>
                <Image
                  source={typeof user === 'object' && user?.image?.uri !== 'null'
                    ? { uri: `${img_url}${user?.image.uri}` }
                    : require('../../assets/images/blank-profile-picture-973460_1280.webp')
                  }
                  style={styles.profileImg}
                />
                <Text style={styles.profileName}>
                  {typeof user === 'object' && user?.name && user.name !== '' && user.name !== 'null' ? user?.name : phone}
                </Text>
              </View>
            )}
            {/* Login Prompt */}
            {!isAuthenticated && (
              <TouchableOpacity style={styles.loginBox} onPress={() => router.push(`/Login?returnTo=${encodeURIComponent('/(tabs)/Profile')}`)}>
                <Text style={styles.loginText}>Login to unlock more Features!</Text>
              </TouchableOpacity>
            )}
            {/* Menu Items */}
            <View style={styles.menuList}>
              {menuItems.map((item, idx) => (
                <View key={item.label}>
                  <TouchableOpacity style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
                    <View style={styles.iconCircle}>
                      <Ionicons name={item.icon as any} size={moderateScale(24)} color={colors.primaryDark} />
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
                onPress={() => setShowDeleteModal(true)}
              >
                <Text style={styles.deleteText}>Delete this account</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
      <SuccessModal
        visible={showSuccessModal}
        message="Account deleted successfully"
        subtitle="Now you cannot use this account for login"
        autoCloseDelay={2000}
        onClose={handleSuccessModalClose}
      />
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  headerRow: {
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
    lineHeight: 56,
  },
  profileSection: {
    alignItems: 'center',
  },
  profileImg: {
    width: moderateScale(150),
    height: moderateScale(145),
    borderRadius: moderateScale(50),
  },
  profileName: {
    color: colors.white,
    fontSize: moderateScale(22),
    lineHeight: moderateScale(40),
    fontFamily: 'Sigmar',
  },
  menuList: {
    padding: scale(16),
    backgroundColor: 'transparent',
    borderRadius: moderateScale(18),
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
    marginLeft: scale(8),
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
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(12),
    alignItems: 'center',
    marginLeft: scale(14),
    marginBottom: verticalScale(18),
    width: scale(320)
  },
  loginText: {
    color: colors.primary,
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#F8D7DA',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalCancel: {
    color: '#007AFF',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDelete: {
    color: '#D32F2F',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
