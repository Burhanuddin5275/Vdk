import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { fetchUsers, UserItem } from '@/services/user';
import { useAuth } from '@/hooks/useAuth';
import { Api_url, img_url } from '@/url/url';
import SuccessModal from '@/components/SuccessModal';
const screenWidth = Dimensions.get('window').width;
const COLUMN_GAP = scale(12);
const CARD_WIDTH = (screenWidth - COLUMN_GAP * 3) / 2
const TABS = ['Set Profile', 'Change Password'] as const;
// Tab Components
const ProfileTab = () => {
  const [name, setName] = React.useState('');
  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { isAuthenticated, phone, token } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserItem | string | null | undefined>(undefined);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const handleSuccessModalClose = () => {
  setShowSuccessModal(false);
  router.replace('/(tabs)/Profile');
  };
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchUsers();
        const matchedUser = users.find((u) => u.number === phone);

        if (matchedUser) {
          setUser(matchedUser);
          setUserId(matchedUser.id.toString());
          console.log('Matched user:', matchedUser);
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
  const handleSelectImage = async () => {
    try {
      setIsLoading(true);
      const image = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log('Selected image:', image);

      if (image && !image.canceled && image.assets && image.assets[0]) {
        setProfileImage(image.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!user) {
      setError('User not identified');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const url = `${Api_url}api/update-user/${userId}/`;
      console.log('Updating profile at URL:', url);

      const formData = new FormData();
      formData.append('name', name);

      if (profileImage) {
        formData.append('image', {
          uri: profileImage,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          // DO NOT set 'Content-Type'
          'Authorization': `Token ${token}`,
        },
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to update profile');
      }

      console.log('Profile updated successfully:', responseData);
      setShowSuccessModal(true);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.profileContent}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handleSelectImage} style={styles.avatarWrapper}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              {typeof user === 'object' && user?.image?.uri !== 'null' ? (
                <Image
                  source={{ uri: `${img_url}${user?.image.uri}` }}
                  style={styles.avatar}
                />
              ) : (
                <Ionicons name="person" size={40} color={colors.white} />
              )}
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
          placeholder={typeof user === 'object' && user !== null && user?.name && user.name !== '' && user.name !== 'null' ? user.name : 'Enter your name'}
          placeholderTextColor="#999"
        />
      </View>
      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdateProfile}
      >
        <Text style={styles.updateButtonText}>Update Profile</Text>
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

const ChangePasswordTab = () => {
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [currentStep, setCurrentStep] = React.useState<'current' | 'new'>('current');
  const { password, token } = useAuth();

  useEffect(() => {
    if (token === password) {
      setIsCurrentPasswordValid(true);
    } else {
      setIsCurrentPasswordValid(false);
    }
    console.log(currentPassword);
    console.log(password);
    console.log(isCurrentPasswordValid);
  }, [currentPassword, password]);
  const handleChange = async () => {
    if (currentPassword === password) {
      setIsCurrentPasswordValid(true);
    } else {
      setIsCurrentPasswordValid(false);
    }
  }
  const handleChangePassword = async () => {

    try {
      const response = await fetch(`${Api_url}api/update-user//`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.profileContent}>
      {/* {isCurrentPasswordValid === false ? (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter your current password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.updateButton, isLoading && styles.disabledButton]}
            onPress={handleChange}
            disabled={isLoading}
          >
            <Text style={styles.updateButtonText}>
              Continue
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter your new password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.updateButton, isLoading && styles.disabledButton]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text style={styles.updateButtonText}>
              Update Password
            </Text>
          </TouchableOpacity>
        </>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
      {success && <Text style={styles.successText}>{success}</Text>} */}
    </ScrollView>
  );
};

const ManageProfile = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  type TabType = typeof TABS[number];
  const [activeTab, setActiveTab] = useState<TabType>(TABS[0]);

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

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 'Set Profile' ? <ProfileTab /> : <ChangePasswordTab />}
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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#A01D20',
    borderRadius: moderateScale(25),
    marginHorizontal: scale(20),
    marginVertical: verticalScale(10),
    padding: moderateScale(5),
    borderWidth: 1,
    borderColor: colors.primary
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: moderateScale(20),
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontFamily: 'Poppins',
  },
  activeTabText: {
    fontFamily: 'PoppinsSemi',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  profileContent: {
    paddingBottom: 30,
  },
  updateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'PoppinsSemi',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    fontFamily: 'Poppins',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    fontFamily: 'Poppins',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.primaryDark,
    borderRadius: 15,
    padding: 5,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: colors.white,
    marginBottom: 8,
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  updateButton: {
    backgroundColor: colors.primaryDark,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },

  contentContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  card: {
    padding: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  cardImage: {
    width: scale(60),
    height: verticalScale(60),
    marginRight: scale(15),
    borderRadius: moderateScale(10),
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
  },
  cardStatus: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins',
    marginBottom: verticalScale(2),
  },
  statusInProgress: {
    color: '#FFD700',
  },
  statusCompleted: {
    color: '#00FF00',
  },
  cardPoints: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontFamily: 'Poppins',
  },
});

export default ManageProfile;