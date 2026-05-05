import {Api_url, img_url} from "../url/url";
type ApiTerms = any;

export type TermsItem = {
  id: string | number;
p_title:string;
p_text:string;
t_title:string;
t_text:string;
};


function toTerms(item: ApiTerms): TermsItem {
  const id = String(item.id ?? null);
  const p_title = String(item.p_title ?? null);
  const p_text = String(item.p_text ?? null);
  const t_title = String(item.t_title ?? null);
  const t_text = String(item.t_text ?? null);
  return { 
    id,
    p_title,
    p_text,
    t_title, 
    t_text,
  };
} 

export async function fetchTerms(): Promise<TermsItem[]> {
  try {
    const response = await fetch(`${Api_url}/api/privacy/`);
    if (!response.ok) throw new Error(`Failed to fetch terms: ${response.status}`);
    const data = await response.json();
    const items: ApiTerms[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toTerms).filter(Boolean);
  } catch (error) {
    console.warn("fetchTerms error:", error);
    return [];
  }
}


