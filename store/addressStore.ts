import { create } from 'zustand';

export type Address = {
  id: string;
  country: string;
  state: string;
  postal_code: string;
  city: string;
  street: string;
  block: string;
};

type AddressStore = {
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
};

export const useAddressStore = create<AddressStore>((set) => ({
  selectedAddress: null,
  setSelectedAddress: (address) => set({ selectedAddress: address }),
})); 