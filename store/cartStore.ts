import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const CART_KEY = 'cartItems';

// Helper function to get cart key for specific user
const getUserCartKey = (userId?: string) => {
  return userId ? `${CART_KEY}_${userId}` : CART_KEY;
};

interface CartItem {
  id: string;
  name: string;
  pack: string;
  price: number;
  sale_price?: number;
  points: number;
  quantity: number;
  image: any;
  user?: string;
  variant?: {
    price: number;
    sale_price?: number;
  };
}

export type { CartItem };

interface CartState {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  updateQuantity: (id: string, change: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  loadCart: (userId?: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  loadCart: async (userId?: string) => {
    const userCartKey = getUserCartKey(userId);
    const stored = await AsyncStorage.getItem(userCartKey);
    if (stored) set({ cartItems: JSON.parse(stored) });
  },
  addToCart: async (item, userId?: string) => {
    // Create a unique key based on product ID and variant (if exists)
    const getItemKey = (i: CartItem) => {
      return i.variant ? `${i.id}-${JSON.stringify(i.variant)}` : i.id;
    };

    const itemKey = getItemKey(item);
    const existingIndex = get().cartItems.findIndex(cartItem => getItemKey(cartItem) === itemKey);
    
    let updated;
    if (existingIndex >= 0) {
      // If same product with same variant exists, update quantity
      updated = [...get().cartItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + (item.quantity || 1)
      };
    } else {
      // If new item or different variant, add as new item
      updated = [...get().cartItems, { ...item, quantity: item.quantity || 1 }];
    }
    
    const userCartKey = getUserCartKey(userId);
    set({ cartItems: updated });
    await AsyncStorage.setItem(userCartKey, JSON.stringify(updated));
  },
  updateQuantity: async (id, change, userId?: string) => {
    const itemToUpdate = get().cartItems.find(item => item.id === id);
    
    if (!itemToUpdate) return; // Item not found
    
    const updated = get().cartItems.map(item => {
      // Match by both ID and variant (if exists)
      const itemVariant = JSON.stringify(item.variant || {});
      const targetVariant = JSON.stringify(itemToUpdate.variant || {});
      
      if (item.id === id && itemVariant === targetVariant) {
        return { ...item, quantity: Math.max(1, item.quantity + change) };
      }
      return item;
    });
    
    const userCartKey = getUserCartKey(userId);
    set({ cartItems: updated });
    await AsyncStorage.setItem(userCartKey, JSON.stringify(updated));
  },
  removeItem: async (id, userId?: string) => {
    // Check if the ID contains variant information (format: 'id-{variantInfo}')
    const itemToRemove = get().cartItems.find(item => item.id === id);
    
    if (!itemToRemove) {
      // If no exact match, try to find by base ID (for backward compatibility)
      const updated = get().cartItems.filter(item => item.id !== id);
      set({ cartItems: updated });
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(updated));
      return;
    }
    
    // If we have a variant, make sure we only remove the exact variant
    const updated = get().cartItems.filter(item => {
      if (item.id !== id) return true; // Keep items with different IDs
      
      // For items with the same ID, compare variants
      const itemVariant = JSON.stringify(item.variant || {});
      const removeVariant = JSON.stringify(itemToRemove.variant || {});
      return itemVariant !== removeVariant;
    });
    
    const userCartKey = getUserCartKey(userId);
    set({ cartItems: updated });
    await AsyncStorage.setItem(userCartKey, JSON.stringify(updated));
  },
})); 