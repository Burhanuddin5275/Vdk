import { Api_url } from "@/url/url";

export const sendChatMessage = async (message: string, token: string) => {
  try {
    const res = await fetch(`${Api_url}/chat/api/send/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const response = await res.json();
    console.log(response);
    return response;
  } catch (error) {
    console.error("sendChatMessage error:", error);
    return [];
  }
}
export const getChatMessage = async (token: string) => {
  try {
    const res = await fetch(`${Api_url}chat/api/messages/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("chat", data);
    return data;
  } catch (error) {
    console.error("getChatMessage error:", error);
    return [];
  }
};