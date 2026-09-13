// Vercel serverless — transcribes a photo/screenshot of a workout (a
// coach's handwritten notes, a whiteboard, a typed sheet) into plain text,
// for the Programme builder's "Import from Image" tab. The transcribed
// text lands in an editable box client-side before it's ever parsed into
// exercises — this route only does the reading step, not the structuring.
//
//   POST /api/programme/parse-image
//   headers: Authorization: Bearer <coach Supabase session token>
//   body: { image_base64: string, media_type: 'image/jpeg' | 'image/png' | 'image/webp' }

import { requireUser } from '../_lib/verifyUser.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL   = process.env.ANTHROPIC_REPORT_MODEL || 'claude-sonnet-5';
const MAX_OUTPUT_TOKENS = 1500;
const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' });
    return;
  }
  const user = await requireUser(req, res);
  if (!user) return;
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({
      ok: false,
      error: 'ANTHROPIC_API_KEY is not configured on the server. Add it to Vercel env vars.',
    });
    return;
  }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return; }

  const imageBase64 = String(body?.image_base64 || '');
  const mediaType   = String(body?.media_type || '');
  if (!imageBase64) { res.status(400).json({ ok: false, error: 'image_base64 is required' }); return; }
  if (!ALLOWED_MEDIA_TYPES.has(mediaType)) {
    res.status(400).json({ ok: false, error: `Unsupported image type: ${mediaType || '(none)'}` });
    return;
  }
  // Base64 inflates size by ~33% — 5MB source image is roughly 6.7MB here.
  if (imageBase64.length > 7_000_000) {
    res.status(400).json({ ok: false, error: 'Image is too large (max 5MB).' });
    return;
  }

  try {
    const ai = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      ANTHROPIC_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
            {
              type: 'text',
              text: 'Transcribe every word of the workout programme visible in this image exactly as written, preserving line breaks and order. It may be handwritten, a whiteboard photo, or a typed sheet. Return ONLY the transcribed text — no commentary, no headings you did not see, no markdown formatting.',
            },
          ],
        }],
      }),
    });

    if (!ai.ok) {
      const detail = await ai.text();
      console.error('[programme/parse-image] Anthropic call failed', ai.status, detail);
      let upstream = detail;
      try {
        const j = JSON.parse(detail);
        if (j?.error?.message) upstream = j.error.message;
      } catch (_) { /* leave as raw */ }
      res.status(502).json({ ok: false, error: `AI call failed (${ai.status}): ${String(upstream).slice(0, 240)}` });
      return;
    }

    const json = await ai.json();
    const text = json?.content?.find(c => c.type === 'text')?.text?.trim();

    if (!text) {
      res.status(502).json({ ok: false, error: 'Could not read any text from that image. Try a clearer photo, or type it instead.' });
      return;
    }

    res.status(200).json({ ok: true, text });
  } catch (e) {
    console.error('[programme/parse-image] handler crash', e);
    res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
}
