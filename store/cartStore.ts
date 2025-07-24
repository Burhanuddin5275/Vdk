import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const CART_KEY = 'cartItems';

interface CartItem {
  id: string;
  name: string;
  pack: string;
  price: number;
  points: number;
  quantity: number;
  image: any;
  user?: string;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  updateQuantity: (id: string, change: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  loadCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  loadCart: async () => {
    const stored = await AsyncStorage.getItem(CART_KEY);
    if (stored) set({ cartItems: JSON.parse(stored) });
  },
  addToCart: async (item) => {
    const updated = [...get().cartItems, item];
    set({ cartItems: updated });
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(updated));
  },
  updateQuantity: async (id, change) => {
    const updated = get().cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    );
    set({ cartItems: updated });
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(updated));
  },
  removeItem: async (id) => {
    const updated = get().cartItems.filter(item => item.id !== id);
    set({ cartItems: updated });
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(updated));
  },
})); 