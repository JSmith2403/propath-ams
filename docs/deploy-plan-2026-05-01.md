# ProPath AMS — Deploy plan: dev → live

**Generated:** 2026-05-01 · **Scope:** Promote `dev/picker-and-planned-days` (commit `c0e0818`) → production
**Status:** ⏸ Awaiting authorisation. Read-only diagnostic only — nothing has been pushed to live.

---

## 0. Diagnostic confidence and gaps

| What | Status |
|---|---|
| Branch state on git remote | ✅ Verified |
| Dev Supabase schema introspection | ✅ Verified via REST probes (anon key) |
| Live Supabase schema introspection | ⚠ Verified via anon-key REST probes only — see Q4 |
| Code-side reference audit | ✅ Verified (grep across `src/`) |
| Live row counts on shared tables | ✅ Verified |
| Backup status on live | ❌ Not verified — need Supabase dashboard access |
| Vercel env var state | ❌ Not verified — need Vercel dashboard access |
| RLS policy diff | ⚠ Limited — anon key can't introspect `pg_policies`. Inferred from migration SQL files. |

**I do not have:** Supabase dashboard access, service-role key, or Vercel access. Items requiring those are listed under "Open questions for you" at the bottom.

---

## 1. Branch / commit state

- **Current dev branch:** `dev/picker-and-planned-days` @ `c0e0818` (clean working tree on tracked files)
- **Production branch:** `master` (note: not `main`)
- **Other branches on origin:** `dev/wellness-survey-builder` — separate, parallel work, **not part of this deploy**
- **Commits ahead of master:** 31
- **Commits behind master:** 0
- **Diff summary:** 117 files, 52,962 insertions, 458 deletions
  - The bulk of the inserts is the 1,606-row exercise library import SQL (≈17,500 lines split across chunks). The application code delta is much smaller.

Untracked files in working tree (will NOT be committed): `bolton-exercise-library-1.csv`, `env_diagnostic.ps1`, `hossunit-template.mjs`, `import_bolton.mjs`, `import_bolton.py`, `security_audit.ps1`, `security_remediation.ps1`. These are local-only scripts.

---

## 2. Project identification

| | URL | Key | Reasoning |
|---|---|---|---|
| **LIVE** | `https://xaawuxckpztxuyywebop.supabase.co` (`.env`) | `sb_publishable_HS6n…` | Has legacy schema only (`athletes`, `wellness_submissions`, `wellness_tokens`, `user_roles`, `provider_allocations`, `app_settings`, `sessions`). Matches the description in your brief. |
| **DEV**  | `https://mdqzxhihyglxhgezxeat.supabase.co` (`.env.development`) | `sb_publishable_ag6S…` | Has every new table (programming module, athlete app, wellness library, session logs). All migrations from `sql/` and `supabase/migrations/` are applied. |

**🔴 Confirm before proceeding:** is `xaawuxckpztxuyywebop` actually the live project, or is the live project a third URL I haven't seen? Vercel production env vars should already point at live — I can't verify them.

---

## 3. Schema diff (live vs dev)

### 3.1 Tables present on BOTH (column-identical)

| Table | Live rows | Dev rows | Notes |
|---|---|---|---|
| `athletes` | 14 | 13 | Same columns: `id`, `data` (jsonb), `updated_at`. Pillar logs live in `data` jsonb. |
| `wellness_submissions` | 2 | 0 | Legacy 5-metric form. Untouched by deploy. |
| `wellness_tokens` | 3 | 3 | Untouched by deploy. |
| `app_settings` | 2 | 1 | Generic settings table. **Verify columns match before deploy** — quick sanity check. |

### 3.2 Tables present on LIVE only (NOT on dev) 🟡

| Table | Live rows | Used by code? |
|---|---|---|
| `user_roles` | 5 | ✅ `useAuth.js`, `useUserManagement.js`. **Not present on dev** — but dev runs because `useAuth` has a `DEV_BYPASS = import.meta.env.DEV` short-circuit that skips the query in dev mode. **In production this query will run against live → works because live has the table.** |
| `provider_allocations` | 0 | ✅ `useAuth.js`, `useUserManagement.js`. Same DEV_BYPASS protection. Live has it. |
| `sessions` | 6 | ✅ `useSessions.js`, `App.jsx` (Sessions data-entry view). Legacy session log. **Will continue working post-deploy** — code reads it normally; no schema change. |

### 3.3 Tables present on DEV only (need to be CREATED on LIVE) 🟢 **Category A — purely additive**

These are the tables this deploy adds. None exist on live yet, so creation is risk-free (no data conflict possible).

| Table | Migration source | Dev rows |
|---|---|---|
| **Programming module** | | |
| `block_templates` | `programming-foundation-2026-04-28.sql` + `programme-build-schema-2026-04-30.sql` | 5 |
| `block_template_sessions` | same | 23 |
| `block_sessions` | `programme-build-5a-2026-04-30.sql` | 14 |
| `session_exercises` | `programme-build-schema-2026-04-30.sql` + `programme-build-5c-2026-04-30.sql` | 65 |
| `session_sections` | `programme-build-5a-2026-04-30.sql` | 60 |
| `session_step_notes` | `picker-and-planned-days-2026-04-30.sql` | 0 |
| `planned_sessions` | `picker-and-planned-days-2026-04-30.sql` | 42 |
| `exercise_week_prescriptions` | `programme-build-schema-2026-04-30.sql` | 204 |
| `exercise_library` | `exercise-library-import-2026-04-30.sql` (+ chunks) | **1,606** |
| `programming_settings` | `programming-foundation-2026-04-28.sql` | 8 |
| `training_blocks` | `programme-build-5a-2026-04-30.sql` | 6 |
| `athlete_calendar_events` | `programming-foundation-2026-04-28.sql` | 9 |
| **Athlete app + custom wellness** | | |
| `athlete_app_tokens` | `sql/athlete_app_schema.sql` | 1 |
| `wellness_question_library` | `sql/wellness_library_redesign.sql` | 23 |
| `athlete_wellness_questions` | `sql/wellness_library_redesign.sql` (+ `wellness_featured_questions.sql`) | 9 |
| `wellness_responses` | `sql/wellness_library_redesign.sql` | 2 |
| **Session logging** | | |
| `session_logs` | `sql/wellness_slider_and_session_logging.sql` (+ `set_logs_is_extra.sql`, `session_flow_polish.sql`) | 19 |
| `set_logs` | same | 135 |
| **Possibly orphan / deprecated on dev** | | |
| `session_templates`, `session_template_exercises`, `session_template_week_prescriptions` | early programme-build iteration | 32 / 124 / 404 |

The last group (`session_templates*`) appear to be from an earlier programme-builder iteration that was superseded by `block_templates`. They're not referenced by the current code (no `.from('session_templates')` in `src/`). **🔴 Decision: do we ship these on live too, or skip them?** My recommendation: skip; they're unused.

### 3.4 Columns that change on EXISTING tables — none

The 3 shared tables (`athletes`, `wellness_submissions`, `wellness_tokens`) have **identical** column lists on live and dev. **No Category B or C changes to existing tables.**

### 3.5 Data that would be invalid under new constraints — none

Because no existing tables change shape, no live data is at risk of constraint violation.

---

## 4. Code-side audit

Tables referenced by `src/`:

```
✅ on live: app_settings, athletes, provider_allocations, sessions, user_roles,
            wellness_submissions, wellness_tokens
🆕 added:  athlete_app_tokens, athlete_calendar_events, athlete_wellness_questions,
            block_sessions, block_template_sessions, block_templates,
            exercise_library, exercise_week_prescriptions, planned_sessions,
            programming_settings, session_exercises, session_logs,
            session_sections, session_step_notes, set_logs, training_blocks,
            wellness_question_library, wellness_responses
🟡 dev-only (orphan?): session_templates, session_template_exercises,
            session_template_week_prescriptions
```

Cross-reference: every code path that uses a 🆕 table will simply have those tables available post-deploy (after Stage 1 SQL runs). No functions read tables that won't exist post-deploy.

`useAuth.js` `DEV_BYPASS` guard means dev doesn't need `user_roles` to function. Production will read it from live — confirmed present.

---

## 5. RLS / authentication

Cannot introspect `pg_policies` with the anon key. Inferred from the migration SQL files in `sql/`:

- All new tables have `enable row level security` + at least one `policy ... to anon`/`to authenticated` clause.
- Pattern matches existing live tables (anon-permissive policies for tables the public form/athlete app needs to read).
- No existing live RLS policies are altered by this deploy — only new policies are added on new tables.

**🔴 Verify in dashboard before Stage 2:** that the live anon role behaviour matches dev (some new tables like `wellness_question_library` use `to anon for select using (true)`). If your live project has a stricter base RLS, the new tables might need explicit grants.

---

## 6. Edge functions / RPC

Code references one edge function: `${VITE_SUPABASE_URL}/functions/v1/invite-user` (used by `useUserManagement.js` to send invitation emails).

**🔴 Confirm:** the `invite-user` edge function is deployed on the LIVE project. If it only exists on dev, the user-invite flow will 404 in production.

---

## 7. Reports / dashboard surfaces

Reports that aggregate data, with the tables they touch:

| Surface | Tables | Risk |
|---|---|---|
| Athlete profile → Overview tab (RAG, check-ins, quarterly) | `athletes` (jsonb) | None — no schema change |
| Athlete profile → Pillar tabs | `athletes` (jsonb) | None |
| Athlete profile → Performance Testing tab | `athletes` (jsonb) | None |
| Athlete profile → Wellness tab | `wellness_responses` (new), `wellness_question_library` (new), `wellness_submissions` (legacy) | New surface — works once tables are created |
| Athlete profile → Physical Development → Logged Sessions | `session_logs`, `set_logs`, `session_exercises`, `exercise_library` | New surface — works post Stage 1 |
| Athlete profile → Physical Development → Programme | `training_blocks`, `block_sessions`, `planned_sessions`, etc. | New surface — works post Stage 1 |
| Roster (RAG donut rings) | `athletes`, `wellness_responses`, `wellness_question_library`, `athlete_wellness_questions` | New surface — works post Stage 1 |
| Sidebar / Sessions data-entry | `sessions`, `athletes` | None — legacy, untouched |
| Sidebar / User Management | `user_roles`, `provider_allocations` | None — legacy, untouched |
| Sidebar / Wellness | `wellness_submissions` (legacy form) + new `wellness_question_library` etc. | Hybrid — both old and new surfaces co-exist |

**Built-in reports (the pillar-by-pillar PDF report)** read from `athletes.data` jsonb only. Untouched.

---

## 8. Service worker / PWA

No service worker, no `vite-plugin-pwa`, no `workbox`, no `sw.js` registration anywhere in `src/` or root. **PWA cache implications: none for this deploy.**

---

## 9. Environment variables

Used by code:
- `VITE_SUPABASE_URL` — already set in Vercel for live (assumed)
- `VITE_SUPABASE_ANON_KEY` — already set in Vercel for live (assumed)
- `import.meta.env.DEV` — Vite built-in; auto-resolves `false` in production builds

**No new env vars added by this deploy.**

🔴 Confirm before deploying: Vercel production env vars point at the **LIVE** Supabase project (xaawuxckpztxuyywebop), not the dev project. A misconfigured deploy that points at dev would expose dev data to live users.

---

## 10. Backup status

⚠ **Cannot verify from here — needs Supabase dashboard access.**

**Mandatory before Stage 1:** trigger an on-demand backup of the LIVE project via Supabase Dashboard → Database → Backups → New backup. Note the backup ID and timestamp before proceeding. This is your rollback insurance.

If your live tier is the free plan, only the daily PITR backup exists (24h retention). **Strongly recommend** at least running a manual `pg_dump` of `public` schema as a local safety net.

---

## 11. Three-stage deploy plan

### Stage 1 — Schema expand (additive only) — Category A

**No code deployed yet. Live app is still on the old build.**

Run the following SQL files **in this order** against the LIVE project (Supabase SQL editor, paste each, run, verify):

1. `supabase/migrations/programming-foundation-2026-04-28.sql`
2. `supabase/migrations/programming-foundation-2026-04-28-seed.sql`
3. `supabase/migrations/phase-schema-2026-04-29.sql`
4. `supabase/migrations/programme-build-schema-2026-04-30.sql`
5. `supabase/migrations/programme-build-5a-2026-04-30.sql`
6. `supabase/migrations/programme-build-5c-2026-04-30.sql`
7. `supabase/migrations/picker-and-planned-days-2026-04-30.sql`
8. `supabase/migrations/exercise-library-import-2026-04-30.sql` ⚠ **17,460 lines, 1,606 rows.** Likely faster to run via CLI / `psql` than the dashboard SQL editor. Or split via `supabase/migrations/exercise-library-import-chunks/` (5 chunks, easier in the editor).
9. `sql/athlete_app_schema.sql`
10. `sql/wellness_custom_questions.sql` *(superseded by next file but creates compatible base)*
11. `sql/wellness_library_redesign.sql`
12. `sql/wellness_featured_questions.sql`
13. `sql/wellness_hooper_migration.sql`
14. `sql/wellness_hooper_labels_migration.sql`
15. `sql/wellness_slider_and_session_logging.sql`
16. `sql/set_logs_is_extra.sql`
17. `sql/session_flow_polish.sql`

After all migrations, run `notify pgrst, 'reload schema';` once.

**Validation queries** (run after Stage 1, expected counts): `select count(*) from exercise_library` → 1,606 (or whatever ships), `select count(*) from wellness_question_library` → 21 (the seeded defaults), `select column_name from information_schema.columns where table_name='session_logs'` → should include `duration_minutes`, `athlete_reflection`, `is_extra`-on-set_logs etc.

**Time estimate:** 30–60 minutes (the exercise library import is the slow part).
**Downtime:** zero — the running live app uses none of these new tables yet.

### Stage 2 — Code deploy

Once Stage 1 is verified clean:

1. Open a PR `dev/picker-and-planned-days` → `master`. Review the 31 commits and ~117 file diff.
2. Merge to `master`. Vercel auto-deploys to production.
3. Vercel production env vars MUST point at LIVE Supabase URL+key. (Verify in Vercel Dashboard → Project → Settings → Environment Variables.)
4. Wait for the build to go live. Hit production URL and confirm the new app loads.

**Time estimate:** 5–10 minutes.
**Downtime:** brief (Vercel atomic deploy, ~30s of stale-cache).

### Stage 3 — Schema contract (cleanup) — defer to next deploy

Nothing to drop in this deploy. The orphan `session_templates*` tables on dev (not currently used by code) are not being shipped to live; they'll just stay absent.

---

## 12. Pre-deploy checklist

- [ ] Confirm live project URL is `xaawuxckpztxuyywebop`
- [ ] Verify Vercel production env vars point at LIVE
- [ ] Verify edge function `invite-user` exists on LIVE
- [ ] Trigger on-demand Supabase backup of LIVE (note backup ID)
- [ ] Run `pg_dump --schema-only` of LIVE locally as snapshot
- [ ] Comms to Nelly / Tiana / Ned / James / Sammy / Scott / Shannon: "AMS will be migrating to a new build between [time] and [time]. App may behave inconsistently for ~30 minutes."
- [ ] Schedule deploy in a low-traffic window (early UK morning / late UAE evening)
- [ ] Have a second person on standby to confirm smoke tests
- [ ] Have the rollback steps printed / open in a separate window before starting

---

## 13. Smoke tests (run after Stage 2)

Pick a real athlete on live, log in as admin, walk through:

1. Roster loads — all 14 athletes show with correct cohort badges
2. Open one athlete profile — Overview tab loads, header shows correctly with the new design
3. Overview RAG dots reflect existing pillar log entries (no regression)
4. Pillar tabs (Physical / Psych / Nutritional / Lifestyle / Physio) — existing notes display
5. Performance Testing tab — existing entries show; charts render
6. Wellness tab — Custom Questionnaire panel appears, library has 21 questions
7. Physical Development → Programme — empty state OR existing programme renders
8. Sidebar → Sessions data entry — legacy `sessions` table reads work, can add a new entry
9. Sidebar → User Management — existing 5 users show, role assignments preserved
10. Sidebar → Wellness — legacy submissions still listed; "Custom Questionnaire" works for selected athlete
11. Sidebar → Programme module — Build / Templates / Assign tabs all load
12. Programme Build → create a new block template → save → appears in Templates tab
13. Activate Athlete App on a test athlete → copy link → open in incognito → loads with token
14. Athlete app Training tab → start a session → log a couple of sets → finish → summary shows
15. Coach side → check the just-logged session appears under Physical Development → Logged Sessions

If 1–9 pass, the deploy is non-regressive. If 10–15 pass, the new functionality is live.

---

## 14. Rollback plan

**Code rollback (fast):**
1. Vercel Dashboard → Deployments → previous successful master deploy → Promote to Production. ~30s.

**Schema rollback (slower):**
- Option A (preferred if no new data has been written): leave the new tables in place. The previous build doesn't reference them → effectively no-op.
- Option B (data corruption suspected): restore the LIVE project from the on-demand backup taken in step 11.4. Supabase Dashboard → Database → Backups → restore. **Note:** this rolls back ALL data, including any new submissions made after the deploy.

**Decision tree:**
- Smoke test 1–9 fails → Vercel rollback only. New tables stay.
- Production data appears corrupted on existing tables → Restore from backup.
- New tables behaving badly but legacy ones fine → Vercel rollback. New tables stay (idle).

---

## 15. Estimated total time

| Stage | Activity | Time |
|---|---|---|
| 0 | Backups + pre-flight checks | 15 min |
| 1 | Schema migrations (incl. exercise library import) | 30–60 min |
| 2 | Vercel deploy + cache warm | 10 min |
| 3 | Smoke tests | 15 min |
| Total | | **70–100 min** |

User-facing downtime: **none** (atomic Vercel deploy + zero-downtime additive migrations).

---

## 16. Open questions for you to resolve before authorising

1. **🔴 Confirm** `xaawuxckpztxuyywebop` IS the production project. If not, share the correct URL.
2. **🔴 Confirm** Vercel production env vars point at the live project (Dashboard → Project → Settings → Environment Variables → screenshot or paste names+last 4 chars of values).
3. **🔴 Confirm** the `invite-user` edge function exists on the live project.
4. **🔴 Decision** Skip the orphan `session_templates*` family entirely (recommended) or include them?
5. **🔴 Decision** Skip the orphan `wellness_custom_questions.sql` (early iteration of the wellness library, superseded by `wellness_library_redesign.sql`) — do we run it for completeness or skip?
6. **🟡 Backup** Trigger Supabase on-demand backup before Stage 1 — confirm done before starting.
7. **🟡 Window** Pick a deploy window (UK morning is ideal — UAE athletes asleep, UK coaches starting their day so issues are caught early).

---

## What I have NOT done (per the brief)

- ❌ Modified live schema or data
- ❌ Pushed to `master`
- ❌ Triggered any Vercel deploy beyond dev
- ❌ Run any migration against live
- ✅ ONE mutation on dev: removed the session-summary export feature (commit `c0e0818` — pushed to `dev/picker-and-planned-days`)
- ✅ Read-only diagnostic of dev + live via REST anon-key probes

This document has not been pushed. It exists at `docs/deploy-plan-2026-05-01.md` for review.
