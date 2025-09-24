// This file should be placed in the `api` directory at the root of your project.
// e.g., /api/chat.ts
// Vercel will automatically turn this into a serverless function accessible at /api/chat.

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.API_KEY;
const MODEL = "deepseek/deepseek-chat-v3.1:free";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'Server configuration error: API key not set.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages) {
      return new Response(JSON.stringify({ error: 'Missing "messages" in request body.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const openRouterResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get('referer') || "https://react-chat-app.ai",
        "X-Title": "React AI Chat",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
      }),
    });

    const data = await openRouterResponse.json();

    if (!openRouterResponse.ok) {
      console.error("OpenRouter API Error:", data);
      const errorMessage = data.error?.message || 'Failed to get response from AI service.';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: openRouterResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const content = data.choices[0].message.content;
    
    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
