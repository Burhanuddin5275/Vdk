import SuccessModal from '@/components/SuccessModal';
import { useAuth } from '@/hooks/useAuth';
import { fetchUsers, UserItem } from '@/services/user';
import { Address, useAddressStore } from '@/store/addressStore';
import { colors } from '@/theme/colors';
import { Api_url } from '@/url/url';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Keyboard,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const ShippingAddress = () => {
  const [user, setUser] = useState<UserItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<number>(-1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);
  const { isAuthenticated, phone } = useAuth();
  const { selectedAddress, setSelectedAddress } = useAddressStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [addressToDeleteIndex, setAddressToDeleteIndex] = useState<number>(-1);
  const router = useRouter();
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);


  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        loadUserAddresses();
      }
    }, [isAuthenticated])
  );
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


  const addresses = user?.addresses || [];

  const deleteAddress = async (addressId: string) => {
    const API_URL = `${Api_url}/api/delete-user-address/${addressId}/`;

    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setShowDeleteModal(false);
    setShowSuccessModal(true);

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

    const selectedAddress = userAddresses[selected];
    const addressForStore: Address = {
      id: selectedAddress.id || Date.now().toString(),
      country: selectedAddress.country || '',
      state: selectedAddress.state || '',
      postal_code: selectedAddress.postal_code || '',
      city: selectedAddress.city || '',
      street: selectedAddress.street || '',
      block: selectedAddress.block || '',
    };
    // Save the selected address to the store
    setSelectedAddress(addressForStore);
    router.back();
  };

  // Set initial selected address when user or selectedAddress changes
  useEffect(() => {
    if (user && Array.isArray(user.addresses) && user.addresses.length > 0 && selectedAddress) {
      const initialSelectedIndex = user.addresses.findIndex(addr =>
        addr.id === selectedAddress.id
      );
      if (initialSelectedIndex !== -1) {
        setSelected(initialSelectedIndex);
      }
    }
  }, [user, selectedAddress]);

  // Update userAddresses when user changes
  useEffect(() => {
    if (user?.addresses) {
      setUserAddresses(user.addresses);
    }
  }, [user]);

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate back to ShippingAddress screen
    router.replace('/ShippingAddress');
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
                      <TouchableOpacity
                        style={styles.addressDetails}
                        onPress={() => handleSelectAddress(index)}
                      >
                        <View style={styles.addressRow}>
                          <Text style={styles.addressLabel}>Street:</Text>
                          <Text style={styles.addressValue}>{address.street}</Text>
                        </View>
                        <View style={styles.addressRow}>
                          <Text style={styles.addressLabel}>City:</Text>
                          <Text style={styles.addressValue}>{address.city}</Text>
                        </View>
                        <View style={styles.addressRow}>
                          <Text style={styles.addressLabel}>State:</Text>
                          <Text style={styles.addressValue}>{address.state}</Text>
                        </View>
                        <View style={styles.addressRow}>
                          <Text style={styles.addressLabel}>Postal Code:</Text>
                          <Text style={styles.addressValue}>{address.postal_code}</Text>
                        </View>
                        <View style={styles.addressRow}>
                          <Text style={styles.addressLabel}>Country:</Text>
                          <Text style={styles.addressValue}>{address.country}</Text>
                        </View>

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
                              color={selected === index ? colors.primary : colors.primary}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => {
                              setAddressToDelete(address.id);
                              setAddressToDeleteIndex(index);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Ionicons name="trash-outline" size={20} color="white" />

                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
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
        <SuccessModal
          visible={showSuccessModal}
          message="Address deleted successfully"
          autoCloseDelay={2000}
          onClose={handleSuccessModalClose}
        />
        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Address</Text>
              <Text style={styles.modalText}>Are you sure you want to delete this address?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowDeleteModal(false)}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => addressToDelete && deleteAddress(addressToDelete)}
                  disabled={isLoading}
                >
                  <Text style={styles.deleteButtonText}>
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
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
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  addressLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    width: '40%',
  },
  addressValue: {
    color: '#fff',
    fontSize: 14,
    width: '55%',
    textAlign: 'right',
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
    backgroundColor: 'rgba(193, 128, 128, 0.2)',
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
    paddingTop: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  selectedButton: {
    backgroundColor: colors.white,
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