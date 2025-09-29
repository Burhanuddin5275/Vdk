import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const WISHLIST_KEY = 'wishlistItems';

// Helper function to get wishlist key for specific user
const getUserWishlistKey = (userId?: string) => {
  return userId ? `${WISHLIST_KEY}_${userId}` : WISHLIST_KEY;
};

export interface WishlistItem {
  id: string;
  name: string;
  pack: string;
  regular_price?: number;
  sale_price?: number | string;
  image?: string;
  category?: string;
  variant?: {
    label: string;
    price: string | number;
    sale_price?: string | number;
  };
  price?: number;
  points?: number;
  stock?: number;
  user?: string;
}

interface WishlistState {
  wishlistItems: WishlistItem[];
  loadWishlist: (userId?: string) => Promise<void>;
  addToWishlist: (item: Omit<WishlistItem, 'quantity'>, userId?: string) => Promise<void>;
  removeFromWishlist: (id: string, userId?: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistItems: [],

  loadWishlist: async (userId?: string) => {
    try {
      const key = getUserWishlistKey(userId);
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        set({ wishlistItems: JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load wishlist', error);
    }
  },

  addToWishlist: async (item: WishlistItem, userId?: string) => {
    try {
      const key = getUserWishlistKey(userId);
      const { wishlistItems } = get();
      
      // Check if item already exists in wishlist
      if (wishlistItems.some(i => i.id === item.id)) {
        return; // Item already in wishlist
      }

      const updatedWishlist = [...wishlistItems, item];
      await AsyncStorage.setItem(key, JSON.stringify(updatedWishlist));
      set({ wishlistItems: updatedWishlist });
    } catch (error) {
      console.error('Failed to add to wishlist', error);
    }
  },

  removeFromWishlist: async (id: string, userId?: string) => {
    try {
      const key = getUserWishlistKey(userId);
      const { wishlistItems } = get();
      
      const updatedWishlist = wishlistItems.filter(item => item.id !== id);
      await AsyncStorage.setItem(key, JSON.stringify(updatedWishlist));
      set({ wishlistItems: updatedWishlist });
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  },

  isInWishlist: (id: string) => {
    return get().wishlistItems.some(item => item.id === id);
  },
}));

// Initialize the store when the app starts
const initializeWishlist = async (userId?: string) => {
  try {
    const key = getUserWishlistKey(userId);
    const saved = await AsyncStorage.getItem(key);
    if (!saved) {
      await AsyncStorage.setItem(key, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Failed to initialize wishlist', error);
  }
};

// Initialize with empty array if not exists
initializeWishlist();
