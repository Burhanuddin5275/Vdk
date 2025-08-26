type ApiBrand = any;

export type BrandItem = {
  name: string;
  image: any;
};

const API_URL = "http://192.168.1.109:8000/api/brands/";

function toBrand(item: ApiBrand): BrandItem {
  const name = String(item.name ?? item.title ?? item.label ?? "Brand");
  const imageUrl = item.image?.url ?? item.image ?? null;
  const image = imageUrl ? { uri: String(imageUrl) } : null;
  return { name, image };
}

export async function fetchBrands(): Promise<BrandItem[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch brands: ${response.status}`);
    const data = await response.json();
    const items: ApiBrand[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toBrand).filter(Boolean);
  } catch (error) {
    console.warn("fetchBrands error:", error);
    return [];
  }
}


