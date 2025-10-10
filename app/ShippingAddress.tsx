import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { fetchUsers, UserItem } from '@/services/user';
import { colors } from '@/theme/colors';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const ShippingAddress = () => {
  const [user, setUser] = useState<UserItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<number>(-1);
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);
  const { isAuthenticated, phone } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadUserAddresses = async () => {
      try {
        setIsLoading(true);
        const users = await fetchUsers();
        if (users?.length > 0) {
          const currentUser = users.find(u => u.number === phone) || users[0];
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
        Alert.alert('Error', 'Failed to load addresses');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadUserAddresses();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, phone]);

  const addresses = user?.addresses || [];

  const deleteAddress = async (addressId: string) => {
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
              const API_URL = `http://192.168.1.108:8000/api/delete-user-address/${addressId}/`;
              console.log('Attempting to delete address at URL:', API_URL);
  
              const response = await fetch(API_URL, {
                method: 'DELETE',
              });
  
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                  errorData.message || `HTTP error! status: ${response.status}`
                );
              }
  
              // Refresh the addresses after successful deletion
              try {
                const users = await fetchUsers();
                if (users?.length > 0) {
                  const currentUser = users.find(u => u.number === phone) || users[0];
                  setUser(currentUser);
                }
                Alert.alert('Success', 'Address deleted successfully', [
                  { 
                    text: 'OK',
                    onPress: () => {
                      setSelected(-1);
                      setExpandedAddress(null);
                      setUser(prev => prev ? { ...prev } : null);
                    }
                  }
                ]);
              } catch (refreshError) {
                console.error('Error refreshing addresses:', refreshError);
                Alert.alert('Success', 'Address deleted, but could not refresh the list');
              }
       
          },
        },
      ],
      { cancelable: true }
    );
  };
  const handleSelectAddress = (index: number) => {
    setSelected(index);
    // Optionally close the expanded address after selection
    setExpandedAddress(null);
  };

  const handleUseAddress = () => {
    if (selected === -1) {
      Alert.alert('Please select an address');
      return;
    }
    const selectedAddress = addresses[selected];
    // Here you can add logic to save the selected address to a global state
    // or navigate back to the previous screen with the selected address
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      setExpandedAddress(null);
    }}>
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('../assets/images/ss1.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>My Addresses</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
              ) : !isAuthenticated ? (
                <View style={styles.authMessage}>
                  <Text style={styles.authMessageText}>
                    Please sign in to view your saved addresses
                  </Text>
                  <TouchableOpacity
                    style={styles.signInButton}
                    onPress={() => router.push('/Login')}
                  >
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              ) : addresses.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="location-outline" size={64} color="#999" />
                  <Text style={styles.emptyStateTitle}>No addresses saved</Text>
                  <Text style={styles.emptyStateText}>
                    You haven't added any shipping addresses yet.
                  </Text>
                </View>
              ) : (
                addresses.map((address, index) => (
                  <View key={address.id} style={styles.addressContainer}>
                    <TouchableOpacity
                      style={styles.addressHeader}
                      onPress={() => setExpandedAddress(
                        expandedAddress === address.id ? null : address.id
                      )}
                    >
                      <View style={styles.addressHeaderContent}>
                        <Ionicons
                          name="location"
                          size={20}
                          color={selected === index ? colors.primary : '#fff'}
                        />
                        <Text style={styles.addressTitle}>
                          {`Address ${index + 1}`}
                          {selected === index && ' (Selected)'}
                        </Text>
                      </View>
                      <Ionicons
                        name={expandedAddress === address.id ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#fff"
                      />
                    </TouchableOpacity>

                    {expandedAddress === address.id && (
                      <View style={styles.addressDetails}>
                        <Text style={styles.addressText}>
                          {[address.street, address.city, address.state, address.postal_code, address.country]
                            .filter(Boolean)
                            .join(', ')}
                        </Text>

                        <View style={styles.addressActions}>
                          <TouchableOpacity
                            style={[
                              styles.selectButton,
                              selected === index && styles.selectedButton
                            ]}
                            onPress={() => handleSelectAddress(index)}
                          >
                            <Ionicons
                              name={selected === index ? 'checkmark-circle' : 'radio-button-off'}
                              size={20}
                              color={selected === index ? colors.primary : '#666'}
                            />
                            <Text style={styles.selectButtonText}>
                              {selected === index ? 'Selected' : 'Select this address'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteAddress(address.id)}
                          >
                            <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/Address')}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
                <Text style={styles.addButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.useAddressButton,
                  { opacity: selected === -1 ? 0.6 : 1 }
                ]}
                onPress={handleUseAddress}
                disabled={selected === -1}
              >
                <Text style={styles.useAddressButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  addButtonContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  background: {
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
  backButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for the footer
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
  },
  authMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  authMessageText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    margin: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  // Address card styles
  addressContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  addressHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTitle: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    fontFamily: 'Arial',
    fontWeight: '600',
  },
  addressDetails: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  selectedButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  selectButtonText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    marginLeft: 8,
    color: '#ff3b30',
    fontSize: 14,
  },
  footer: {
    backgroundColor: colors.secondaryLight,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(-20),
    paddingHorizontal: scale(20),
    height: verticalScale(100),
  },
  useAddressButton: {
    width: '80%',
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useAddressButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    width: '80%',
    borderRadius: 15,
    paddingVertical: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,

  },
  addButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ShippingAddress;