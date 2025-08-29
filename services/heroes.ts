type ApiHero = any;

export type HeroItem = {
  title: string;
  subtext:string;
  image: any;
};

const API_URL = "http://192.168.1.111:8000/api/heros/";

function toHero(item: ApiHero): HeroItem {
  const title = String(item.title ?? item.name ?? item.label ?? "Hero");
  const subtext = String(item.subtext ?? "Subtext");
  const imageUrl = item.image?.url ?? item.image ?? null;
  const image = imageUrl ? { uri: String(imageUrl) } : null;
  return { title, subtext, image };
}

export async function fetchHeroes(): Promise<HeroItem[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch heroes: ${response.status}`);
    const data = await response.json();
    const items: ApiHero[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toHero).filter(Boolean);
  } catch (error) {
    console.warn("fetchHeroes error:", error);
    return [];
  }
}


