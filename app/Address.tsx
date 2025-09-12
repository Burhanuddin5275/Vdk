import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Dimensions, ImageBackground, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Define the address type
type AddressType = {
  id: string;
  address: string;
  city: string;
  street: string;
  block: string;
  phone: string;
  isDefault: boolean;
};

const STORAGE_KEY = 'user_addresses';

const Address = () => {
  const insets = useSafeAreaInsets();
  const { phone, isAuthenticated } = useAuth();
  
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [block, setBlock] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved addresses on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedAddresses();
    }
  }, [isAuthenticated]);

  const loadSavedAddresses = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedAddresses) {
        const addresses = JSON.parse(savedAddresses);
        // Find if there's a default address for this user
        const userDefaultAddress = addresses.find(
          (addr: AddressType) => addr.phone === phone && addr.isDefault
        );
        
        if (userDefaultAddress) {
          setAddress(userDefaultAddress.address);
          setCity(userDefaultAddress.city);
          setStreet(userDefaultAddress.street);
          setBlock(userDefaultAddress.block);
          setSaveAddress(true);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleSaveAddress = async () => {
    if (!address || !city || !street || !block) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const newAddress: AddressType = {
        id: Date.now().toString(),
        address,
        city,
        street,
        block,
        phone: phone || '',
        isDefault: saveAddress
      };

      // Get existing addresses
      const savedAddresses = await AsyncStorage.getItem(STORAGE_KEY);
      let addresses: AddressType[] = [];
      
      if (savedAddresses) {
        addresses = JSON.parse(savedAddresses);
        
        // Remove any existing default address for this user if this is being set as default
        if (saveAddress) {
          addresses = addresses.map((addr: AddressType) => 
            addr.phone === phone ? { ...addr, isDefault: false } : addr
          );
        }
        
        // Update existing address if it exists, otherwise add new one
        const existingIndex = addresses.findIndex(
          (addr: AddressType) => 
            addr.phone === phone && 
            addr.address === address && 
            addr.city === city
        );
        
        if (existingIndex >= 0) {
          addresses[existingIndex] = { ...newAddress, id: addresses[existingIndex].id };
        } else {
          addresses.push(newAddress);
        }
      } else {
        addresses = [newAddress];
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
      
      Alert.alert('Success', 'Address saved successfully');
      
      // Navigate back or to the next screen
      router.back();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
          <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
    <ImageBackground
      source={require('../assets/images/ss1.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backBtn} onPress={router.back}>
                <Ionicons name="arrow-back" size={moderateScale(28)} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add New Address</Text>
            </View>
            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Address*</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="*****"
                placeholderTextColor="#fff"
              />
              <Text style={styles.label}>City*</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="*****"
                placeholderTextColor="#fff"
              />
              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: scale(8) }}>
                  <Text style={styles.label}>Street*</Text>
                  <TextInput
                    style={styles.input}
                    value={street}
                    onChangeText={setStreet}
                    placeholder=""
                    placeholderTextColor="#fff"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: scale(8) }}>
                  <Text style={styles.label}>Block*</Text>
                  <TextInput
                    style={styles.input}
                    value={block}
                    onChangeText={setBlock}
                    placeholder=""
                    placeholderTextColor="#fff"
                  />
                </View>
              </View>
              <View style={styles.saveCardRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setSaveAddress(!saveAddress)}
                  activeOpacity={0.7}
                  disabled={!isAuthenticated}
                >
                  <View style={{
                    width: moderateScale(20),
                    height: moderateScale(20),
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: isAuthenticated ? '#fff' : '#666',
                    backgroundColor: saveAddress ? (isAuthenticated ? '#fff' : '#666') : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {saveAddress && (
                      <Ionicons 
                        name="checkmark" 
                        size={moderateScale(16)} 
                        color={isAuthenticated ? "#E53935" : "#999"} 
                      />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={[styles.saveCardLabel, !isAuthenticated && { color: '#666' }]}>
                  {isAuthenticated ? 'Save as default address' : 'Sign in to save address'}
                </Text>
              </View>
            </View>
          </View>
          {/* Bottom Add Button */}
          <View style={styles.bottomBar}>
                 <Button
                       variant="secondary"
                       style={[styles.addBtn, { alignItems: 'center', justifyContent: 'center' }]}
                       onPress={handleSaveAddress}
                       disabled={isLoading}
                     >
                       {isLoading ? 'Saving...' : 'Apply'}
                     </Button>
          </View>
        </KeyboardAvoidingView>
    </ImageBackground>
          </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    lineHeight: verticalScale(55),
  },
  form: {
    marginTop: verticalScale(10),
    flex: 1,
   paddingHorizontal: scale(20),
  },
  label: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'PoppinsMedium',
    marginBottom: verticalScale(4),
    marginTop: verticalScale(10),
  },
  input: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'PoppinsMedium',
    marginBottom: verticalScale(10),
    backgroundColor: 'transparent',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  checkbox: {
    marginRight: scale(8),
  },
  saveCardLabel: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily: 'PoppinsMedium',
  },
  bottomBar: {
     backgroundColor: colors.secondaryLight,
     borderTopLeftRadius: 32,
     borderTopRightRadius: 32,
     padding: 24,
     paddingBottom: 32,
     alignItems: 'center',
     justifyContent: 'center',
     marginTop: 8,
     height: verticalScale(100),
  },
  addBtn: {
    width: width - 64,
    height: verticalScale(50),
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    paddingVertical: 14,
  },

});

export default Address;