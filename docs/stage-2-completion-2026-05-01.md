# ProPath AMS — Stage 2 completion report

**Date:** 2026-05-01
**Project:** propath-ams (live, ref `xaawuxckpztxuyywebop`)
**Stage:** 2 of 3 — code deploy
**Status:** ✅ Complete. New code is live in production.

---

## Summary

The dev branch (`dev/picker-and-planned-days`, commit `79dd308`) was
fast-forward merged into `master` and pushed. Vercel auto-deployed
the new build to production. Smoke tests on the live URL confirmed
both legacy regression checks and new functionality pass.

| Item | Value |
|---|---|
| Stage 2 start | 2026-05-01 ~12:50 UTC |
| Stage 2 end | 2026-05-01 ~12:55 UTC |
| Total elapsed | ~5 min |
| User-visible downtime | None (Vercel atomic deploy) |
| Production commit (was) | `a041e87` |
| Production commit (now) | `79dd308` |
| Commits added | 32 (full diff: ~117 files, +52,962 / −458 lines, mostly the exercise library SQL chunks) |

---

## Pre-merge checklist

| Item | Confirmed |
|---|---|
| Live DB password rotation | Deferred to post-Stage-2 (acceptable; Vercel uses anon key only) |
| Vercel production env vars point at LIVE (`xaawuxckpztxuyywebop`) | ✅ Confirmed |
| `invite-user` edge function | Deferred (User Management → Invite User flow will 404 until deployed) |
| Stage 1 schema migrations applied | ✅ See `stage-1-completion-2026-05-01.md` |

---

## Merge mechanics

`gh` CLI was unavailable, so the merge was performed via git directly:

```bash
git checkout master
git merge --ff-only dev/picker-and-planned-days   # clean fast-forward, no merge commit
git push origin master                             # triggers Vercel
```

Same end-state as a GitHub PR merge with "Rebase and merge" — linear
history, no merge commit. Master moved cleanly from `a041e87` → `79dd308`.

---

## Pre-merge prep commit (`79dd308`)

One small commit added to dev before the merge to capture the deploy
artefacts:

- `docs/deploy-plan-2026-05-01.md` — pre-deploy diagnostic + 3-stage plan
- `docs/stage-1-completion-2026-05-01.md` — Stage 1 execution log
  (with the live DB password redacted; raw value never enters source control)
- `.gitignore` extensions — `backups/`, `.bin/`, local diagnostic
  scripts, and Stage 1 operational scratch added so sensitive
  artefacts can't be accidentally committed.

No source code changes in this commit — purely documentation + ignore
rules.

---

## Smoke test results (live URL, post-deploy)

### Legacy regression checks (no behaviour change expected)

| # | Surface | Result |
|---|---|---|
| 1 | Roster loads, all 14 athletes show with cohort badges | ✅ passed |
| 2 | Athlete profile opens, Overview tab renders new design (cohort cover band + photo + stat strip + biography) | ✅ passed |
| 3 | Pillar tabs (Physical/Psych/Nutritional/Lifestyle/Physio) — existing notes display | ✅ passed |
| 4 | Performance Testing tab — existing entries render | ✅ passed |
| 5 | Sidebar → User Management — 5 users listed | ✅ passed |
| 6 | Sidebar → Sessions — 6 entries show, can add new | ✅ passed |
| 7 | Sidebar → Wellness — 2 legacy submissions still listed | ✅ passed |

### New functionality (Stage 1 schema + Stage 2 code)

| # | Surface | Result |
|---|---|---|
| 8 | Sidebar → Programme module → Build / Templates / Assign tabs all load | ✅ passed |
| 9 | Athlete profile → Wellness tab — Custom Questionnaire panel + 23 library questions, tick/star works | ✅ passed |
| 10 | Athlete profile → Overview — Athlete App panel, can toggle on, generates `/athlete/<token>` link | ✅ passed |
| 11 | `/athlete/<token>` page — shell loads, Training tab visible, week strip + welcome card render | ✅ passed |
| 12 | Athlete profile → Physical Development → Programme — opens (empty state) | ✅ passed |
| 13 | Athlete profile → Physical Development → Logged Sessions — sub-tab visible (empty state) | ✅ passed |

### Known to NOT work (deferred)

- **User Management → Invite User** flow returns 404 because the
  `invite-user` Supabase edge function isn't deployed yet. Tracked
  separately; not blocking the deploy.

---

## What's now live

### App surfaces enabled by this deploy

- **Athlete app** at `/athlete/:token` — public token-based mobile-first interface
- **Custom wellness questionnaire** with 23 ProPath library defaults, per-athlete selection + featured-on-roster pinning
- **Programme builder** — block templates, sessions, supersets, planned-day generation
- **Session logger** — row-per-prescribed-set, gradient RPE slider, summary screen
- **Logged Sessions analytics** sub-tab on Physical Development
- **Roster polish** — hover lift, ink palette
- **Overview header redesign** — cohort cover band + lifted photo + stat strip
- **Programme calendar polish** — bottom block-marker line removed, session card refresh

### Schema state on live

- 18 new tables (programming module, athlete app, custom wellness, session logging)
- 7 legacy tables intact and untouched (athletes, wellness_submissions, wellness_tokens, user_roles, sessions, app_settings, provider_allocations)
- Total: 25 tables in `public` schema (excluding orphan `session_templates*` family which were created empty by the foundation migration and are unused by code)

---

## Outstanding follow-ups (post-deploy, separate cleanup)

| # | Item | Priority |
|---|---|---|
| 1 | **Rotate live DB password** — Supabase Dashboard → Project Settings → Database → Reset password. Required because the password used during Stage 1 was passed via chat. | High — do today |
| 2 | **Deploy `invite-user` edge function** to live. Required for the User Management → Invite User flow. | Medium |
| 3 | **Patch the canonical `sql/wellness_slider_and_session_logging.sql`** with idempotent guards (`DO $$ BEGIN IF EXISTS … END IF; END $$;`) so future re-runs against any DB shape don't fail. | Low — not blocking, only matters for the next fresh deploy |
| 4 | **Drop the orphan `session_templates*` tables** on live (created empty by foundation migration but unused by code). | Low — cosmetic, don't block on this |
| 5 | **Decide what to do with the dropped legacy `session_logs`/`set_logs` tables** — was empty schema from a prior abandoned implementation. Already dropped; just noting in case any historical reference is needed. | None — done |

---

## Rollback path (if needed)

If something breaks post-deploy that wasn't caught in smoke tests:

1. **Code rollback (fast — ~30s):** Vercel Dashboard → Deployments → previous successful master deploy (`a041e87`) → "Promote to Production". App reverts to old build immediately. New tables stay (idle, not referenced by old code).
2. **Schema rollback (slow, only if data corruption suspected):** Drop new tables in reverse dependency order, OR restore the legacy 7 tables from `backups/live-backup-2026-05-01-12-13-06.sql`. Do NOT execute without explicit instruction.

The new tables added by Stage 1 are **idle** when the old code runs — they don't break anything. So a code-only rollback is sufficient for any UI / data-shape regression.

---

## Files modified during Stage 2

- `master` ← `dev/picker-and-planned-days` (fast-forward, no merge commit)
- `docs/deploy-plan-2026-05-01.md` — added (was untracked)
- `docs/stage-1-completion-2026-05-01.md` — added (was untracked, password redacted before commit)
- `.gitignore` — extended for backups, .bin, diagnostic scripts, operational scratch

---

## ✅ Deploy complete

Stages 1 + 2 of the 3-stage plan are done. Stage 3 (cleanup) had
nothing to drop in this deploy — skipped per the original plan.

The application is live with the full new feature set. Nothing is in
a "halfway" or "expand" state — both schema and code are at the new
shape simultaneously.
