import { Api_url } from "../url/url";
type ApiBrand = any;

export type BrandItem = {
  id: string;
  name: string;
  image: any;
  bg_color: string;
  position: number;
  is_active: boolean;
};

// Clean base URL (removes trailing slash if present to avoid double slashes)
const BASE_URL = Api_url.endsWith('/') ? Api_url.slice(0, -1) : Api_url;

function toBrand(item: ApiBrand): BrandItem {
  const id = String(item.id ?? "");
  const name = String(item.name ?? item.title ?? item.label ?? "Brand");
  
  // Handle image: Check if it's a relative path and prepend base URL if needed
  let rawImageUrl = item.image?.url ?? item.image ?? null;
  let imageUrl = null;
  
  if (rawImageUrl) {
    if (rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")) {
      imageUrl = rawImageUrl;
    } else {
      // Prepend Django server base URL for relative paths like "/media/..."
      imageUrl = `${BASE_URL}${rawImageUrl.startsWith("/") ? "" : "/"}${rawImageUrl}`;
    }
  }

  const image = imageUrl ? { uri: imageUrl } : null;
  const position = Number(item.position ?? 0);
  const is_active = Boolean(item.is_active);
  const bg_color = String(item.bg_color ?? "#FFFFFF");

  return { id, name, image, position, bg_color, is_active };
}

export async function fetchBrands(): Promise<BrandItem[]> {
  try {
    console.log("Attempting to fetch from:", `${Api_url}api/brands/`);
    const response = await fetch(`${Api_url}api/brands/`);
    const data = await response.json();
    console.log("Fetched brands data:", data);
    const items: ApiBrand[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toBrand).filter(Boolean);
  } catch (error) {
    console.error("CRITICAL fetchBrands error details:", error);
    return [];
  }
}