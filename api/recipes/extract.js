// Vercel serverless — extract structured recipes from arbitrary PDF
// text using Anthropic's Claude API. The client extracts the text
// client-side with pdfjs (already a dep) and POSTs it here; we ask
// Claude to return a JSON array of recipes the coach can tick and
// import in bulk.
//
//   POST /api/recipes/extract
//   body: { text: '...full pdf text...', max_recipes?: 30 }
//
//   success: { ok: true, recipes: [{ title, meal_type, description,
//                                     ingredients[], instructions[],
//                                     prep_time_min, cook_time_min,
//                                     servings, tags[] }, ...] }
//   failure: { ok: false, error: 'human message' }
//
// Setup: add ANTHROPIC_API_KEY to Vercel project env vars. Without
// it the route 503s with a clear "missing key" message so the UI
// can guide the coach.

const ANTHROPIC_API_URL  = 'https://api.anthropic.com/v1/messages';
// Current Sonnet model — override per-deploy via ANTHROPIC_RECIPE_MODEL.
// Earlier versions of this file pinned claude-3-5-sonnet-20241022, which
// Anthropic later retired, causing the /v1/messages route to return 404.
const ANTHROPIC_MODEL    = process.env.ANTHROPIC_RECIPE_MODEL || 'claude-sonnet-4-5';
const MAX_INPUT_CHARS    = 150_000;   // budget; truncate larger PDFs

const SYSTEM_PROMPT = `You read pages of recipe content (cookbook scans, handouts, sports
nutrition PDFs) and return them as a clean JSON array. Be conservative:
only emit a recipe when the source clearly contains a title plus
ingredients and steps — don't pad with introductions, blurbs, or
headings that aren't real recipes.

Return strict JSON with shape:
{
  "recipes": [
    {
      "title": string,
      "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
      "description": string,          // 1-2 sentence summary
      "ingredients": string[],         // one item per array entry
      "instructions": string[],        // one step per array entry
      "prep_time_min": number | null,
      "cook_time_min": number | null,
      "servings": number | null,
      "tags": string[]                 // e.g. ["high-protein","quick"]
    }
  ]
}

Rules:
  - Infer meal_type from context. If the section says "Snacks", set
    meal_type to "snack" for every recipe under it.
  - Always use lowercase meal_type.
  - Don't invent times or servings — leave as null when not stated.
  - Tags should be short (1-3 words), lowercase, hyphenated.
  - Output ONLY the JSON object, no commentary.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' });
    return;
  }
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

  let text = String(body?.text || '');
  if (!text.trim()) {
    res.status(400).json({ ok: false, error: 'Empty PDF text' });
    return;
  }
  if (text.length > MAX_INPUT_CHARS) text = text.slice(0, MAX_INPUT_CHARS);

  const maxRecipes = Math.max(1, Math.min(50, Number(body?.max_recipes) || 30));

  try {
    const ai = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:       ANTHROPIC_MODEL,
        max_tokens:  4096,
        system:      SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract up to ${maxRecipes} recipes from this PDF text and return strict JSON.\n\nPDF TEXT:\n${text}`,
              },
            ],
          },
        ],
      }),
    });

    if (!ai.ok) {
      const detail = await ai.text();
      console.error('[recipes/extract] Anthropic call failed', ai.status, detail);
      // Try to pull a human message out of the upstream error envelope
      // so the UI can show "model not_found" instead of "(404)".
      let upstream = detail;
      try {
        const j = JSON.parse(detail);
        if (j?.error?.message) upstream = j.error.message;
      } catch (_) { /* leave as raw */ }
      res.status(502).json({
        ok: false,
        error: `AI call failed (${ai.status}): ${String(upstream).slice(0, 240)}`,
      });
      return;
    }

    const json = await ai.json();
    const raw  = json?.content?.[0]?.text || '';
    const parsed = safeParseJson(raw);
    if (!parsed || !Array.isArray(parsed.recipes)) {
      res.status(502).json({
        ok: false,
        error: 'AI returned unparseable output. Try a different PDF.',
        rawSnippet: raw.slice(0, 400),
      });
      return;
    }

    const cleaned = parsed.recipes
      .map(normaliseRecipe)
      .filter(r => r.title && Array.isArray(r.ingredients) && r.ingredients.length);

    res.status(200).json({ ok: true, recipes: cleaned });
  } catch (e) {
    console.error('[recipes/extract] handler crash', e);
    res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
}

// Claude is usually clean but occasionally wraps JSON in markdown
// fences. Strip them defensively before parsing.
function safeParseJson(s) {
  if (!s) return null;
  let t = s.trim();
  if (t.startsWith('```')) t = t.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  try { return JSON.parse(t); } catch { /* fall through */ }
  // Best-effort: locate the first { and last } and try again
  const i = t.indexOf('{');
  const j = t.lastIndexOf('}');
  if (i >= 0 && j > i) {
    try { return JSON.parse(t.slice(i, j + 1)); } catch { return null; }
  }
  return null;
}

function normaliseRecipe(r) {
  const valid = ['breakfast','lunch','dinner','snack'];
  return {
    title:         String(r?.title || '').trim(),
    meal_type:     valid.includes(String(r?.meal_type).toLowerCase()) ? String(r.meal_type).toLowerCase() : 'snack',
    description:   String(r?.description || '').trim() || null,
    ingredients:   Array.isArray(r?.ingredients)  ? r.ingredients.map(s => String(s).trim()).filter(Boolean) : [],
    instructions:  Array.isArray(r?.instructions) ? r.instructions.map(s => String(s).trim()).filter(Boolean) : [],
    prep_time_min: finiteOrNull(r?.prep_time_min),
    cook_time_min: finiteOrNull(r?.cook_time_min),
    servings:      finiteOrNull(r?.servings),
    tags:          Array.isArray(r?.tags) ? r.tags.map(s => String(s).trim().toLowerCase()).filter(Boolean) : [],
  };
}

function finiteOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}
