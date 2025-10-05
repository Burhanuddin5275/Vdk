import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { Api_url } from '@/url/url';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

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
  const { isAuthenticated, phone, token, user } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${Api_url}api/app-user/list/`);
        const users = response.data;
        const matchedUser = users.find((u: any) => u.number === phone);

        if (matchedUser) {
          setUserId(matchedUser.id);
          console.log('Matched user ID:', matchedUser.id);
        } else {
          console.log('No user found with phone:', phone);
          setUserId(token);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserId(token);
      }
    };

    if (phone) {
      fetchUserData();
    } else {
      setUserId(token); // Fallback to token if no phone
    }
  }, [phone, token]);
  const handleSelectImage = async () => {
    try {
      setIsLoading(true);
      let image = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log('Selected image:', image);
  
      if (image ) {
       
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
    
    if (!userId) {
      setError('User not identified');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const url = `http://192.168.1.114:8000/api/update-user/${userId}/`;
      console.log('Updating profile at URL:', url);
      
      const formData = new FormData();
      formData.append('name', name);

      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Token ${token}`,
          // Let the browser set the Content-Type with boundary for FormData
        },
        body: formData
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to update profile');
      }
      
      console.log('Profile updated successfully:', responseData);
      alert('Profile updated successfully!');
      
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
          placeholder="Enter your full name"
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdateProfile}
      >
        <Text style={styles.updateButtonText}>Update Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ChangePasswordTab = () => (
  <View style={styles.tabContent}>
    <Text>Change Password Content</Text>
  </View>
);

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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor:'black',
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
  updateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'PoppinsSemi',
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