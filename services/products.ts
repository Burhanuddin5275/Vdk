export type Product =
  | {
    id: string;
    name: string;
    brand: string;
    Category: string;
    img: any;
    pts: number;
    rating: number;
    regular_price: number;
    description?: string;
    ingredients?: string[];
  }
  | { banner: string };

const API_URL = "http://192.168.1.106:8000/api/products/";

type ApiProduct = any;

function toProduct(item: ApiProduct): Product {
  const id = String(item.id ?? item._id ?? Math.random().toString(36).slice(2));
  const name = item.name ?? item.title ?? "Product";
  const brand = item.brand ?? item.vendor ?? item.manufacturer ?? "Unknown";
  const Category = item.category ?? item.Category ?? item.type ?? "General";
  const imageUrl = item.image?.url ?? item.image ?? item.thumbnail ?? item.img ?? null;
  const img = imageUrl ? { uri: String(imageUrl) } : require("../assets/images/card.png");
  const rating = Number(item.rating ?? item.stars ?? 5);
  const pts = Number(item.pts ?? item.points ?? 29);
  const regular_price = Number(item.price ?? item.amount ?? 0);
  const sale_price = Number(item.sale_price ?? item.discounted_price ?? 0);
  const description = item.description ?? item.desc ?? undefined;
  const ingredients = item.ingredients ?? undefined;

  return {
    id,
    name,
    brand,
    Category,
    img,
    pts,
    rating,
   regular_price, // Use regular_price as price
    description,
    ingredients,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = await response.json();
    const items: ApiProduct[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toProduct).filter(Boolean);
  } catch (error) {
    console.warn("fetchProducts error:", error);
    return [];
  }
}




