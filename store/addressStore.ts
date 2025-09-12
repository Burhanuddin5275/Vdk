import { create } from 'zustand';

export type Address = {
  id: string;
  label: string;
  desc: string;
  address: string;
  city: string;
  street: string;
  block: string;
  isDefault: boolean;
};

type AddressStore = {
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
};

export const useAddressStore = create<AddressStore>((set) => ({
  selectedAddress: null,
  setSelectedAddress: (address) => set({ selectedAddress: address }),
})); 