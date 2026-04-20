import { Api_url, img_url } from "../url/url";
type ApiUser = any;
export const registerUser = async ({
  number,
  temp_token,
  name,
  email,
  password,
}: {
  number: string;
  temp_token: string;
  name?: string;
  email?: string;
  password?: string;
}) => {
  try {
    const response = await fetch(`${Api_url}/api/complete_profile/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ number, temp_token, name, email, password }),
    });

    const data = await response.json().catch(() => ({}));



    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create account.');
  }
};

export type UserItem = {
  id: string | number;
  name: string;
  number: string;
  image_url: any;
  image: any;
  total_points: number;
  point_value: number;
  addresses?: any[];
};

const API_URL = `${Api_url}api/app-user/list/`;

function toUser(item: ApiUser): UserItem {
  const id = String(item.id ?? null);
  const name = String(item.name ?? item.title ?? null);
  const number = String(item.number ?? null);
  const total_points = Number(item.points ?? null);
  const point_value = Number(item.point_value ?? null);
  const image_url = { uri: `${img_url}${item.image}` };
  const image = { uri: `${item.image}` };
  const addresses = item.addresses?.map((addr: any) => ({
    id: String(addr.id ?? null),
    street: String(addr.street ?? null),
    city: String(addr.city ?? null),
    state: String(addr.state ?? null),
    postal_code: String(addr.postal_code ?? null),
    country: String(addr.country ?? null),
  }));
  return {
    id,
    name,
    number,
    image_url,
    image,
    total_points,
    point_value,
    addresses,
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

export const deleteAccountApi = async (userId: string | number) => {
  if (userId === null || userId === undefined) {
    throw new Error("Missing user ID");
  }
  const url = `${Api_url}/api/deactivate/${userId}/`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_active: false }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete account");
  }

  return true;
};
// Update user profile or password
export const updateUserProfile = async (
  token: string,
  userId: string,
  data: { name?: string; image?: any; password?: string }
) => {
  if (data.password) {
    // Update password using JSON
    const response = await fetch(`${Api_url}api/update-user/${userId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ password: data.password }),
    });
    return response;
  }

  // Update profile (name + image) using FormData
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.image) {
    formData.append('image', {
      uri: data.image,
      name: 'profile.jpg',
      type: 'image/jpeg',
    } as any);
  }

  const response = await fetch(`${Api_url}api/update-user/${userId}/`, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: formData,
  });

  return response;
};

export const ResetPassword = async ({
  number,
  otp,
  new_password
}:{number:string, otp:string, new_password:string}) => {
  try {
    const res = await fetch(`${Api_url}/api/reset-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ number, otp, new_password }),
    });

    const response = await res.json().catch(() => ({}));

    return response;
  } catch (error:any) {
    throw new Error(error.message || 'Failed to create account.');
  }
};
export const otpVerify = async ({
  number,
  otp,
}:{number:string, otp:string}) => {
  try {
    const res = await fetch(`${Api_url}/api/app-users/verify-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ number, otp }),
    });
    const response = await res.json().catch(() => ({}));
    return response;
  } catch (error:any) {
    throw new Error(error.message || 'Failed to register user.');
  }
};
export const numberVerify = async ({
  number,
}:{number:string}) => {
  try {
    const res = await fetch(`${Api_url}/api/app-users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ number }),
    });
    const response= await res.json().catch(() => ({}));
    return response;
  } catch (error:any) {
    throw new Error(error.message || 'Failed to register user.');
  }
};
export const Forgetpassword = async ({
  number,
}:{number:string}) => {
  try {
    const res = await fetch(`${Api_url}/api/forgot-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ number }),
    });
    const response = await res.json().catch(() => ({}));
    return response;
  } catch (error:any) {
    throw new Error(error.message || 'Failed to register user.');
  }
};


