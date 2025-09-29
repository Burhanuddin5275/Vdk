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
  stock: number;
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
  addToCart: (item: CartItem, userId?: string) => Promise<void>;
  updateQuantity: (id: string, change: number, userId?: string, variant?: { price: number; sale_price?: number }) => Promise<void>;
  removeItem: (id: string, userId?: string, variant?: { price: number; sale_price?: number }) => Promise<void>;
  loadCart: (userId?: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  loadCart: async (userId?: string) => {
    const userCartKey = getUserCartKey(userId);
    const stored = await AsyncStorage.getItem(userCartKey);
    if (stored) set({ cartItems: JSON.parse(stored) });
  },
  addToCart: async (item: CartItem, userId?: string) => {
    // Create a unique key based on product ID and variant (if exists)
    const getItemKey = (i: CartItem) => {
      return i.variant ? `${i.id}-${JSON.stringify(i.variant)}` : i.id;
    };

    const itemKey = getItemKey(item);
    const existingIndex = get().cartItems.findIndex(cartItem => getItemKey(cartItem) === itemKey);
    
    let updated;
    if (existingIndex >= 0) {
      // If same product with same variant exists, check stock before updating quantity
      const existingItem = get().cartItems[existingIndex];
      const newQuantity = existingItem.quantity + (item.quantity || 1);
      
      // Check if stock is defined and if adding would exceed available stock
      if (existingItem.stock !== null && newQuantity > existingItem.stock) {
        throw new Error('Cannot add more items. Quantity exceeds available stock.');
      }
      
      updated = [...get().cartItems];
      updated[existingIndex] = {
        ...existingItem,
        quantity: newQuantity
      };
    } else {
      // For new items, check if quantity doesn't exceed stock
      const quantityToAdd = item.quantity || 1;
      if (item.stock !== null && quantityToAdd > item.stock) {
        throw new Error('Cannot add more items than available in stock.');
      }
      
      // If new item or different variant, add as new item
      updated = [...get().cartItems, { ...item, quantity: quantityToAdd }];
    }
    
    const userCartKey = getUserCartKey(userId);
    set({ cartItems: updated });
    await AsyncStorage.setItem(userCartKey, JSON.stringify(updated));
  },
  updateQuantity: async (id: string, change: number, userId?: string, variant?: { price: number; sale_price?: number }) => {
    // Create a unique key for the item being updated
    const getItemKey = (i: CartItem) => {
      return i.variant ? `${i.id}-${JSON.stringify(i.variant)}` : i.id;
    };
    
    // Find the exact item to update using both ID and variant
    const itemToUpdate = get().cartItems.find(item => {
      // If variant is provided, match both ID and variant
      if (variant) {
        return item.id === id && JSON.stringify(item.variant || {}) === JSON.stringify(variant);
      }
      // Otherwise, just match by ID (for backward compatibility)
      return item.id === id;
    });
    
    if (!itemToUpdate) return; // Item not found
    
    const targetKey = getItemKey(itemToUpdate);
    
    // Update only the specific item that matches both ID and variant
    const updated = get().cartItems.map(item => {
      const itemKey = getItemKey(item);
      if (itemKey === targetKey) {
        return { ...item, quantity: Math.max(1, item.quantity + change) };
      }
      return item;
    });
    
    const userCartKey = getUserCartKey(userId);
    set({ cartItems: updated });
    await AsyncStorage.setItem(userCartKey, JSON.stringify(updated));
  },
  removeItem: async (id: string, userId?: string, variant?: { price: number; sale_price?: number }) => {
    // Create a unique key for the item being removed
    const getItemKey = (i: CartItem) => {
      return i.variant ? `${i.id}-${JSON.stringify(i.variant)}` : i.id;
    };
    
    // Find the exact item to remove using both ID and variant
    const itemToRemove = get().cartItems.find(item => {
      // If variant is provided, match both ID and variant
      if (variant) {
        return item.id === id && JSON.stringify(item.variant || {}) === JSON.stringify(variant);
      }
      // Otherwise, just match by ID (for backward compatibility)
      return item.id === id;
    });
    
    if (!itemToRemove) return; // Item not found
    
    const targetKey = getItemKey(itemToRemove);
    
    // Remove only the specific item that matches both ID and variant
    const updated = get().cartItems.filter(item => {
      const itemKey = getItemKey(item);
      return itemKey !== targetKey;
    });
    
    const userCartKey = getUserCartKey(userId);
    set({ cartItems: updated });
    await AsyncStorage.setItem(userCartKey, JSON.stringify(updated));
  }
})); 