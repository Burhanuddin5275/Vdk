import { Api_url } from "../url/url";
export type Product =
  | {
    id: string;
    name: string;
    brand: string;
    Category: string;
    img: any;
    pts: number;
    position: number;
    rating: number;
    regular_price: number;
    quantity: number;
    is_active: boolean;
    stock: number;
    sale_price: number;
    cost_price?: number;
    description?: string;
    stock_status?: string;
    gallery_images?: any[];
    reviews?: any[];
    avg_rating?: number       // ✅ ADD
    total_reviews?: number
    variants?: {
  id: number;
  sku: string;
  price: string;
  stock: number;
  attributes: {
    points?: string;
    description?: string;
    [key: string]: any;
  };
  is_active: boolean;
  image: string;
}[];
  }
  
  | { banner: string };

type ApiProduct = any;

function toProduct(item: ApiProduct): Product {
  const id = String(item.id ?? item._id ?? Math.random().toString(36).slice(2));
  const name = item.name ?? item.title ?? "Product";
  const brand = item.brand ?? item.vendor ?? item.manufacturer ?? "Unknown";
  const Category = item.category ?? item.Category ?? item.type ?? "General";
  const imageUrl = item.image?.url ?? item.image ?? item.thumbnail ?? item.img ?? null;
  const img = imageUrl ? { uri: String(imageUrl) } : null;
  const rating = Number(item.rating ?? item.stars ?? 5);
  const quantity = Number(item.quantity ?? null);
  const stock = Number(item.stock ?? item.quantity ?? 0);
  const pts = Number(item.pts ?? item.points);
  const position = Number(item.position);
  const regular_price = Number(item.regular_price ?? item.amount ?? 0);
  const cost_price = Number(item.cost_price ?? item.cost ?? 0);
  const sale_price = Number(item.sale_price ?? item.discounted_price ?? 0);
  const description = item.description ?? item.desc ?? undefined;
  const is_active = item.is_active;
  const stock_status = item.stock_status ?? undefined;
  const avg_rating = Number(item.avg_rating ?? 0);
  const total_reviews = Number(item.total_reviews ?? 0);
  const gallery_images = item.gallery_images ?? [];
  const variants = item.variant ?? item.variants ?? [];
  const reviews = item.reviews ?? [];

  return {
    id,
    name,
    brand,
    Category,
    img,
    pts,
    position,
    stock,
    cost_price,
    rating,
    quantity,
    regular_price,
    sale_price,
    description,
    is_active,
    gallery_images,
    variants,
    reviews,
    avg_rating,        // ✅ ADD
    total_reviews,
    stock_status
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${Api_url}api/products/`);
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




