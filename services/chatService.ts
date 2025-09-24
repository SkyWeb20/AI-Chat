import { ApiMessage } from '../types';

const API_URL = "/api/chat"; // Point to our new Vercel serverless function

export const fetchChatCompletion = async (messages: ApiMessage[]): Promise<string> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // The backend now returns a JSON object with an `error` key
      console.error("API Error:", data.error);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // Our backend returns an object like { content: "..." }
    return data.content;
  } catch (error) {
    console.error("Error fetching AI completion:", error);
    // Re-throw a more generic error to be handled by the UI
    throw new Error("Failed to get response from AI service.");
  }
};
