// Lightweight serverless proxy for Vercel. We avoid importing @vercel/node types
// to keep local TypeScript checks simple (they may not be installed).

// Serverless proxy for Generative AI calls.
// Usage: POST /api/gemini-proxy { prompt: string }
// Requires GEMINI_API_KEY to be set in Vercel's Environment Variables.

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server API key not configured (GEMINI_API_KEY)' });

  const { prompt, model } = req.body || {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Missing prompt in request body' });

  // Configurable endpoint - defaults to Google's generative AI REST endpoint pattern.
  const endpoint = process.env.GENAI_ENDPOINT || 'https://generativeai.googleapis.com/v1/models/text-bison-001:generate';

  try {
    const body = {
      // API bodies vary by provider; this minimal shape should work for Google's REST generate method
      input: prompt,
      // Optional model override
      ...(model ? { model } : {}),
    };

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'Upstream error', detail: text });
    }

    const data = await r.json();

    // Try common response shapes to extract text
    const text = data?.output?.[0]?.content?.[0]?.text || data?.candidates?.[0]?.content || data?.text || JSON.stringify(data);
    return res.status(200).json({ text });
  } catch (err: any) {
    console.error('Proxy error', err);
    return res.status(500).json({ error: 'Proxy failed', detail: String(err) });
  }
}
