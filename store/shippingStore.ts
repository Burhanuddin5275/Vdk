import { create } from 'zustand';

export type ShippingOption = {
  id: string;
  label: string;
  desc: string;
  icon: string;
};

type ShippingStore = {
  selectedShipping: ShippingOption | null;
  setSelectedShipping: (shipping: ShippingOption) => void;
};

export const useShippingStore = create<ShippingStore>((set) => ({
  selectedShipping: null,
  setSelectedShipping: (shipping) => set({ selectedShipping: shipping }),
})); 