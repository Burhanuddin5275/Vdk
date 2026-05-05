import {Api_url} from "../url/url";
type ApiRedeem = any;

export type RedeemItem = {
  id?: string | number;
  subtitle: string;
  title: string;
  description: string;
  points_required: number;
  image: any;
  imageKey?: string; // Add imageKey to the type
};

function toRedeem(item: ApiRedeem): RedeemItem {
  const subtitle = String(item.subtitle ?? item.title ?? item.label);
  const title = String(item.title ?? item.title ?? item.label);
  const description = String(item.description ?? item.title ?? item.label);
  const points_required = Number(item.points_required ?? item.title ?? item.label);
  const imageUrl = item.image?.url ?? item.image ?? null;
  const image = imageUrl ? { uri: String(imageUrl) } : null;
  // Extract the image key from the URL or use a default based on the title
  const imageKey = item.image_key || (imageUrl ? imageUrl.split('/').pop() : null);
  return { 
    id: item.id,
    subtitle, 
    title, 
    description, 
    points_required, 
    image,
    imageKey 
  };
}

export async function fetchRedeems(): Promise<RedeemItem[]> {
  try {
    const response = await fetch(`${Api_url}api/redeems/`);
    if (!response.ok) throw new Error(`Failed to fetch brands: ${response.status}`);
    const data = await response.json();
    const items: ApiRedeem[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toRedeem).filter(Boolean);
  } catch (error) {
    console.warn("fetchRedeems error:", error);
    return [];
  }
}


export type RedeemOrderPayload = {
  user_id: string | null;
  user_detail: {
    number: string | null;
  };
  address: any;
  shipping: any;
  status: string;
  product: {
    name?: string;
    image?: string;
    description?: string;
    pts?: number; 
  }[];
  created_at: string;
};

export const createRedeemOrder = async (
  token: string,
  orderData: RedeemOrderPayload
) => {   
  const API_URL = `${Api_url}api/create-order/`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Invalid server response: ${text.substring(0, 150)}`);
    }

    if (!response.ok) {
      throw new Error(data?.message || "Order creation failed");
    }

    return data;
  } catch (error: any) {
    console.error("Redeem API Error:", error);
    throw new Error(error.message || "Something went wrong");
  }
}; 


