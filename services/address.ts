import { Api_url } from '../url/url';

export interface SaveAddressParams {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  userId: string;
  token: string;
}

export const saveUserAddress = async ({
  street,
  city,
  state,
  postalCode,
  country,
  userId,
  token,
}: SaveAddressParams): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const url = `${Api_url}api/app-user-address/${userId}/`;
    const formData = new FormData();

    const address = {
      street,
      city,
      state,
      postal_code: postalCode,
      country,
    };

    formData.append('addresses', JSON.stringify([address]));

    console.log('Sending form data with addresses:', {
      addresses: [address]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response error:', errorText);
      return { success: false, error: `HTTP error! status: ${response.status}` };
    }

    const responseData = await response.json();
    console.log('Response:', responseData);

    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error updating address:', error);
    return { success: false, error: 'Failed to update address. Please try again.' };
  }
};


