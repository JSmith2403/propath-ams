// Vercel serverless — extract structured recipes from arbitrary PDF
// text using Anthropic's Claude API. The client extracts the text
// client-side with pdfjs (already a dep) and POSTs it here.
//
//   POST /api/recipes/extract
//   body: { text: '...full pdf text...', max_recipes?: 60 }
//
//   success: { ok: true, recipes: [...], chunks: number }
//   failure: { ok: false, error: 'human message' }
//
// Reliability strategy
//   v1 prompted for JSON in prose → frequently wrapped output in
//   commentary → "AI returned unparseable output".
//
//   v2 switched to Anthropic tool_use with a strict JSON schema and
//   forced tool_choice so the model couldn't answer in plain text.
//   Reliable on small PDFs, but recipe-heavy documents (20+ recipes
//   with detailed instructions) blew through the 8K output-token
//   budget mid-array → "stop_reason: max_tokens".
//
//   v3 (this version) layers in two more fixes:
//     - Raise the per-call output budget to 16K tokens (Sonnet 4.5
//       supports plenty more, but 16K keeps latency reasonable).
//     - Auto-chunk large inputs: if the extracted PDF text is bigger
//       than CHUNK_THRESHOLD we split at paragraph boundaries, call
//       the model on each chunk sequentially, and merge the results.
//       That means a 90-recipe cookbook now fans out across 3 calls
//       instead of cramming into one and getting truncated.
//
// Setup: add ANTHROPIC_API_KEY to Vercel project env vars. Without it
// the route returns a clear 503 with guidance.

// Tell Vercel this route may run longer than the default 10s — chunked
// extractions take ~12-15s per chunk, so 8 chunks worst case = ~2 min.
// Vercel Pro plan supports up to 300s; on free/hobby this caps at 60.
export const config = { maxDuration: 300 };

const ANTHROPIC_API_URL  = 'https://api.anthropic.com/v1/messages';
// Current Sonnet model — override per-deploy via ANTHROPIC_RECIPE_MODEL.
const ANTHROPIC_MODEL    = process.env.ANTHROPIC_RECIPE_MODEL || 'claude-sonnet-4-5';

const MAX_INPUT_CHARS    = 220_000;   // hard refuse past this — ~45-50 dense pages
const SOFT_LIMIT_CHARS   = 130_000;   // warn the client past this, still process
const CHUNK_THRESHOLD    = 35_000;    // chunk inputs larger than this
const CHUNK_SIZE         = 30_000;    // target chunk size (chars)
const MAX_OUTPUT_TOKENS  = 16_384;    // per-call output budget
const MAX_CHUNKS         = 8;         // safety cap on serial AI calls

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

  // Refuse oversized PDFs outright instead of silently truncating —
  // a 45-page cookbook can blow past Vercel's serverless timeout
  // even with chunking. Coach gets a clear "split it up" message
  // upfront rather than waiting two minutes for a timeout error.
  if (text.length > MAX_INPUT_CHARS) {
    const pages = Math.ceil(text.length / 4_500);  // ~4.5K chars per dense page
    res.status(413).json({
      ok: false,
      error: `This PDF is too large for one AI pass (≈${pages} pages of text). Split it into smaller files of around 20–30 pages each and import them separately.`,
      size_chars: text.length,
      limit_chars: MAX_INPUT_CHARS,
    });
    return;
  }

  const maxRecipes = Math.max(1, Math.min(80, Number(body?.max_recipes) || 60));

  // Decide whether to chunk. Small inputs go straight through.
  const chunks = text.length > CHUNK_THRESHOLD
    ? splitIntoChunks(text, CHUNK_SIZE).slice(0, MAX_CHUNKS)
    : [text];

  // Spread the recipe budget across chunks so the model doesn't
  // over-emit on the first one and starve the rest.
  const perChunkMax = Math.max(8, Math.ceil(maxRecipes / chunks.length));

  try {
    const allRecipes = [];
    const errors = [];

    // Serial calls — keeps us inside Anthropic's per-key concurrency
    // limit and makes failures easy to diagnose. With Sonnet 4.5 each
    // chunk completes in ~10-15s, so 8 chunks max ≈ 2 minutes worst
    // case (still inside Vercel's 5-minute function timeout).
    for (let i = 0; i < chunks.length; i++) {
      const chunkResult = await extractFromChunk(chunks[i], perChunkMax, i + 1, chunks.length);
      if (chunkResult.error) {
        errors.push(chunkResult.error);
        continue;
      }
      allRecipes.push(...chunkResult.recipes);
    }

    const cleaned = allRecipes
      .map(normaliseRecipe)
      .filter(r => r.title && Array.isArray(r.ingredients) && r.ingredients.length);

    // De-duplicate by normalised title — the chunk boundary can land
    // mid-recipe and produce two near-identical entries.
    const deduped = dedupeByTitle(cleaned);

    if (!deduped.length) {
      res.status(200).json({
        ok: false,
        error: errors[0]
          || 'The AI processed the PDF but did not find any complete recipes (title + ingredients + steps).',
      });
      return;
    }

    res.status(200).json({
      ok: true,
      recipes: deduped,
      chunks: chunks.length,
      ...(errors.length ? { warning: `${errors.length} chunk${errors.length === 1 ? '' : 's'} partially failed; partial results returned.` } : {}),
    });
  } catch (e) {
    console.error('[recipes/extract] handler crash', e);
    res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
}

// ─── One AI call for one chunk of text ────────────────────────────────
async function extractFromChunk(chunkText, maxRecipes, chunkNum, totalChunks) {
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
      tool_choice: { type: 'tool', name: 'extract_recipes' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: totalChunks > 1
                ? `This is chunk ${chunkNum} of ${totalChunks} from a larger document. Extract up to ${maxRecipes} complete recipes you find in this chunk and call the extract_recipes tool. Skip anything that's only a fragment.\n\nPDF TEXT:\n${chunkText}`
                : `Extract up to ${maxRecipes} recipes from this PDF text and call the extract_recipes tool.\n\nPDF TEXT:\n${chunkText}`,
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
    return { error: `AI call failed (${ai.status}): ${String(upstream).slice(0, 240)}` };
  }

  const json = await ai.json();
  const toolUse = json?.content?.find(c => c.type === 'tool_use' && c.name === 'extract_recipes');
  const recipes = toolUse?.input?.recipes;

  if (!Array.isArray(recipes)) {
    const stopReason   = json?.stop_reason || 'unknown';
    const fallbackText = json?.content?.find(c => c.type === 'text')?.text || '';
    console.error('[recipes/extract] No tool_use in chunk', { chunkNum, stopReason, fallbackText });

    if (stopReason === 'max_tokens') {
      return {
        error: totalChunks > 1
          ? `Chunk ${chunkNum} produced too many recipes for one response. Some may be missing.`
          : 'This PDF has too many or too detailed recipes for a single AI pass. Try uploading fewer pages at a time.',
      };
    }
    return {
      error: `AI did not call the extractor (stop_reason: ${stopReason}).${
        fallbackText ? ' Message: ' + fallbackText.slice(0, 160) : ''
      }`,
    };
  }

  return { recipes };
}

// ─── Helpers ──────────────────────────────────────────────────────────

// Split text into chunks of roughly `targetSize` characters, preferring
// to break at paragraph boundaries so we don't slice a recipe in half.
function splitIntoChunks(text, targetSize) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + targetSize, text.length);
    if (end < text.length) {
      // Walk back to the nearest paragraph break within ~2K chars.
      const window = text.slice(i + Math.max(0, targetSize - 2000), end);
      const lastBreak = window.lastIndexOf('\n\n');
      if (lastBreak > 0) {
        end = i + Math.max(0, targetSize - 2000) + lastBreak + 2;
      }
    }
    const piece = text.slice(i, end).trim();
    if (piece) out.push(piece);
    i = end;
  }
  return out;
}

function dedupeByTitle(recipes) {
  const seen = new Set();
  const out = [];
  for (const r of recipes) {
    const key = String(r.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
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
