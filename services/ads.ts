type ApiAds = any;

export type AdsItem = {
  brand: string;
  category: string;
  image: any;
};

const API_URL = "http://192.168.1.111:8000/api/ads/";

function toAds(item: ApiAds): AdsItem {
  const brand = String(item.brand ?? "Ads");
  const category = String(item.category ?? "Ads");
  const imageUrl = item.image?.url ?? item.image ?? item.icon ?? item.thumbnail ?? null;
  const image = imageUrl ? { uri: String(imageUrl) } : undefined;
  return { category, brand, image: image ?? require("../assets/images/Devices.png") };
}

export async function fetchAds(): Promise<AdsItem[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch banners: ${response.status}`);
    const data = await response.json();
    const items: ApiAds[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toAds).filter(Boolean);
  } catch (error) {
    console.warn("fetchBanners error:", error);
    return [];
  }
}


