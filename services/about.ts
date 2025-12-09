import {Api_url, img_url} from "../url/url";
type ApiAbout = any;

export type AboutItem = {
  id: string | number;
  title:string;
  text:string

};

const API_URL = `${Api_url}/api/about/`;

function toAbout(item: ApiAbout): AboutItem {
  const id = String(item.id ?? null);
  const title = String(item.title ?? null);
  const text = String(item.text ?? null);
  return { 
    id,
    title,
    text,
  };
} 

export async function fetchAbout(): Promise<AboutItem[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch about: ${response.status}`);
    const data = await response.json();
    const items: ApiAbout[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toAbout).filter(Boolean);
  } catch (error) {
    console.warn("fetchAbout error:", error);
    return [];
  }
}


