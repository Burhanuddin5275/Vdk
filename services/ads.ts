import { Api_url } from "../url/url";
type ApiAds = any;

export type AdsItem = {
  brand: string;
  category: string;
  image: any;
};

function toAds(item: ApiAds): AdsItem {
  const brand = String(item.brand ?? "Ads");
  const category = String(item.category ?? "Ads");
  const imageUrl = item.image?.url ?? item.image ?? item.icon ?? item.thumbnail ?? null;
  const image = imageUrl ? { uri: String(imageUrl) } : undefined;
  return { category, brand, image: image };
}

export async function fetchAds(): Promise<AdsItem[]> {
  try {
    const response = await fetch(`${Api_url}api/ads/`);
    if (!response.ok) throw new Error(`Failed to fetch banners: ${response.status}`);
    const data = await response.json();
    const items: ApiAds[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toAds).filter(Boolean);
  } catch (error) {
    console.warn("fetchBanners error:", error);
    return [];
  }
}


