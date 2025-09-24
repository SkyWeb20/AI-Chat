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

    // A more robust SSE parser using a TransformStream with buffering
    let buffer = '';
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        buffer += new TextDecoder().decode(chunk);

        // Process all complete messages in the buffer
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const message = buffer.substring(0, boundary);
          buffer = buffer.substring(boundary + 2); // Keep the rest for the next chunk

          if (message.startsWith('data: ')) {
            const jsonStr = message.substring(6).trim();
            if (jsonStr === '[DONE]') {
              continue; 
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            } catch (e) {
              console.error('Failed to parse SSE JSON chunk:', jsonStr, e);
            }
          }
          boundary = buffer.indexOf('\n\n');
        }
      },
      flush(controller) {
        // When the stream is closed, try to process any remaining data in the buffer.
        if (buffer.length > 0) {
           console.log("Flushing remaining buffer:", buffer);
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
