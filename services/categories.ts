import { Api_url } from "../url/url";
type ApiCategory = any;


export type CategoryItem = {
  label: string;
  image: any;
  bg_color: string;
  position: number;
  is_active: boolean;
};


function toCategory(item: ApiCategory): CategoryItem {
  const label = String(item.name ?? item.label ?? "Category");
  const imageUrl = item.image?.url ?? item.image ?? null;
  const image = imageUrl ? { uri: String(imageUrl) } : undefined;
  const position = Number(item.position);
  const is_active = item.is_active;
  const bg_color = item.bg_color;
  return { label, image: image, position, bg_color, is_active };
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const response = await fetch(`${Api_url}api/categories/`);
    if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);
    const data = await response.json();
    const items: ApiCategory[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toCategory).filter(Boolean);
  } catch (error) {
    console.warn("fetchCategories error:", error);
    return [];
  }
}


