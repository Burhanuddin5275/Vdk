import { Api_url } from "../url/url";
type ApiBanner = any;

export type BannerItem = {
  brand: string;
  category: string;
  image: any;
};

const API_URL = `${Api_url}api/banners/`;

function toBanner(item: ApiBanner): BannerItem {
  const brand = String(item.brand ?? "Banner");
  const category = String(item.category ?? "Banner");
  const imageUrl = item.image?.url ?? item.image ?? item.icon ?? item.thumbnail ?? null;
  const image = imageUrl ? { uri: String(imageUrl) } : undefined;
  return { category, brand, image: image ?? require("../assets/images/Devices.png") };
}

export async function fetchBanners(): Promise<BannerItem[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch banners: ${response.status}`);
    const data = await response.json();
    const items: ApiBanner[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toBanner).filter(Boolean);
  } catch (error) {
    console.warn("fetchBanners error:", error);
    return [];
  }
}


