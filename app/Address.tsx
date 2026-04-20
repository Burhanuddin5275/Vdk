import { Button } from '@/components/Button';
import SuccessModal from '@/components/SuccessModal';
import { useAuth } from '@/hooks/useAuth';
import { saveUserAddress } from '@/services/address';
import { fetchUsers, UserItem } from '@/services/user';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { City, Country, State } from 'country-state-city';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, ImageBackground, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
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
const Address = () => {
  const insets = useSafeAreaInsets();
  const [street, setStreet] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('PK'); // PK is the country code for Pakistan
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [postalCode, setPostalCode] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPicker, setCurrentPicker] = useState<'state' | 'city'>('state');
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, phone, token } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserItem | string | null | undefined>(undefined);
  // Country and State are now imported from 'country-state-city' at the top
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
      setUser(token);
    }
    console.log('User:', { street, selectedCity, selectedState, postalCode, selectedCountry });
  }, [phone, token]);
  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryData = Country.getCountryByCode(selectedCountry);
      if (countryData) {
        const countryStates = State.getStatesOfCountry(selectedCountry);
        setStates(countryStates);
        setCities([]); // Reset cities when country changes
        setSelectedState('');
        setSelectedCity('');
      }
    }
  }, [selectedCountry]);

  // Update cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(stateCities);
      setSelectedCity(''); 
    }
  }, [selectedState]);

  const handleSaveAddress = async () => {
    const countryName = 'Pakistan'; 
    const stateName = states.find(s => s.isoCode === selectedState)?.name || selectedState;
    
    if (!street || !selectedCity || !selectedState || !postalCode || !selectedCountry) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!userId || !token) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);

    try {
      const { success, error } = await saveUserAddress({
        street,
        city: selectedCity,
        state: stateName,
        postalCode,
        country: countryName,
        userId,
        token
      });

      if (success) {
        setShowSuccessModal(true);
      } else {
        Alert.alert('Error', error || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert('Error', 'Failed to update address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.back();
  };
  const openPickerModal = (type: 'state' | 'city') => {
    setCurrentPicker(type);
    setSearchQuery('');
    setFilteredItems(type === 'state' ? states : cities);
    setModalVisible(true);
  };

  const handleItemSelect = (item: any) => {
    if (currentPicker === 'state') { 
      setSelectedState(item.isoCode);
    } else {  
      setSelectedCity(item.name);
    } 
    setModalVisible(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const items = currentPicker === 'state' ? states : cities;
    setFilteredItems(
      items.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase())
      )
    );
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
          <ScrollView>
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
              <Text style={styles.label}>Street*</Text>
              <TextInput
                style={styles.input}
                value={street}
                onChangeText={setStreet}
                placeholder=""
                placeholderTextColor="#fff"
              />
              {/* Country and State Pickers in one row */}
              <View style={styles.pickerContainer}>
                {/* Country - Full width */}
                <View style={[styles.pickerWrapper, { width: '100%' }]}>
                  <Text style={styles.label}>Country</Text>
                  <View style={[styles.picker, { justifyContent: 'center', paddingHorizontal: 10 }]}>
                    <TextInput
                      value="Pakistan"
                      editable={false}
                      style={{ color: 'white', fontSize: 16 }}
                    />
                    <TextInput
                      value="Pakistan"
                      onChangeText={setSelectedCountry}
                      style={{ display: 'none' }} // Hidden but maintains the value
                    />
                  </View>
                </View>
                {/* State Picker */}
                <View style={[styles.pickerWrapper, { width: '100%' }]}>
                  <Text style={styles.label}>State</Text>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => openPickerModal('state')}
                  >
                    <Text style={{ color: 'white', marginLeft:scale(8) }}>
                      {selectedState ? states.find(s => s.isoCode === selectedState)?.name : 'Select State'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* City Picker */}
                <View style={[styles.pickerWrapper, { width: '100%' }]}>
                  <Text style={styles.label}>City</Text>
                  <TouchableOpacity
                    style={[styles.picker, !selectedState && { opacity: 0.5 }]}
                    onPress={() => selectedState && openPickerModal('city')}
                    disabled={!selectedState}
                  >
                    <Text style={{ color: 'white', marginLeft:scale(8) }}>
                      {selectedCity || (selectedState ? 'Select City' : 'Select State First')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Postal Code - Full width */}
                <View style={[styles.pickerWrapper, { width: '100%' }]}>
                  <Text style={styles.label}>Postal Code*</Text>
                  <TextInput
                    style={[styles.input, { textAlign: 'left' }]}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder=""
                    placeholderTextColor="#999"
                    keyboardType="numeric"
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
          </ScrollView>
          {/* Bottom Add Button */}
          <View style={styles.bottomBar}>
            <Button
              variant="secondary"
              style={[styles.addBtn, { alignItems: 'center', justifyContent: 'center' }]}
              onPress={handleSaveAddress}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Add'}
            </Button>
            <Modal
              visible={modalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setModalVisible(false)}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.modalContent}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View style={styles.modalInnerContent}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder={`Search ${currentPicker}...`}
                      placeholderTextColor="#999"
                      value={searchQuery}
                      onChangeText={handleSearch}
                      autoFocus
                    />
                    <FlatList
                      data={filteredItems}
                      keyExtractor={(item) => currentPicker === 'state' ? item.isoCode : item.name}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => handleItemSelect(item)}
                        >
                          <Text style={styles.modalItemText}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                      style={styles.modalList}
                    />
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
      <SuccessModal
        visible={showSuccessModal}
        message="Address added successfully"
        subtitle="You can now use this address for checkout"
        autoCloseDelay={2000}
        onClose={handleSuccessModalClose}
      />
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
    fontSize: moderateScale(25),
    color: '#fff',
    fontFamily: 'Sigmar',
    letterSpacing: 1,
    lineHeight: verticalScale(55),
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '45%',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
  },
  modalInnerContent: {
    width: '100%',
    height: '100%',
  },

  searchInput: {
    backgroundColor: '#444',
    color: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
  },

  form: {
    marginTop: verticalScale(10),
    flex: 1,
    paddingHorizontal: scale(20),
  },
  pickerContainer: {
    marginVertical: 10,
    marginBottom: verticalScale(16),
  },
  pickerWrapper: {
    width: '100%',
    marginBottom: verticalScale(16),
  },
  picker: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
    marginTop: 5,
    minHeight: 60,
    justifyContent: 'center',
  },
  pickerInput: {
    color: 'white',
    height: verticalScale(42),
  },
  pickerItem: {
    fontSize: 14,
    height: verticalScale(50),
    color: 'white',
  },
  label: {
    color: '#fff',
    fontSize: moderateScale(14),
    marginBottom: verticalScale(4),
  },
  noteText: {
    color: '#aaa',
    fontSize: moderateScale(10),
    marginTop: 2,
    fontStyle: 'italic',
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