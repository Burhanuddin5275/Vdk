import { Button } from '@/components/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useAddressStore, type Address } from '../store/addressStore';

const { width, height } = Dimensions.get('window');

// Re-export the Address type from the store
type AddressType = Address & {
  phone: string; // Add phone field which is specific to local storage
};

const STORAGE_KEY = 'user_addresses';

const ShippingAddress = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone, isAuthenticated } = useAuth();
  const { selectedAddress, setSelectedAddress } = useAddressStore();
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<number>(-1);

  const deleteAddress = async (addressId: string) => {
    try {
      Alert.alert(
        'Delete Address',
        'Are you sure you want to delete this address?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));
              setAddresses(updatedAddresses);
              
              // Reset selection if the deleted address was selected
              if (selectedAddress?.id === addressId) {
                setSelectedAddress(null);
                setSelected(-1);
              } else if (selected >= updatedAddresses.length) {
                // Adjust selected index if needed
                setSelected(updatedAddresses.length - 1);
              }
              
              Alert.alert('Success', 'Address deleted successfully');
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error deleting address:', error);
      Alert.alert('Error', 'Failed to delete address');
    }
  };

  const loadAddresses = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const savedAddresses = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedAddresses) {
        const parsedAddresses: AddressType[] = JSON.parse(savedAddresses);
        const userAddresses = parsedAddresses.filter(addr => addr.phone === phone);
        setAddresses(userAddresses);
        
        // Set selected address if one is already selected in the store
        if (selectedAddress && 'id' in selectedAddress) {
          const idx = userAddresses.findIndex(addr => 
            addr.id === selectedAddress.id
          );
          if (idx !== -1) setSelected(idx);
        } else if (userAddresses.length > 0) {
          // Select the default address if none is selected
          const defaultIdx = userAddresses.findIndex(addr => addr.isDefault);
          setSelected(defaultIdx !== -1 ? defaultIdx : 0);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load saved addresses');
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved addresses
  useEffect(() => {
    loadAddresses();
  }, [isAuthenticated, phone, selectedAddress?.id]);

  // Update selected address in store when selection changes
  useEffect(() => {
    if (addresses.length > 0 && selected >= 0 && selected < addresses.length) {
      const { phone, ...addr } = addresses[selected];
      setSelectedAddress({
        ...addr,
        label: addr.address,
        desc: `${addr.street}, ${addr.city}`,
      });
    }
  }, [selected, addresses]);

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
            <Ionicons name="arrow-back" size={moderateScale(24)}color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shipping Address</Text>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ marginTop: 16 }}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.white} />
                <Text style={styles.loadingText}>Loading addresses...</Text>
              </View>
            ) : !isAuthenticated ? (
              <View style={styles.authMessage}>
                <Text style={styles.authMessageText}>
                  Please sign in to view and manage your saved addresses
                </Text>
                <Button 
                  variant="secondary" 
                  onPress={() => router.push('/Login')}
                  style={{ marginTop: 16 }}
                >
                  Sign In
                </Button>
              </View>
            ) : addresses.length === 0 ? (
              <View style={styles.noAddresses}>
                <Ionicons name="location-outline" size={48} color={colors.white} style={{ opacity: 0.6 }} />
                <Text style={styles.noAddressesText}>No saved addresses</Text>
                <Text style={styles.noAddressesSubtext}>
                  Add a new address to get started
                </Text>
              </View>
            ) : (
              addresses.map((addr, idx) => (
                <View key={addr.id}>
                  <TouchableOpacity
                    style={styles.addressRow}
                    activeOpacity={0.8}
                    onPress={() => setSelected(idx)}
                  >
                    <IconSymbol 
                      name="location.fill" 
                      size={28} 
                      color={addr.isDefault ? colors.primary : colors.white} 
                      style={{ marginRight: 12 }} 
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.addressHeader}>
                        <Text style={styles.addressLabel}>
                          {addr.address}
                        </Text>
                        {addr.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addressDesc}>
                        {`${addr.street}, ${addr.city}`}
                      </Text>
                      {addr.block && (
                        <Text style={styles.addressBlock}>
                          Block: {addr.block}
                        </Text>
                      )}
                    </View>
                    <Ionicons
                      name={selected === idx ? 'radio-button-on' : 'radio-button-off'}
                      size={26}
                      color={selected === idx ? colors.white : colors.secondaryDark}
                      style={{ marginRight: 8 }}
                    />
                    <TouchableOpacity 
                      onPress={() => deleteAddress(addr.id)}
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={22} color="white" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {idx < addresses.length - 1 && <View style={styles.divider} />}
                </View>
              ))
            )}
          </View>

          {/* Add New Address */}
          <TouchableOpacity style={styles.addNewBox} activeOpacity={0.85} onPress={() => router.push('/Address')}>
            <Text style={styles.addNewText}>+ Add New Shipping Address</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.applyContainer}>
          <Button
            variant="secondary"
            style={[styles.applyBtn, { 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: !isAuthenticated || addresses.length === 0 ? 0.6 : 1
            }]}
            disabled={!isAuthenticated || addresses.length === 0 || selected === -1}
            onPress={() => {
              if (addresses[selected]) {
                const addr = addresses[selected];
                setSelectedAddress({
                  id: addr.id,
                  label: addr.address,
                  desc: `${addr.street}, ${addr.city}`,
                  address: addr.address,
                  city: addr.city,
                  street: addr.street,
                  block: addr.block,
                  isDefault: addr.isDefault
                });
              }
              router.back();
            }}
          >
            {!isAuthenticated ? 'Sign In to Continue' : 
             addresses.length === 0 ? 'No Addresses' : 'Apply'}
          </Button>
        </View>
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  addressLabel: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'PoppinsMedium',
  },
  addressDesc: {
    color: colors.white,
    fontSize: 15,
    opacity: 0.8,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
  },
  addNewBox: {
    marginTop: 28,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.secondary,
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingVertical: 22,
  },
  addNewText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.white,
    marginTop: 10,
    fontSize: 16,
  },
  authMessage: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  authMessageText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  noAddresses: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAddressesText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  noAddressesSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  defaultBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  addressBlock: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  applyContainer: {
    backgroundColor: colors.secondaryLight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    height:verticalScale(100),
  },
  applyBtn: {
    width: width - 64,
    height: verticalScale(50),
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    paddingVertical: moderateScale(12),
  },
});

export default ShippingAddress;