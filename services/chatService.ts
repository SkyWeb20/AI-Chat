import { ApiMessage } from '../types';

const API_URL = "/api/chat"; // Point to our Vercel serverless function

export const fetchChatCompletionStream = async (
  messages: ApiMessage[],
  onChunk: (chunk: string) => void
): Promise<void> => {
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
      console.error("API Error:", errorData.error);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Response body is empty.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (error) {
    console.error("Error fetching AI completion stream:", error);
    throw new Error("Failed to get response from AI service.");
  }
};
