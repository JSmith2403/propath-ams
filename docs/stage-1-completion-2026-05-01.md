# ProPath AMS — Stage 1 completion report

**Date:** 2026-05-01
**Project:** propath-ams (live, ref `xaawuxckpztxuyywebop`)
**Operator:** automated migration runner via Node + `pg`
**Status:** ✅ Complete. Ready to pause for Stage 2 authorisation.

---

## Summary

All 17 schema migrations were applied to the live Postgres instance.
The live application (still on `master`) was smoke-tested and behaves
exactly as before — confirming the additive deploy did not regress any
existing functionality.

| Item | Value |
|---|---|
| Stage 1 start | ~2026-05-01 12:00 UTC |
| Stage 1 end (last migration commit) | ~2026-05-01 12:35 UTC |
| Total elapsed | ~35 min |
| Migrations executed | 17 of 17 (15 in original form, 1 patched) |
| Tables created | 18 new + legacy intact |
| Rows imported | 90 (foundation) + 916 (chunks) = **1,006** in `exercise_library`; 21 + 3 − 1 = **23** in `wellness_question_library` |
| Legacy data integrity | ✅ All counts match pre-deploy snapshot |
| User-visible downtime | None |

---

## Backup taken

| | |
|---|---|
| Path | `backups/live-backup-2026-05-01-12-13-06.sql` |
| Size | 245 KB |
| Tables captured | `app_settings`, `athletes`, `provider_allocations`, `sessions`, `user_roles`, `wellness_submissions`, `wellness_tokens` (7 tables) |
| Rows captured | 32 total |
| Format | DROP IF EXISTS → CREATE TABLE → INSERT, wrapped in BEGIN/COMMIT |
| Caveats | No indexes / RLS / triggers / sequences. Sufficient for restoring data on a clean Postgres if needed. |
| Method | Custom Node-based logical dump (`backups/.tools/dump-live.mjs`); `pg_dump` not available locally |
| Stored in | `backups/` folder, gitignored |

---

## Migration outcomes

| # | File | Time | Notes |
|---|---|---|---|
| 1 | `supabase/migrations/programming-foundation-2026-04-28.sql` | 2.29s | Created `programming_settings`, `exercise_library`, `training_blocks`, `athlete_calendar_events` + others |
| 2 | `supabase/migrations/programming-foundation-2026-04-28-seed.sql` | 2.14s | 90 foundation exercises seeded |
| 3 | `supabase/migrations/phase-schema-2026-04-29.sql` | 1.75s | `training_phases` |
| 4 | `supabase/migrations/programme-build-schema-2026-04-30.sql` | 1.79s | Template + block tables (also created the orphan `session_templates*` family — left empty, harmless) |
| 5 | `supabase/migrations/programme-build-5a-2026-04-30.sql` | 1.84s | Per-athlete blocks + team-level events |
| 6 | `supabase/migrations/programme-build-5c-2026-04-30.sql` | 1.60s | Dropped `default_prescription_type`; added `primary_muscle`, `muscle_bias`, `joint_count_level`, `dynamic_isometric` |
| 7 | `supabase/migrations/picker-and-planned-days-2026-04-30.sql` | 1.59s | `session_step_notes`, `planned_sessions` |
| 8 | `supabase/migrations/exercise-library-import-chunks/` (5 chunks) | 11.83s combined | 916 net new exercises (4 ON CONFLICT updates) → 1,006 total |
| 9 | `sql/athlete_app_schema.sql` | 2.40s | `athlete_app_tokens` |
| 10 | `sql/wellness_custom_questions.sql` | 1.63s | Per-athlete wellness_questions table (immediately dropped by #11). The `use_custom_wellness` column on `athlete_app_tokens` survives — required by ReadinessTab/WellnessTab code. |
| 11 | `sql/wellness_library_redesign.sql` | 1.70s | `wellness_question_library` (21 seed rows), `athlete_wellness_questions` junction, `wellness_responses` recreated |
| 12 | `sql/wellness_featured_questions.sql` | 2.16s | `is_featured` flag on junction |
| 13 | `sql/wellness_hooper_migration.sql` | 1.64s | 1-7 Hooper scale; updated `question_type` constraint on library |
| 14 | `sql/wellness_hooper_labels_migration.sql` | 1.58s | Standardised "very, very [X]" anchors; +Confidence, +Focus, +Appetite; −duplicate fatigue → final 23 questions |
| 15 | **`sql/wellness_slider_and_session_logging.sql` (PATCHED)** | 1.65s (patched) | ⚠️ Original failed: tried to ALTER `wellness_questions` (dropped by #11). Live also already had legacy empty `session_logs`/`set_logs` with a different schema (likely from a prior abandoned setup). Action taken: dropped both legacy tables (0 rows, safe) and ran `backups/.tools/migration-15-patched.sql` containing only the still-relevant parts (session_logs + set_logs in dev shape, RLS, schema reload). Original repo file unchanged. |
| 16 | `sql/set_logs_is_extra.sql` | 1.60s | `is_extra` boolean on set_logs |
| 17 | `sql/session_flow_polish.sql` | 1.52s | `duration_minutes` + `athlete_reflection` on session_logs; widened RPE constraint to 0-10; `original_date` + `moved_at` on planned_sessions |

---

## New schema state on live

### 18 new tables (all confirmed existing + REST-accessible)

```
athlete_app_tokens
athlete_calendar_events
athlete_wellness_questions
block_sessions
block_template_sessions
block_templates
exercise_library              (1,006 rows)
exercise_week_prescriptions
planned_sessions
programming_settings
session_exercises
session_logs
session_sections
session_step_notes
set_logs
training_blocks
wellness_question_library     (23 rows: 21 default + 3 added by Hooper labels − 1 duplicate)
wellness_responses
```

### Critical column additions verified

| Table | Column | Status |
|---|---|---|
| `session_logs` | `duration_minutes` (int) | ✅ |
| `session_logs` | `athlete_reflection` (text) | ✅ |
| `session_logs.session_rpe` | constraint widened 1-10 → 0-10 | ✅ |
| `set_logs` | `is_extra` (bool) | ✅ |
| `planned_sessions` | `original_date` (date) | ✅ |
| `planned_sessions` | `moved_at` (timestamptz) | ✅ |
| `athlete_app_tokens` | `use_custom_wellness` (bool) | ✅ |

### Legacy data preserved (verified post-deploy)

| Table | Pre-deploy rows | Post-deploy rows | Match |
|---|---|---|---|
| `athletes` | 14 | 14 | ✅ |
| `wellness_submissions` | 2 | 2 | ✅ |
| `wellness_tokens` | 3 | 3 | ✅ |
| `user_roles` | 5 | 5 | ✅ |
| `sessions` | 6 | 6 | ✅ |
| `provider_allocations` | 0 | 0 | ✅ |
| `app_settings` | 2 | 2 | ✅ |

---

## Smoke test (legacy app on master, post-Stage-1)

| Surface | Result |
|---|---|
| Roster loads, all 14 athletes visible | ✅ confirmed |
| Athlete profile opens | ✅ confirmed |
| Pillar tabs render existing notes | ✅ confirmed |
| User Management lists 5 users | ✅ confirmed |
| Sessions data entry shows 6 sessions | ✅ confirmed |
| Wellness page shows 2 legacy submissions | ✅ confirmed |

The live app behaves identically to its pre-deploy state. The new tables exist but no code on master references them.

---

## Issues encountered

### Issue 1: live DB connection — wrong region prefix

**Symptom:** Initial connection attempts to `db.xaawuxckpztxuyywebop.supabase.co` failed (`getaddrinfo ENOENT`). Standard pooler regions tried (16 in total) all returned "Tenant or user not found".

**Root cause:** Supabase has migrated the project to a new pooler endpoint generation: `aws-1-ap-northeast-1.pooler.supabase.com` (note `aws-1` prefix — most public docs still reference `aws-0`).

**Resolution:** User pasted the connection string from Supabase Dashboard → Connect → Session pooler. Updated runner script.

**Lesson:** Always copy the connection string from the dashboard rather than constructing it.

### Issue 2: pg_dump unavailable

**Symptom:** Neither `pg_dump`, `psql`, nor Supabase CLI was installed on the deploy machine. `winget install --id Supabase.cli` returned "no package found".

**Resolution:** Downloaded Supabase CLI (`supabase_windows_amd64.tar.gz` v2.95.4) from GitHub releases into `.bin/`, but the CLI itself wraps `pg_dump` (not bundled). Switched to **Path B** from the diagnostic plan: custom Node-based logical dump (`backups/.tools/dump-live.mjs`) for the safety-net backup, and a Node-based migration runner (`backups/.tools/run-migration.mjs`) for executing the SQL files transactionally.

**Lesson:** For future deploys, install PostgreSQL client tools (`winget install PostgreSQL.PostgreSQL.17`) or have a Linux/macOS deploy box.

### Issue 3: Migration #15 ordering mismatch

**Symptom:** `wellness_slider_and_session_logging.sql` failed with `relation "wellness_questions" does not exist`. Lines 14-18 of the file ALTER the old per-athlete `wellness_questions` table, which had already been dropped by `wellness_library_redesign.sql` (migration #11) earlier in the deploy.

**Root cause:** On dev, this migration ran chronologically BEFORE the redesign, so its target table existed. In our deploy order it runs AFTER, so the target is gone. The Hooper migration (#13) already updated the equivalent constraint on the new `wellness_question_library`, so the constraint update in #15 was redundant anyway.

**Resolution:** Created `backups/.tools/migration-15-patched.sql` containing only the still-needed parts (session_logs + set_logs creation, RLS, schema reload). Ran patched version against live. The original `sql/wellness_slider_and_session_logging.sql` in the repo is unchanged.

**Recommended follow-up:** in a separate post-deploy commit, patch the canonical migration file with idempotent guards (`DO $$ BEGIN IF EXISTS ... THEN ALTER ... END IF; END $$;`) so it's safe to re-run on any DB shape. **Not blocking Stage 2.**

### Issue 4: Legacy empty `session_logs`/`set_logs` on live with different schema

**Symptom:** `migration-15-patched.sql` failed on its `CREATE TABLE IF NOT EXISTS session_logs` (silently no-op) followed by `CREATE INDEX … (athlete_id, started_at desc)` failing because `started_at` didn't exist.

**Root cause:** Live had pre-existing empty `session_logs` and `set_logs` tables with a totally different schema (columns `session_date`, `attended`, `srpe_load`, `coach_notes`, `actual_reps`, `actual_load_kg`, etc.). They had RLS enabled with `allow_all` policies but were 404 in the REST diagnostic earlier (likely missing the right anon grant or schema cache state at that time). Almost certainly leftovers from an earlier abandoned implementation.

**Resolution:** Verified both tables had **0 rows** (safe to drop). Ran `backups/.tools/drop-legacy-session-logs.sql` (DROP TABLE … CASCADE for both), then re-ran patched #15. Worked cleanly.

**Lesson:** Pre-deploy diagnostic only enumerated tables via REST API (which 404'd these because of RLS state). A direct `pg_tables` query against live earlier would have caught this. Add to future diagnostic checklist.

---

## Outstanding artefacts

The following local-only files were created during Stage 1 and are **gitignored** (will not enter source control):

```
backups/.tools/dump-live.mjs              — logical dump script
backups/.tools/run-migration.mjs          — migration runner
backups/.tools/drop-legacy-session-logs.sql — patch for issue #4
backups/.tools/migration-15-patched.sql   — patch for issue #3
backups/live-backup-2026-05-01-12-13-06.sql — pre-deploy backup
.bin/supabase.exe                         — CLI binary
node_modules/pg/                          — pg client (transient, no-save install)
```

---

## Pause point — DO NOT proceed to Stage 2 without explicit authorisation

Stage 2 (code deploy) requires:
1. Open PR `dev/picker-and-planned-days` → `master`
2. Review diff (~117 files, +52,962 lines, mostly the exercise library SQL)
3. Merge to `master`
4. Vercel auto-deploys
5. Smoke test the new flows (athlete app token activation, custom questionnaire, session logger, summary screen)

Items still **outstanding** for Stage 2 prep:
- [ ] **Verify Vercel production env vars** point at the LIVE Supabase project (`xaawuxckpztxuyywebop`)
- [ ] **Decide** whether to deploy the `invite-user` edge function in the same change (was deferred to Stage 2 in the prompt — confirm)
- [ ] **Rotate live DB password** — the password used during Stage 1 was passed via chat for the migration runner and must be considered compromised. Supabase Dashboard → Project Settings → Database → Reset database password. Vercel only uses the anon key (not the DB password) so deploy-time risk is minimal; rotate before any future service-role / direct-DB work.
- [ ] **Decide window** — pick a low-traffic time for the Vercel deploy

Wait for explicit `Authorise Stage 2` instruction in a fresh prompt before any further action.
