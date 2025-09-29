import {Api_url} from "../url/url";
type ApiRedeem = any;

export type RedeemItem = {
  id?: string | number;
  subtitle: string;
  title: string;
  description: string;
  points_required: number;
  image: any;
  imageKey?: string; // Add imageKey to the type
};

const API_URL = `${Api_url}api/redeems/`;

function toRedeem(item: ApiRedeem): RedeemItem {
  const subtitle = String(item.subtitle ?? item.title ?? item.label);
  const title = String(item.title ?? item.title ?? item.label);
  const description = String(item.description ?? item.title ?? item.label);
  const points_required = Number(item.points_required ?? item.title ?? item.label);
  const imageUrl = item.image?.url ?? item.image ?? null;
  const image = imageUrl ? { uri: String(imageUrl) } : null;
  // Extract the image key from the URL or use a default based on the title
  const imageKey = item.image_key || (imageUrl ? imageUrl.split('/').pop() : null);
  return { 
    id: item.id,
    subtitle, 
    title, 
    description, 
    points_required, 
    image,
    imageKey 
  };
}

export async function fetchRedeems(): Promise<RedeemItem[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch brands: ${response.status}`);
    const data = await response.json();
    const items: ApiRedeem[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toRedeem).filter(Boolean);
  } catch (error) {
    console.warn("fetchRedeems error:", error);
    return [];
  }
}


