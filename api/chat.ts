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
        stream: true, // Enable streaming
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json();
      console.error("OpenRouter API Error:", errorData);
      const errorMessage = errorData.error?.message || 'Failed to get response from AI service.';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: openRouterResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!openRouterResponse.body) {
        return new Response(JSON.stringify({ error: 'Upstream response has no body.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Pipe the streaming response from OpenRouter to our client
    const transformStream = new TransformStream({
        transform(chunk, controller) {
            const text = new TextDecoder().decode(chunk);
            // The format from openrouter is `data: {...}\n\n`
            const lines = text.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.substring(6).trim();
                    if (jsonStr === '[DONE]') {
                        // Signal end of stream if needed, but closing the controller is enough
                        continue;
                    }
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            controller.enqueue(new TextEncoder().encode(content));
                        }
                    } catch (e) {
                        // Incomplete JSON chunks are expected, so we can ignore parse errors
                    }
                }
            }
        }
    });
    
    return new Response(openRouterResponse.body.pipeThrough(transformStream), {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
