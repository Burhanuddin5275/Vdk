import { Api_url } from "../url/url";
type ApiBrand = any;

export type BrandItem = {
  name: string;
  image: any;
  bg_color: string;
  position: number;
  is_active: boolean;
};

function toBrand(item: ApiBrand): BrandItem {
  const name = String(item.name ?? item.title ?? item.label ?? "Brand");
  const imageUrl = item.image?.url ?? item.image ?? null;
  const image = imageUrl ? { uri: String(imageUrl) } : null;
  const position = Number(item.position);
  const is_active = item.is_active;
  const bg_color = item.bg_color;
  return { name, image, position, bg_color, is_active };
}

export async function fetchBrands(): Promise<BrandItem[]> {
  try {
    const response = await fetch(`${Api_url}api/brands/`);
    if (!response.ok) throw new Error(`Failed to fetch brands: ${response.status}`);
    const data = await response.json();
    const items: ApiBrand[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toBrand).filter(Boolean);
  } catch (error) {
    console.warn("fetchBrands error:", error);
    return [];
  }
}


