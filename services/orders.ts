export type OrderStatus = 'pending' | 'process' | 'Shipped' | 'delivered' | 'cancelled';

export type orders = {
  id: string; 
  address: string;
  shipping: string;
  status: OrderStatus;
  user_detail:string;
  items: any[];
  payments: any[];
  created_at?: string;
}
  

const API_URL = "http://192.168.1.111:8000/api/orders/";

type ApiOrders = any;

function toProduct(item: ApiOrders): orders {
  const id = String(item.id ?? item._id ?? Math.random().toString(36).slice(2));
  const address = item.address ?? item.address ?? "Product";
  const shipping = item.shipping ?? item.shipping ?? "Unknown";
const user_detail = item.user_detail ?? item.user_detail ?? "Product";
  const statusValue = item.status ? String(item.status).toLowerCase() : '';
  const status: OrderStatus = (['pending', 'process', 'shipped', 'delivered', 'cancelled'].includes(statusValue))
    ? statusValue as OrderStatus
    : 'pending';
  const items = item.items ?? item.items ?? [];
  const payments = item.payments ?? item.payments ?? [];
  const created_at = item.created_at ?? new Date().toISOString();

  return {
    id,
    address,
    shipping,
    status,
    user_detail,
    items,
    payments,
    created_at,
  };
}

export async function fetchOrders(phone?: string): Promise<orders[]> {
  try {
    // Add phone number as a query parameter if provided
    const url = phone ? `${API_URL}?phone=${encodeURIComponent(phone)}` : API_URL;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }
    const data = await response.json();
    const items: ApiOrders[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toProduct).filter(Boolean);
  } catch (error) {
    console.warn("fetchOrders error:", error);
    return [];
  }
}




