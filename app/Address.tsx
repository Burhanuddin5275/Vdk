import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

const Address = () => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [block, setBlock] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  return (
    <ImageBackground
      source={require('../assets/images/ss1.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
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
                  onPress={() => setSaveCard(!saveCard)}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: moderateScale(20),
                    height: moderateScale(20),
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: '#fff',
                    backgroundColor: saveCard ? '#fff' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {saveCard && (
                      <Ionicons name="checkmark" size={moderateScale(16)} color="#E53935" />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.saveCardLabel}>Save Address</Text>
              </View>
            </View>
          </View>
          {/* Bottom Add Button */}
          <View style={styles.bottomBar}>
                 <Button
                       variant="secondary"
                       style={[styles.addBtn, { alignItems: 'center', justifyContent: 'center', }]}
                       onPress={() => {}}
                     >
                       Apply
                     </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
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