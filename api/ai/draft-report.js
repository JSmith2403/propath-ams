// Vercel serverless — drafts the narrative for a quarterly development
// review from the coach's own dated notes + current goal statuses.
// The client gathers the notes/goals it already has loaded (no DB
// access needed here) and POSTs them; this route just asks Claude to
// summarise them into a few sentences. The result always lands in an
// editable textarea client-side, so a thin or unhelpful draft is never
// a dead end — the coach can edit or replace it freely.
//
//   POST /api/ai/draft-report
//   headers: Authorization: Bearer <coach Supabase session token>
//   body: { athleteName, periodLabel, notes: [...], goals: [...] }
//
// Setup: add ANTHROPIC_API_KEY to Vercel project env vars.

import { requireUser } from '../_lib/verifyUser.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL   = process.env.ANTHROPIC_REPORT_MODEL || 'claude-sonnet-5';
const MAX_OUTPUT_TOKENS = 500;

const SYSTEM_PROMPT = `You help a sports performance coach draft the
narrative summary for an athlete's quarterly development review, from
the coach's own dated notes across four domains (Physical, Nutritional,
Psychological, Lifestyle) and the current status of the athlete's
goals.

Rules:
  - Write 3-5 concise, professional sentences in the coach's voice,
    suitable to share with the athlete and their parents.
  - Only use information present in the notes and goals provided —
    never invent facts, metrics, dates, or events.
  - If the notes are sparse, keep the narrative appropriately brief
    rather than padding it out.
  - Return only the narrative text — no headings, no preamble, no
    surrounding quotes.`;

function formatNotes(notes) {
  return notes
    .map(n => `[${n.domain}, ${n.date || 'undated'}${n.entryType ? ', ' + n.entryType : ''}] ${n.note}`)
    .join('\n');
}

function formatGoals(goals) {
  return goals
    .map(g => `[${g.domain}, ${g.tier}, ${g.status}] ${g.description}`)
    .join('\n');
}

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

  const athleteName = String(body?.athleteName || 'the athlete').trim();
  const periodLabel  = String(body?.periodLabel || 'this quarter').trim();
  const notes = Array.isArray(body?.notes) ? body.notes.filter(n => n?.note) : [];
  const goals = Array.isArray(body?.goals) ? body.goals.filter(g => g?.description) : [];

  if (!notes.length && !goals.length) {
    res.status(400).json({ ok: false, error: 'No notes or goals to draft from.' });
    return;
  }

  const userText = [
    `Athlete: ${athleteName}`,
    `Period: ${periodLabel}`,
    notes.length ? `\nCoach notes this quarter:\n${formatNotes(notes)}` : '\nNo notes logged this quarter.',
    goals.length ? `\nCurrent goals:\n${formatGoals(goals)}` : '',
    '\nDraft the narrative summary now.',
  ].filter(Boolean).join('\n');

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
        messages:   [{ role: 'user', content: userText }],
      }),
    });

    if (!ai.ok) {
      const detail = await ai.text();
      console.error('[ai/draft-report] Anthropic call failed', ai.status, detail);
      let upstream = detail;
      try {
        const j = JSON.parse(detail);
        if (j?.error?.message) upstream = j.error.message;
      } catch (_) { /* leave as raw */ }
      res.status(502).json({ ok: false, error: `AI call failed (${ai.status}): ${String(upstream).slice(0, 240)}` });
      return;
    }

    const json = await ai.json();
    const narrative = json?.content?.find(c => c.type === 'text')?.text?.trim();

    if (!narrative) {
      res.status(502).json({ ok: false, error: 'AI did not return a draft. Try again or write it directly.' });
      return;
    }

    res.status(200).json({ ok: true, narrative });
  } catch (e) {
    console.error('[ai/draft-report] handler crash', e);
    res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
}
