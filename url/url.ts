let runtimeBaseUrl = "";

export const getBaseUrl = (): string => runtimeBaseUrl;

export let Api_url = "";
export let img_url = "";

export const setBaseUrl = (url?: string | null): void => {
  if (!url) return;
  runtimeBaseUrl = String(url).replace(/\/+$/, "");
  Api_url = `${runtimeBaseUrl}/`;
  img_url = runtimeBaseUrl;
};
