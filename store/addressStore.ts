import { create } from 'zustand';

export type Address = {
  label: string;
  desc: string;
};

type AddressStore = {
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address) => void;
};

export const useAddressStore = create<AddressStore>((set) => ({
  selectedAddress: null,
  setSelectedAddress: (address) => set({ selectedAddress: address }),
})); 