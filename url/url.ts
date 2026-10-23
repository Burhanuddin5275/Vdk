const FALLBACK_URL = "http://15.135.166.93:8000/";

let runtimeBaseUrl = FALLBACK_URL;

export let Api_url = `${FALLBACK_URL}/`;
export let img_url = FALLBACK_URL;

export const getBaseUrl = (): string => runtimeBaseUrl;

export const setBaseUrl = (url?: string | null): void => {
  const cleanUrl = url ? String(url).replace(/\/+$/, "") : FALLBACK_URL;
  runtimeBaseUrl = cleanUrl;
  Api_url = `${runtimeBaseUrl}/`;
  img_url = runtimeBaseUrl;
}; 

// Initialize with fallback immediately on load
setBaseUrl(FALLBACK_URL);