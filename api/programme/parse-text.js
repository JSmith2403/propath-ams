// Vercel serverless — parses a coach's free-text workout description into
// structured sections + exercises for the Programme builder's "Import"
// panel. The client owns matching results against the exercise library and
// committing them into the draft; this route only does the language
// understanding step.
//
//   POST /api/programme/parse-text
//   headers: Authorization: Bearer <coach Supabase session token>
//   body: { text: string }
//
// Setup: uses the same ANTHROPIC_API_KEY already configured for
// /api/ai/draft-report.

import { requireUser } from '../_lib/verifyUser.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL   = process.env.ANTHROPIC_REPORT_MODEL || 'claude-sonnet-5';
const MAX_OUTPUT_TOKENS = 4000;

const SYSTEM_PROMPT = `You convert a strength & conditioning coach's free-text
training programme into structured data for a programming tool.

The text may be numbered/headed sections ("1. General Mobility (5-8 min)")
followed by bullet exercises, or just a flat list of exercises with no
headers at all — handle both.

For each line, decide if it's a SECTION HEADER or an EXERCISE:

Section headers: short label naming a phase of the session (e.g. "General
Mobility", "Activation", "Plyometrics", "Strength", "Finisher", "Warm-up").
Strip any leading number, trailing minute range, or parenthetical subtitle
from the name itself (e.g. "1. General Mobility (5-8 min)" -> name
"General Mobility") — but if that parenthetical carries real coaching
guidance rather than just timing (e.g. "(dosed - landing quality over
volume)"), emit it as its own exercise-less note item immediately after
the section by setting type "note" with that text as name.

Exercises: extract sets/reps/notes from formats like "6 each side",
"3 x 8", "3x6 each leg", "30s each side, left gets a 3rd set", "8 steps
each direction x 2", "3 x 8-10", "RPE 7". Rules:
  - sets: the leading count before "x" if present, otherwise 1 if a
    single rep count is given with no set count.
  - reps: the rep count/range/duration as a short string ("8", "8-10",
    "20s"). For a bodyweight hold given only as "30s", reps is "30s" and
    prescription_type is "time".
  - prescription_type: "time" for pure durations (looks like "20s",
    "1min"), "rpe" when an RPE number is stated (put the number alone in
    target_value, e.g. "7"), otherwise "reps_only" unless a specific
    load/percentage/band is given (then "kg"/"percent_1rm"/"band_colour").
  - notes: put every qualifier that isn't sets/reps/target here verbatim
    but tightened — "each side", "left first", "left gets a 3rd set",
    "left leads", "both feet", "full recovery between reps", etc. Combine
    multiple into one comma-joined string. Do not repeat the sets/reps
    numbers inside notes.
  - bilateral_unilateral: "unilateral" whenever the exercise is explicitly
    per-side/per-leg/per-arm ("each side", "each leg", "left/right"),
    otherwise "bilateral".
  - category: your best judgement from: warm_up, strength, power,
    ballistic, jumps_plyos, capacity, speed, mobility, accessory. Bodyweight
    mobility drills are "mobility", activation/banded work is "warm_up",
    jump/hop/bound work is "jumps_plyos", barbell/dumbbell/machine lifts
    are "strength", isolation/finisher work is "accessory".
  - superset_label: if the exercise is prefixed with a label like "A1:",
    "B2:", copy just that label (e.g. "B2") so the caller can group
    same-letter-prefix exercises (A1+A2, B1+B2, ...) into a superset.
    Otherwise null. Strip the label itself from the exercise name.

Preserve the original order of everything. Never invent an exercise that
wasn't in the text. Call the submit_parsed_programme tool exactly once
with the full result.`;

const PARSE_TOOL = {
  name: 'submit_parsed_programme',
  description: 'Return the parsed workout programme as an ordered list of section headers, notes, and exercises.',
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['section', 'note', 'exercise'] },
            name: { type: 'string', description: 'Section name, note text, or exercise name.' },
            sets: { type: 'integer' },
            reps: { type: 'string' },
            target_value: { type: 'string' },
            prescription_type: {
              type: 'string',
              enum: ['kg', 'percent_1rm', 'velocity_zone', 'rpe', 'rir', 'reps_only', 'time', 'band_colour'],
            },
            category: {
              type: 'string',
              enum: ['warm_up', 'strength', 'power', 'ballistic', 'jumps_plyos', 'capacity', 'speed', 'mobility', 'accessory'],
            },
            bilateral_unilateral: { type: 'string', enum: ['bilateral', 'unilateral', 'alternating'] },
            notes: { type: 'string' },
            superset_label: { type: 'string' },
          },
          required: ['type', 'name'],
        },
      },
    },
    required: ['items'],
  },
};

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

  const text = String(body?.text || '').trim();
  if (!text) { res.status(400).json({ ok: false, error: 'text is required' }); return; }

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
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: `Parse this programme:\n\n${text}` }],
        tools:      [PARSE_TOOL],
        tool_choice: { type: 'tool', name: 'submit_parsed_programme' },
      }),
    });

    if (!ai.ok) {
      const detail = await ai.text();
      console.error('[programme/parse-text] Anthropic call failed', ai.status, detail);
      let upstream = detail;
      try {
        const j = JSON.parse(detail);
        if (j?.error?.message) upstream = j.error.message;
      } catch (_) { /* leave as raw */ }
      res.status(502).json({ ok: false, error: `AI call failed (${ai.status}): ${String(upstream).slice(0, 240)}` });
      return;
    }

    const json = await ai.json();
    const toolUse = json?.content?.find(c => c.type === 'tool_use' && c.name === 'submit_parsed_programme');
    const items = Array.isArray(toolUse?.input?.items) ? toolUse.input.items : null;

    if (!items) {
      res.status(502).json({ ok: false, error: 'AI did not return a parsed programme. Try again or check the text.' });
      return;
    }

    res.status(200).json({ ok: true, items });
  } catch (e) {
    console.error('[programme/parse-text] handler crash', e);
    res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
}
