// Vercel serverless — extract structured recipes from arbitrary PDF
// text using Anthropic's Claude API. The client extracts the text
// client-side with pdfjs (already a dep) and POSTs it here.
//
//   POST /api/recipes/extract
//   body: { text: '...full pdf text...', max_recipes?: 40 }
//
//   success: { ok: true, recipes: [{ title, meal_type, description,
//                                     ingredients[], instructions[],
//                                     prep_time_min, cook_time_min,
//                                     servings, tags[] }, ...] }
//   failure: { ok: false, error: 'human message' }
//
// Reliability strategy
//   The first version of this route asked the model to "please return
//   strict JSON" and parsed the text response. It intermittently failed
//   because the model sometimes wrapped JSON in prose, added trailing
//   commentary, or got truncated mid-array — producing the
//   "AI returned unparseable output" toast.
//
//   This version uses Anthropic tool_use with a strict JSON schema:
//
//     - tool_choice forces the model to call our extract_recipes tool,
//       so it cannot answer with plain text at all.
//     - The schema enforces the shape — every recipe is guaranteed to
//       carry title + meal_type + ingredients + instructions before
//       the handler ever sees it.
//     - max_tokens is generous (8192) so long cookbook PDFs don't get
//       truncated mid-array.
//     - When something does fail, the upstream Anthropic error message
//       is bubbled into the response so the UI surfaces something
//       actionable, not just "(500)".
//
// Setup: add ANTHROPIC_API_KEY to Vercel project env vars. Without it
// the route returns a clear 503 with guidance.

const ANTHROPIC_API_URL  = 'https://api.anthropic.com/v1/messages';
// Current Sonnet model — override per-deploy via ANTHROPIC_RECIPE_MODEL.
const ANTHROPIC_MODEL    = process.env.ANTHROPIC_RECIPE_MODEL || 'claude-sonnet-4-5';
const MAX_INPUT_CHARS    = 150_000;   // budget; truncate larger PDFs
const MAX_OUTPUT_TOKENS  = 8192;      // enough for ~30-40 typical recipes

const SYSTEM_PROMPT = `You read pages of recipe content (cookbook scans,
handouts, sports nutrition PDFs) and call the extract_recipes tool with
the recipes you find.

Rules:
  - Only emit a recipe when the source clearly contains a title plus
    ingredients and steps — don't pad with introductions, blurbs, or
    headings that aren't real recipes.
  - Infer meal_type from context. If the section says "Snacks", set
    meal_type to "snack" for every recipe under it.
  - Don't invent times or servings — omit numeric fields when not
    stated.
  - Tags should be short (1-3 words), lowercase, hyphenated.
  - Use the extract_recipes tool to return your output. Do not return
    plain text.`;

// JSON schema the model is forced to comply with. Only the fields the
// athlete-app card actually renders are required (title + meal_type +
// ingredients + instructions); everything else is optional and the UI
// degrades gracefully when fields are absent.
const RECIPE_TOOL = {
  name: 'extract_recipes',
  description: 'Return every recipe extracted from the supplied PDF text.',
  input_schema: {
    type: 'object',
    properties: {
      recipes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title:         { type: 'string', description: 'Recipe title as it appears in the source.' },
            meal_type:     { type: 'string', enum: ['breakfast','lunch','dinner','snack'] },
            description:   { type: 'string', description: '1-2 sentence summary; omit when none.' },
            ingredients:   { type: 'array',  items: { type: 'string' }, description: 'One item per array entry.' },
            instructions:  { type: 'array',  items: { type: 'string' }, description: 'One step per array entry.' },
            prep_time_min: { type: 'number', description: 'Prep time in whole minutes; omit when not stated.' },
            cook_time_min: { type: 'number', description: 'Cook time in whole minutes; omit when not stated.' },
            servings:      { type: 'number', description: 'Whole-number serving count; omit when not stated.' },
            tags:          { type: 'array',  items: { type: 'string' }, description: 'Short, lowercase, hyphenated tags.' },
          },
          required: ['title', 'meal_type', 'ingredients', 'instructions'],
        },
      },
    },
    required: ['recipes'],
  },
};

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

  const maxRecipes = Math.max(1, Math.min(60, Number(body?.max_recipes) || 40));

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
        max_tokens:  MAX_OUTPUT_TOKENS,
        system:      SYSTEM_PROMPT,
        tools:       [RECIPE_TOOL],
        // Force the model to call our extractor — it cannot answer
        // with plain text. This is the single biggest reliability
        // upgrade vs the earlier prose-prompt-for-JSON approach.
        tool_choice: { type: 'tool', name: 'extract_recipes' },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract up to ${maxRecipes} recipes from this PDF text and call the extract_recipes tool.\n\nPDF TEXT:\n${text}`,
              },
            ],
          },
        ],
      }),
    });

    if (!ai.ok) {
      const detail = await ai.text();
      console.error('[recipes/extract] Anthropic call failed', ai.status, detail);
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

    // With forced tool_choice the response is guaranteed to be a
    // tool_use block. We still defend against the rare edge case
    // where the model halts before calling the tool (e.g. content
    // moderation refusal) and surface a clear message.
    const toolUse = json?.content?.find(c => c.type === 'tool_use' && c.name === 'extract_recipes');
    const recipes = toolUse?.input?.recipes;

    if (!Array.isArray(recipes)) {
      const stopReason   = json?.stop_reason || 'unknown';
      const fallbackText = json?.content?.find(c => c.type === 'text')?.text || '';
      console.error('[recipes/extract] No tool_use in response', { stopReason, fallbackText });
      res.status(502).json({
        ok: false,
        error: `AI did not call the extractor (stop_reason: ${stopReason}). ${
          fallbackText ? 'Message: ' + fallbackText.slice(0, 200) : 'Try a different PDF.'
        }`,
      });
      return;
    }

    const cleaned = recipes
      .map(normaliseRecipe)
      .filter(r => r.title && Array.isArray(r.ingredients) && r.ingredients.length);

    if (!cleaned.length) {
      res.status(200).json({
        ok: false,
        error: 'The AI processed the PDF but did not find any complete recipes (title + ingredients + steps).',
      });
      return;
    }

    res.status(200).json({ ok: true, recipes: cleaned });
  } catch (e) {
    console.error('[recipes/extract] handler crash', e);
    res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
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
