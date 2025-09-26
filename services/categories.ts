import { Api_url } from "../url/url";
type ApiCategory = any;


export type CategoryItem = {
  label: string;
  image: any;
};

const API_URL = `${Api_url}api/categories/`;

function toCategory(item: ApiCategory): CategoryItem {
  const label = String(item.name ?? item.label ?? "Category");
  const imageUrl = item.image?.url ?? item.image ?? null;
  const image = imageUrl ? { uri: String(imageUrl) } : undefined;
  return { label, image: image ?? require("../assets/images/Devices.png") };
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);
    const data = await response.json();
    const items: ApiCategory[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toCategory).filter(Boolean);
  } catch (error) {
    console.warn("fetchCategories error:", error);
    return [];
  }
}


