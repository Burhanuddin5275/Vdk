import { Button } from '@/components/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useAddressStore } from '../store/addressStore';

const { width, height } = Dimensions.get('window');

const ADDRESSES = [
  { label: 'Home', desc: 'lorem ispum' },
  { label: 'Office', desc: 'lorem ispum' },
  { label: "Parent's House", desc: 'lorem ispum' },
];

const ShippingAddress = () => {
  const router = useRouter();
  const { selectedAddress } = useAddressStore();
  const initialIndex = selectedAddress
    ? ADDRESSES.findIndex(
        (a) => a.label === selectedAddress.label && a.desc === selectedAddress.desc
      )
    : 0;
  const [selected, setSelected] = useState(initialIndex >= 0 ? initialIndex : 0);

  useEffect(() => {
    if (selectedAddress) {
      const idx = ADDRESSES.findIndex(
        (a) => a.label === selectedAddress.label && a.desc === selectedAddress.desc
      );
      if (idx !== -1 && idx !== selected) setSelected(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress]);

  return (
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
            {ADDRESSES.map((addr, idx) => (
              <View key={addr.label}>
                <TouchableOpacity
                  style={styles.addressRow}
                  activeOpacity={0.8}
                  onPress={() => setSelected(idx)}
                >
                  <IconSymbol name="location.fill" size={28} color={colors.white} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    <Text style={styles.addressDesc}>{addr.desc}</Text>
                  </View>
                  <Ionicons
                    name={selected === idx ? 'radio-button-on' : 'radio-button-off'}
                    size={26}
                    color={selected === idx ? colors.white : colors.secondaryDark}
                  />
                </TouchableOpacity>
                {idx < ADDRESSES.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
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
            style={[styles.applyBtn, { alignItems: 'center', justifyContent: 'center', }]}
            onPress={() => {
              useAddressStore.getState().setSelectedAddress(ADDRESSES[selected]);
              router.back();
            }}
          >
            Apply
          </Button>
        </View>
      </View>
    </ImageBackground>
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
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(20),
    backgroundColor: 'transparent',
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