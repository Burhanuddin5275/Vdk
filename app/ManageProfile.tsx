import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { fetchUsers, UserItem, updateUserProfile } from '@/services/user';
import { useAuth } from '@/hooks/useAuth';
import { img_url } from '@/url/url';
import SuccessModal from '@/components/SuccessModal';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
const screenWidth = Dimensions.get('window').width;
const COLUMN_GAP = scale(12);
const CARD_WIDTH = (screenWidth - COLUMN_GAP * 3) / 2
const TABS = ['Set Profile', 'Change Password'] as const;

// ---------- Profile Tab ----------
const ProfileTab = () => {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<UserItem | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const { phone, token } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/(tabs)/Profile');
  };
  useEffect(() => {
    const loadBiometricSetting = async () => {
      const value = await SecureStore.getItemAsync('biometric_enabled');
      setBiometricEnabled(value === 'true');
    };

    loadBiometricSetting();
  }, []);
  const toggleBiometric = async () => {
    const newValue = !biometricEnabled;
    setBiometricEnabled(newValue);
    await SecureStore.setItemAsync('biometric_enabled', String(newValue));
  };
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchUsers();
        const matchedUser = users.find((u) => u.number === phone);

        if (matchedUser) {
          setUser(matchedUser);
          setUserId(matchedUser.id.toString());
          setName(matchedUser.name || '');
        }
      } catch (err) {
        console.error('Error loading users:', err);
      }
    };

    if (phone) loadUsers();
  }, [phone]);

  const handleSelectImage = async () => {
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!userId) {
      setError('User not identified');
      return;
    }
    if (!token) {
      setError('User not identified');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await updateUserProfile(token, userId, {
        name,
        image: profileImage || undefined,
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || 'Failed to update profile');

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.profileContent}>
      <View style={styles.biometricBox}>
        <Text style={styles.biometricText}>Fingerprint Login</Text>

        <TouchableOpacity onPress={toggleBiometric} style={styles.switch}>
          <View style={[styles.switchTrack, biometricEnabled && styles.switchTrackActive]}>
            <View style={[styles.switchThumb, biometricEnabled && styles.switchThumbActive]} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handleSelectImage} style={styles.avatarWrapper}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : user?.image?.uri ? (
            <Image source={{ uri: `${img_url}${user.image.uri}` }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.white} />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color={colors.white} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#999"
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile} disabled={isLoading}>
        <Text style={styles.updateButtonText}>{isLoading ? 'Updating...' : 'Update Profile'}</Text>
      </TouchableOpacity>

      <SuccessModal
        visible={showSuccessModal}
        message="Profile Updated"
        subtitle="Your profile has been updated successfully"
        autoCloseDelay={2000}
        onClose={handleSuccessModalClose}
      />
    </ScrollView>
  );
};

// ---------- Main Page ----------
const ManageProfile = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>(TABS[0]);
  const router = useRouter();

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
            <Text style={styles.headerTitle}>Manage Profile</Text>
          </View>
          <ProfileTab />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ManageProfile;

// ---------- Styles ----------
const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', height: verticalScale(80), paddingHorizontal: scale(18), marginTop: verticalScale(20) },
  backBtn: { width: scale(40), height: scale(40), justifyContent: 'center', zIndex: 1 },
  headerTitle: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, textAlign: 'center', textAlignVertical: 'center', fontSize: moderateScale(28), color: '#fff', fontFamily: 'Sigmar', letterSpacing: 1, lineHeight: verticalScale(55) },
  tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#A01D20', borderRadius: moderateScale(25), marginHorizontal: scale(20), marginVertical: verticalScale(10), padding: moderateScale(5), borderWidth: 1, borderColor: colors.primary },
  tab: { flex: 1, paddingVertical: verticalScale(10), alignItems: 'center', borderRadius: moderateScale(20) },
  activeTab: { backgroundColor: colors.primary },
  tabText: { color: colors.white, fontSize: moderateScale(16), fontFamily: 'Poppins' },
  activeTabText: { fontFamily: 'PoppinsSemi' },
  tabContent: { flex: 1, padding: 16 },
  profileContent: { paddingBottom: 30 },
  updateButtonText: { color: colors.white, fontSize: 16, fontFamily: 'PoppinsSemi' },
  errorText: { color: '#ff4444', fontSize: 14, fontFamily: 'Poppins', marginBottom: verticalScale(10), textAlign: 'center' },
  successText: { color: '#4CAF50', fontSize: 14, fontFamily: 'Poppins', marginBottom: verticalScale(10), textAlign: 'center' },
  biometricBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  biometricText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'PoppinsSemi',
  },

  switch: {
    padding: 5,
  },

  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 20,
    backgroundColor: 'gray',
    justifyContent: 'center',
    padding: 3,
  },

  switchTrackActive: {
    backgroundColor: '#A01D20',
  },

  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },

  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { position: 'relative', width: 120, height: 120, borderRadius: 60, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%', borderRadius: 60 },
  avatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: colors.primaryDark, borderRadius: 15, padding: 5 },
  formGroup: { marginBottom: 20 },
  label: { color: colors.white, marginBottom: 8, fontSize: 16, fontFamily: 'Poppins' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, color: colors.textPrimary, borderWidth: 1, borderColor: '#e0e0e0' },
  updateButton: { backgroundColor: colors.primaryDark, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
});
