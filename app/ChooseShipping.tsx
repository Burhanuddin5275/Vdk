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
import { useShippingStore } from '../store/shippingStore';

const { width, height } = Dimensions.get('window');

const SHIPPING_OPTIONS = [
  { 
    id: 'economy',
    label: 'Economy', 
    desc: 'Estimated Arrival: 25 Aug 2025',
    icon: 'cube.fill'
  },
  { 
    id: 'regular',
    label: 'Regular', 
    desc: 'Estimated Arrival: 24 Aug 2025',
    icon: 'cube.fill'
  },
  { 
    id: 'cargo',
    label: 'Cargo', 
    desc: 'Estimated Arrival: 22 Aug 2025',
    icon: 'car.fill'
  },
];

const ChooseShipping = () => {
  useEffect(() => {
    // No-op, as fonts are now loaded globally
  }, []);

  const router = useRouter();
  const { selectedShipping } = useShippingStore();
  const initialIndex = selectedShipping
    ? SHIPPING_OPTIONS.findIndex(
        (s) => s.id === selectedShipping.id
      )
    : 0;
  const [selected, setSelected] = useState(initialIndex >= 0 ? initialIndex : 0);

  useEffect(() => {
    if (selectedShipping) {
      const idx = SHIPPING_OPTIONS.findIndex(
        (s) => s.id === selectedShipping.id
      );
      if (idx !== -1 && idx !== selected) setSelected(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShipping]);

  const getShippingIcon = (label: string) => {
    switch (label.toLowerCase()) {
        case 'economy':
            return 'cube.fill';
        case 'regular':
            return 'cube.fill';
        case 'cargo':
            return 'car.fill';
        default:
            return 'cube.fill';
    }
  };

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
            <Ionicons name="arrow-back" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Shipping</Text>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ marginTop: 16 }}>
            {SHIPPING_OPTIONS.map((option, idx) => (
              <View key={option.id}>
                <TouchableOpacity
                  style={styles.shippingRow}
                  activeOpacity={0.8}
                  onPress={() => setSelected(idx)}
                >
                  <IconSymbol 
                    name={getShippingIcon(option.label)} 
                    size={28} 
                    color={colors.white} 
                    style={{ marginRight: 12 }} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shippingLabel}>{option.label}</Text>
                    <Text style={styles.shippingDesc}>{option.desc}</Text>
                  </View>
                  <Ionicons
                    name={selected === idx ? 'radio-button-on' : 'radio-button-off'}
                    size={26}
                    color={selected === idx ? colors.white : colors.secondaryDark}
                  />
                </TouchableOpacity>
                {idx < SHIPPING_OPTIONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.applyContainer}>
          <Button
            variant="secondary"
            style={[styles.applyBtn, { alignItems: 'center', justifyContent: 'center' }]}
            onPress={() => {
              useShippingStore.getState().setSelectedShipping(SHIPPING_OPTIONS[selected]);
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
    height: verticalScale(120),
    position: 'relative',
    paddingHorizontal: scale(16)
  },
  backBtn: {
   width: 40,
    height: 56,
    alignItems: 'center',
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
    fontSize: moderateScale(24),
    color: '#fff',
    fontFamily: 'Sigmar',
    letterSpacing: 1,
    lineHeight: 56,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  shippingLabel: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'PoppinsSemi',
  },
  shippingDesc: {
    color: colors.white,
    fontSize: 15,
    opacity: 0.8,
    fontFamily: 'InterRegular',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
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
  },
  applyBtn: {
    width: width - 64,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    paddingVertical: 14,
  },
});

export default ChooseShipping;
