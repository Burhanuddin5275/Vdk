import axios from "axios";
import { Api_url } from "../url/url";
export type OrderStatus = 'pending' | 'process' | 'on_the_way' | 'delivered' | 'cancelled';

export type orders = {
  id: string;
  address: string;
  shipping: string;
  status: OrderStatus;
  type: string;
  user_detail: string;
  items: any[];
  payments: any[];
  points_discount: number;
  discount_amount: number;
  total_amount: number;
  created_at?: string;
}

type ApiOrders = any;

function toProduct(item: ApiOrders): orders {
  const id = String(item.id ?? item._id ?? Math.random().toString(36).slice(2));
  const address = item.address ?? item.address ?? "Product";
  const shipping = item.shipping ?? item.shipping ?? "Unknown";
  const user_detail = item.user_detail ?? item.user_detail ?? "Product";
  const type = item.type ?? item.type ?? "Product";
  const statusValue = item.status ? String(item.status).toLowerCase() : '';
  const status: OrderStatus = (['pending', 'process', 'on_the_way', 'delivered', 'cancelled'].includes(statusValue))
    ? statusValue as OrderStatus
    : 'pending';
  const items = item.items ?? item.items ?? [];
  const payments = item.payments ?? item.payments ?? [];  
  const points_discount = item.points_discount;
  const discount_amount = item.discount_amount;
  const total_amount = item.total_amount; 
  const created_at = item.created_at ?? new Date().toISOString();

  return {
    id,
    address,
    shipping,
    status,
    user_detail,
    items,
    type,
    payments,
    points_discount,
    discount_amount,
    total_amount,
    created_at,
  };
}

export async function fetchOrders(phone?: string): Promise<orders[]> {
  try {

    const response = await fetch(`${Api_url}api/orders/`);
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
// api/createOrder.ts
export const createOrderApi = async (orderData: any, token: string) => {
  const response = await fetch(`${Api_url}api/create-order/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const responseText = await response.text();
  console.log("Raw response text:", responseText);

  let responseData;

  try {
    responseData = responseText ? JSON.parse(responseText) : {};
  } catch (jsonError) {
    throw new Error(
      `Invalid response from server: ${responseText.substring(0, 200)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      responseData.message ||
      `Server error: ${response.status} ${response.statusText}`
    );
  }

  return responseData;
};

export interface CancelOrderResponse {
  message?: string;
  detail?: string;
  status?: string;
  [key: string]: any;
}

export const cancelOrder = async (orderId: string): Promise<CancelOrderResponse> => {
  console.log("Cancelling order at:", `${Api_url}api/update-order-status/${orderId}/`);

  const response = await fetch(`${Api_url}api/update-order-status/${orderId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "cancelled" }),
  });

  const text = await response.text();
  console.log("Cancel response:", text);

  let data: CancelOrderResponse = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    console.log("Response not JSON");
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.detail ||
      `Failed with status code ${response.status}`
    );
  }

  return data; // success
};

export const createReview = async (reviewData: {
  item: number;
  user: number;
  rating: number;
  comment: string;
}) => {
  try {
    const res = await fetch(`${Api_url}/api/create-review/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    const response = await res.json();
    return response;
  } catch (error: any) {
    console.log('AXIOS REVIEW ERROR:', error?.response?.data || error.message);
    throw error;
  }
};