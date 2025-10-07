import {Api_url, img_url} from "../url/url";
type ApiUser = any;

export type UserItem = {
  id: string | number;
  name: string;
  number: string;
  image_url: any;
  image: any;
  total_points:number;
};

const API_URL = `${Api_url}api/app-user/list/`;

function toUser(item: ApiUser): UserItem {
  const id = String(item.id ?? null);
  const name = String(item.name ?? item.title ?? null);
  const number = String(item.number ?? null);
  const total_points = Number(item.total_points ?? null);
  const image_url = { uri:`${img_url}${item.image}` };
  const image = { uri:`${item.image}` };
  return { 
    id,
    name,
    number,
    image_url,
    image,
    total_points,
  };
}

export async function fetchUsers(): Promise<UserItem[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch brands: ${response.status}`);
    const data = await response.json();
    const items: ApiUser[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toUser).filter(Boolean);
  } catch (error) {
    console.warn("fetchUsers error:", error);
    return [];
  }
}


