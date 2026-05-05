import { Api_url } from "@/url/url";

export type DiscountPopupItem = {
  id: number;
  banner: string;
  products: number[];
  brand: number;
  category: number;
  is_active: boolean;
};

export const fetchDiscountPopup = async (): Promise<DiscountPopupItem[]> => {
  try {
    const res = await fetch(`${Api_url}/api/discount-popup/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("fetchDiscountPopup error:", error);
    return [];
  }
};