import { selectPhone } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { create } from 'zustand';
import { Colors } from '../constants/Colors';


export type WishlistItem = {
  id: string;
  name: string;
  pack?: string;
  price: number;
  image: any;
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
    set({ phone });
    const current = get().items;
    const updated = current.some(i => i.id === item.id) ? current : [...current, item];
    set({ items: updated });
    await AsyncStorage.setItem(`wishlistItems_${phone}`, JSON.stringify(updated));
  },
  removeFromWishlist: async (id) => {
    const phone = get().phone || '';
    if (!phone) return;
    set({ phone });
    const updated = get().items.filter(i => i.id !== id);
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
  const renderItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.productImg} resizeMode="cover" />
      <View style={styles.infoWrap}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPack}>{item.pack || 'Pack of 3'}</Text>
        <Text style={styles.productPrice}>Pkr {item.price.toLocaleString()}</Text>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={async () => await removeFromWishlist(item.id)}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <ImageBackground source={require('../assets/images/wishlist.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
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
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    color: Colors.light.background,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 12,
  },
  productImg: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 14,
  },
  infoWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.background,
  },
  productPack: {
    fontSize: 13,
    color: Colors.light.background,
    marginTop: 2,
  },
  productPrice: {
    fontSize: 18,
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
    fontSize: 15,
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default Wishlist;