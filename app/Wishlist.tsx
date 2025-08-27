import { selectPhone } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { create } from 'zustand';
import { Colors } from '../constants/Colors';


export type WishlistItem = {
  id: string;
  name: string;
  pack?: string;
  regular_price: number;
  sale_price?: number;
  image: any;
  category?: string; // Add category to wishlist item
  variant?: {
    price: number;
    sale_price?: number;
    label?: string;
  };
};

interface WishlistState {
  items: WishlistItem[];
  phone: string;
  setPhone: (phone: string) => void;
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  loadWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  phone: '',
  setPhone: (phone: string) => set({ phone }),
  loadWishlist: async () => {
    const phone = get().phone || '';
    if (!phone) return;
    set({ phone });
    const stored = await AsyncStorage.getItem(`wishlistItems_${phone}`);
    if (stored) set({ items: JSON.parse(stored) });
    else set({ items: [] });
  },
  addToWishlist: async (item) => {
    const phone = get().phone || '';
    if (!phone) return;

    const current = get().items;
    const isExisting = current.some(i => i.id === item.id);

    if (isExisting) return; // Item already in wishlist

    const updated = [...current, item];
    set({ items: updated });
    await AsyncStorage.setItem(`wishlistItems_${phone}`, JSON.stringify(updated));
  },
  removeFromWishlist: async (id: string) => {
    const phone = get().phone || '';
    if (!phone) return;

    const current = get().items;
    const updated = current.filter(i => i.id !== id);

    set({ items: updated });
    await AsyncStorage.setItem(`wishlistItems_${phone}`, JSON.stringify(updated));
  },
}));

const Wishlist: React.FC = () => {
  const router = useRouter();
  const phone = useAppSelector(selectPhone);
  const wishlistData = useWishlistStore(state => state.items);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const setPhone = useWishlistStore(state => state.setPhone);
  const loadWishlist = useWishlistStore(state => state.loadWishlist);

  useEffect(() => {
    if (phone) {
      setPhone(phone);
      loadWishlist();
    }
  }, [phone]);
  const renderItem = ({ item }: { item: WishlistItem }) => {
    // Create a unique key for the item including variant info
    const displayPrice = item.variant?.sale_price || item.variant?.price || item.sale_price || item.regular_price;
    
    return (
      <View style={styles.card}>
        <Image source={item.image} style={styles.productImg} resizeMode="cover" />
        <View style={styles.infoWrap}>
          <Text style={styles.productName}>{item.name}</Text>
          {(() => {
            const sizeLabel = item.variant?.label || (item as any).variant?.name || item.pack;
            return sizeLabel ? (
              <Text style={styles.productVariant}>{sizeLabel}</Text>
            ) : null;
          })()}

          <Text style={styles.productPrice}>Pkr {displayPrice.toLocaleString()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.removeBtn} 
          onPress={async () => await removeFromWishlist(item.id)}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const insets = useSafeAreaInsets();

  return (
          <SafeAreaView style={[styles.container, { paddingBottom: Math.max(insets.bottom, verticalScale(4)) }]}>
    <ImageBackground source={require('../assets/images/wishlist.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
        <FlatList
          data={wishlistData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
        </ImageBackground>
      </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: moderateScale(15),
  },
  productImg: {
    width: scale(64),
    height: verticalScale(64),
    borderRadius: scale(8),
    marginRight: 14,
  },
  infoWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: Colors.light.background,
  },
  productVariant: {
    fontSize: moderateScale(13),
    color: Colors.light.background,
    fontWeight: '600',
    marginTop: 2,
  },
  productPack: {
    fontSize: moderateScale(12),
    color: Colors.light.background,
    marginTop: 2,
    opacity: 0.8,
  },
  productPrice: {
    fontSize: moderateScale(18),
    color: Colors.light.background,
    fontWeight: 'bold',
    marginTop: 6,
  },
  removeBtn: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  removeText: {
    color: Colors.light.background,
    fontWeight: 'bold',
    fontSize: moderateScale(15),
    backgroundColor: '#E53935',
    borderRadius: scale(8),
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    overflow: 'hidden',
  },
  separator: {
    height: 16,
  },
  addAllBtnWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    padding: 16,
    alignItems: 'center',
  },
  addAllBtn: {
    backgroundColor: '#E53935',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  addAllBtnText: {
    color: Colors.light.background,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    letterSpacing: 1,
  },
});

export default Wishlist;
   