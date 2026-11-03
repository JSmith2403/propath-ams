# Coach dashboard + Garmin interpretation + coach visibility — design

Date: 2026-11-04 · Status: **proposal, nothing built** · Author: Claude (design fork) · For: Jonah

Scope: (1) how Garmin numbers become coach-usable signals, (2) who may see what, (3) a redesigned "one sheet" coach dashboard, (4) a phased plan that can ship straight to `master`, (5) the few decisions that are genuinely Jonah's.

---

## 0. TL;DR

* **The dashboard becomes an athlete-centred sheet**, not four topic panels. A big **Athlete Overview grid** (one compact card per athlete: sessions this week · subjective wellness · Garmin readiness · nutrition · attendance) plus a **"Who needs attention"** queue and an **"Attending later this week"** panel. Summary tiles shrink to one slim row of clickable filters.
* **Three of the things you asked for need no Garmin data and can ship first**: *needs a new programme*, *needs chasing for wellness*, *who is attending later in the week*. The data is already in the database; the live numbers (below) show why they matter: **7 of 14 programming-active athletes have no session planned after today**, **only 4 of 16 completed wellness today**, and **no timetable is published for this week**.
* **Garmin is interpreted against each athlete's own rolling baseline, not absolute numbers.** Raw Garmin rows stay in `garmin_daily`; masking (the athlete's Yes/No switches) and baselines are computed in SQL; thresholds and the traffic-light live in a pure, unit-tested JS module so they can be tuned without migrations. Garmin "objective" readiness is shown *next to* the athlete's "subjective" check-in, and a mismatch is itself a flag.
* **Visibility recommendation: keep core academy data open to all coaches; add a named-coach allow-list only for the genuinely sensitive categories (menstrual data first).** Build a small `coach_athlete_access` table now (it also powers a "My athletes" dashboard filter), default behaviour unchanged.
* **Two defects found in the current dashboard** (fix in Phase 0/1): the *Athlete Wellness* panel reads a **legacy table (`wellness_submissions`, 2 rows from April)** so it shows "No check-in" for everyone; and `planned_sessions.status` is **not kept in sync** with completed sessions (506 past sessions still say `planned`), so "completed vs planned" must come from `session_logs`.

---

## 1. What exists today (findings, from code + live DB read on 2026-11-03/04)

### 1.1 Current dashboard (`src/components/dashboard/*`, `src/hooks/useUpdatesDashboard.js`)

| Panel | File | Data | Notes |
|---|---|---|---|
| Recent Updates | `RecentUpdatesCard.jsx` → `useRecentUpdates({sessionsOnly})` | `session_logs`, `athlete_e1rm`, `set_logs` | Completed sessions only; one row per session. |
| Nutrition Submissions | `NutritionCard.jsx` ← `useUpdatesDashboard` | `meal_entries`, `meal_photos`, `water_intake_logs`, `nutrition_settings` | Works; has 3 big stat tiles. |
| Athlete Wellness | `WellnessInsightsCard.jsx` ← `useUpdatesDashboard` | **`wellness_submissions` (legacy)** + `garmin_daily_for()` | **Broken for real data** — see 1.2. |
| Wellness Compliance | `ComplianceCard.jsx` → `useWellnessAdherence` | `wellness_responses`, `wellness_tokens`, `athlete_app_tokens` | Works; has the real "Send reminder" (`POST /api/push/send`). |

Layout: `UpdatesDashboard.jsx`, 2×2 grid, `xl:` fixed to the window, panels scroll internally. A lot of vertical space is spent on `DashCard` headers/subtitles and big stat blocks.

Existing reusable pieces: `parts.jsx` (`Avatar`, `Chip`, `DashCard`, `Scroll`, `RAG` colours, `relTime`), `utils/wellnessRag.js` → `getRagColour(value, question)` (per-question thresholds), `useWellnessRoster` / `useWellnessAdherence`, `usePlannedSessions`, `useActiveProgrammingAthletes`, `useTrainingBlocks`, `useRecentUpdates`, `TimetableView` queries, `/api/push/send`, `utils/uaeTime`-style helpers in `utils/timetable.js`.

### 1.2 Live numbers (2026-11-03) and what they imply

| Fact | Value | Implication |
|---|---|---|
| Athletes | 17 (1 archived), 16 with athlete app active | Dashboard must exclude archived (`athletes.data.is_archived`). |
| `wellness_responses` (current model) | 127 rows, 6 May → 3 Nov; **4 today; 4 distinct athletes in last 7 days** | Chasing list is long (≈12) — needs priority + "do not nag" rules. |
| `wellness_submissions` (legacy) | **2 rows (Apr 14–15)** | The *Athlete Wellness* panel and `useRecentUpdates`' wellness items read this → effectively empty. **Defect.** |
| Wellness question library | 14 active questions; sliders 1–7 with `direction` + `rag_thresholds`; hours-slept `number` (green ≥7, amber ≥6); `yes_no` pain question (`no_better`) | Subjective RAG already well-defined — reuse `getRagColour`. |
| `programming_settings` | 14 athletes `programming_active` | "Needs programming" applies to these 14. |
| Future planned sessions | **7 of 14 have none ≥ today**; 2 more run out within 7 days; 4 within 14 | The "needs a new programme" list is real and large. |
| `planned_sessions.status` | 21 `completed`, 551 `planned`; **506 past-dated still `planned`**; `missed` never set | Status is unreliable. |
| `session_logs` completed | 153 (124 linked to a `planned_session_id`) | Completed-vs-planned must join `session_logs`; 29 are unlinked/ad-hoc. |
| This week | 19 planned (8 athletes); 4 completed (2 athletes) | Typical "x of y this week" numbers will be small — design for that. |
| `planned_sessions.attendance` | all NULL | Per-session attendance column is unused; **group-session attendance lives in the timetable tables**. |
| Timetable | 16 slots, all published, **all 5–15 Oct**; **0 future published slots**; 10 responses | "Attending later this week" is empty until a timetable is published each week (process dependency). |
| `athletes.data.coach` | free text on 3 athletes ("Jonah", "Jonah Smith", "Ned Mills") | A rudimentary coach assignment already exists, inconsistent. |
| Staff | 1 `admin`, 4 `co_admin`; `provider_allocations` = 0 | `is_staff()` = admin or co_admin → **all staff see all athletes today**. |
| Garmin | 1 connection (Pro Pathius); 1 `garmin_daily` row; delivery is push-only, no history | Baselines do not exist yet; design must degrade gracefully (§2.7). |
| Indexes | `planned_sessions(athlete_id, planned_date)`, `session_logs(athlete_id, started_at desc)`, `wellness_responses(athlete_id, submission_date)`, `meal_entries(athlete_id, log_date desc)`, `garmin_daily(athlete_id, day desc)`, `timetable_responses(athlete_id)` | The queries in §4 are already index-friendly; no new indexes required for Phase 1. |

---

## 2. Garmin interpretation model

### 2.1 What we have and what each number is for

Source: `garmin_daily` (one row per athlete-day, calendar date = the day the athlete *woke up* for sleep/HRV), `garmin_activities`, `garmin_snapshots`. Coaches read through `garmin_daily_for()` / `garmin_snapshots_for()`, which blank anything the athlete switched off.

| Signal | Column(s) | Switch (`garmin_connections.share`) | Why a performance academy cares | Caveats |
|---|---|---|---|---|
| Sleep duration / score | `sleep_seconds`, `sleep_score` | `sleep` | Recovery capacity; short sleep predicts poor session quality and injury risk in young athletes | Needs the watch worn overnight. |
| Overnight HRV | `hrv_last_night` (`hrv_weekly_avg`, `hrv_status` are usually NULL — the push only carries last-night average) | `sleep` | Best single autonomic-recovery marker — **only meaningful vs the athlete's own baseline** | Must compute our own baseline. |
| Resting HR | `resting_hr` | *(always shared)* | Elevated RHR = fatigue, illness, under-recovery | Reliable; available even if the athlete hides sleep. |
| Body Battery high / low | `body_battery_high/low` (from Stress Details) | `body_battery` | "Charge at wake" (high) and end-of-day drain (low) | Daily max is a good wake-charge proxy only once the morning has happened. |
| Stress (average) | `avg_stress` | `stress` | Life/training load; sustained high stress blunts recovery | Day average includes sleep; compare to baseline. |
| Breathing rate | `resp_avg` | `vitals` | Early illness/overreach sign | Stage B; needs data. |
| Blood oxygen | `spo2_avg`, `spo2_min` | `vitals` | Illness/altitude; low min is a red flag | Optional device feature; battery cost. |
| Health Snapshot | `garmin_snapshots` | `vitals` | On-demand 2-min reading (HR, HRV, resp, SpO2, stress) | Only when the athlete takes one. |
| VO2 max / fitness age | `vo2_max`, `fitness_age` | `fitness` | Slow trend for the Progress tab, not a daily flag | Moves over weeks. |
| Workouts / load | `garmin_activities` (+ `session_logs.session_rpe × duration_minutes` for programme sessions) | *(always shared)* | Load vs recovery | Use **sRPE load from `session_logs`** as the load source of truth (exists for every athlete); use Garmin activities only for non-programme sessions/extra work. |
| Menstrual cycle | **not stored** (Stage C) | `womens_health` | Training/recovery planning | Strict handling — §3.4. |

### 2.2 Baselines (the key idea)

A number only means something against the athlete's own normal. For each athlete and metric:

* **Baseline = median of the previous 28 calendar days (excluding "today"), using only days that have a value.** Median, not mean, so one bad night doesn't drag the baseline. Spread = **MAD** (median absolute deviation) for HRV.
* **Minimum data rule:** a baseline is "valid" with **≥ 7 values in the window** (≥ 14 for "established"). Below that the athlete shows *"Building baseline (n/7)"* and only **absolute** flags (sleep hours, body battery, SpO₂ min) are produced.
* **Window length:** 28 days for HRV/RHR/stress/sleep/resp; 14 days is used as a *recent* comparator (so a slow drift shows).
* **Today's value** = today's row if it has the metric, else yesterday's if < 36 h old (labelled "yesterday"), else "no recent data".
* **3-night trend:** mean of last 3 values vs baseline (a single night is noisy; a 3-night run below baseline is the real signal).

### 2.3 Component thresholds (defaults — tune with real data; they live in one constants block)

| Component | Green | Amber | Red | Notes |
|---|---|---|---|---|
| **HRV** (last night ÷ 28-d median) | ≥ 0.95 | 0.85–0.94 | < 0.85 | Also amber if 3-night mean < 0.90 even if tonight is fine. Needs valid baseline. |
| **Resting HR** (today − 28-d median) | ≤ +3 bpm | +4 to +6 | ≥ +7 | Absolute fallback: RHR ≥ 100 → amber (data glitch/illness). |
| **Sleep duration** | ≥ 7.0 h | 6.0–6.9 h | < 6.0 h | Matches the existing wellness question thresholds (green ≥7, amber ≥6) so objective and subjective speak the same language. |
| **Sleep score** (Garmin 0–100) | ≥ 70 | 60–69 | < 60 | Secondary; only used if duration missing. |
| **Body Battery high** (wake charge) | ≥ 75 | 50–74 | < 50 | Garmin's own bands: 76–100 high, 51–75 medium, 26–50 low. |
| **Stress avg** | ≤ baseline + 5 | + 6 to + 12 | ≥ + 13 | Absolute guard: avg ≥ 60 → amber regardless. |
| **Breathing rate** | ≤ baseline + 1.5 | + 1.6 to + 2.5 | ≥ + 2.6 br/min | Stage B. |
| **SpO₂** | min ≥ 94 % | min 90–93 % | min < 90 % | Absolute (no baseline needed). |

### 2.4 Composite "objective readiness" (traffic light)

Score = Σ(points × weight), using only **visible, present** components:

* points: green 0 · amber 1 · red 2
* weights: HRV 2.0 · Resting HR 1.5 · Sleep 1.0 · Body Battery 1.0 · Stress 0.5 · (Breathing 0.5 · SpO₂ 0.5 when shared)
* **Red** if score ≥ 4.0 **or** HRV is red together with RHR amber/red · **Amber** if score ≥ 2.0 · **Green** otherwise.
* **Insufficient** (grey, "n/5 signals") if fewer than 2 components are available. The tile says how many signals it is based on, so a green built on one number does not look like one built on five.
* The displayed reason is the top contributor, e.g. *"HRV 71 vs 82 normal (−13 %), resting HR +5"*.

### 2.5 Pattern flags (go to the attention queue, not just the colour)

| Flag | Rule (needs the data present and shared) | Severity |
|---|---|---|
| **Possible illness** | ≥ 2 of: RHR ≥ +5 bpm · HRV < 0.85× baseline · breathing ≥ +2 br/min · SpO₂ min < 94 % — on the same day | Red |
| **Accumulating fatigue** | HRV 3-night mean < 0.90× baseline **and** RHR ≥ +3 for 2+ consecutive days | Amber |
| **Chronic short sleep** | Sleep < 6.5 h on ≥ 3 of the last 5 nights | Amber |
| **Sleep disruption** | Sleep ≥ 9 h with score < 60 (unusual) | Info |
| **Load spike** (optional, Phase 5) | 7-day sRPE load ÷ 28-day weekly average > 1.5 | Amber |
| **Low body battery at wake** | BB high < 50 two days running | Amber |

### 2.5b Garmin (objective) vs check-in (subjective)

Subjective colour = **worst** `getRagColour()` across the athlete's answered rated questions today (same rule the current `formRag` uses), plus the pain question: `yes` → red regardless.

| Objective | Subjective | Show | Queue |
|---|---|---|---|
| Red/Amber | Green | ⚠ **"Says fine, body says no"** | Yes — "check in with them" |
| Green | Red/Amber (or pain = yes) | ⚠ **"Feels poor, metrics normal"** | Yes — wellbeing/psychosocial, not load |
| Agree (both red) | — | Strong flag | Top of queue |
| One side missing | — | Show the available side + "no Garmin" / "no check-in" | Only the "missing" nudges |

### 2.6 Missing and partial data (all explicit states — no silent blanks)

| State | Detected from | Tile shows | Queue |
|---|---|---|---|
| Not connected | no `garmin_connections` row, or `status = 'disconnected'` | "Garmin: not connected" (neutral grey) | Optional low-priority "invite to connect" (off by default) |
| Connected, no data yet | `connected` and no `garmin_daily` row | "Connected — waiting for first sync" | — |
| Connected but silent | `last_sync_at` (or newest `day`) older than **2 days** | "No Garmin data (N days)" amber | Yes — "ask them to sync their watch" |
| Category switched off | switch false → column NULL via `garmin_daily_for` | Component greyed with a small lock, "not shared" | None. **Never infer** — composite and flags are computed only from visible components. |
| Baseline building | < 7 valid values | "Building baseline (n/7)" + absolute-only flags | — |

### 2.7 Where each calculation lives (and why)

| Piece | Lives in | Reason |
|---|---|---|
| Masking by athlete switches | SQL — already in `garmin_daily_for()` / `garmin_snapshots_for()` | Security boundary; must not be bypassable from the browser. |
| **Baselines** (median/MAD/n over 28 d) | **New SQL function `garmin_baselines_for(p_athlete_ids text[], p_asof date default current_date, p_days int default 28)`** — `STABLE SECURITY DEFINER`, applies the *same* switch masking, `percentile_cont(0.5)`; returns one row per athlete | Keeps raw history server-side; baselines can never include data the viewer may not see (no leakage through derived numbers). Cheap: ≤ 28 rows × ≤ 100 athletes. |
| **Connection state** | **New SQL function `garmin_roster_status(p_athlete_ids text[])`** → `athlete_id, connected, status, last_sync_at, share jsonb` (staff or own only) | `garmin_connections` is server-only; today only `garmin_status(one athlete)` exists. The dashboard needs the whole roster in one call. |
| **Classification / thresholds / composite / flags** | **Pure JS module `src/utils/garminSignals.js`** (`classifyAthlete(daily, baseline, status, subjective) → { readiness, components[], flags[], reason, basedOn }`) with unit tests | Thresholds will be tuned weekly; no migration needed; trivially testable with fixtures (we have almost no real data yet). |
| Orchestration | New hook `src/hooks/useGarminSignals.js` → 3 RPCs (`garmin_daily_for` last 30 d, `garmin_baselines_for`, `garmin_roster_status`) | One round-trip batch per refresh. |
| Rendering | Components only format; they never compute | |

**Performance.** All reads are indexed, bounded by `athlete_id = ANY(...)` and a 30-day window (~500 rows for today's academy). Compute on read; refetch every 5 min and on tab focus. **No materialised table until > ~100 athletes**; if/when needed, add `garmin_signals_daily` written by the webhook (trigger) — the JS classifier and the UI stay unchanged. Do not store computed flags permanently: they are derived, tunable, and would bypass the athlete switches if cached unmasked.

---

## 3. Coach visibility model

### 3.1 Today
`is_staff()` = `admin` or `co_admin` → every staff member can read every athlete's data in every table (wave-2 policies are `is_staff()`-based); athletes see only their own; providers (`external`) see only `provider_allocations` (none yet). The Garmin switches are an *athlete-controlled* first gate.

### 3.2 Options

| Option | Description | Pros | Cons |
|---|---|---|---|
| **A. Open to all coaches** (status quo) | Every coach sees everything the athlete has consented to | Simple; covers holidays/illness; academy is small (5 staff, 17 athletes) | No way to restrict sensitive data; every coach sees every athlete's health data |
| **B. Per-athlete assignment** | Coaches only see athletes they're assigned | Strong least-privilege | Rewrites ~40 wave-2 policies; breaks cover when someone is away; high operational cost; admin overrides add complexity |
| **C. Tiered by data category** *(recommended)* | Core academy data (programme, sessions, attendance, nutrition, check-ins, Garmin general metrics) stays open to all staff, **gated by the athlete's switches**; **sensitive categories** (menstrual data now; medical/safeguarding later) require an **explicit named-coach allow-list** per athlete | Minimal disruption; protects exactly what needs it; reuses the switches the athletes already control; assignments also give a "My athletes" dashboard filter | One new table + a few functions; a second, stricter gate to explain |

### 3.3 Recommendation: Option C, built on a light assignments table

```sql
-- sql/coach_access_<date>.sql  (additive; default behaviour unchanged)
CREATE TABLE public.coach_athlete_access (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id    text NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  relationship  text NOT NULL DEFAULT 'support' CHECK (relationship IN ('lead','support')),
  can_see_cycle boolean NOT NULL DEFAULT false,   -- named-coach allow-list for menstrual data (athlete consent still required)
  created_by    uuid DEFAULT auth.uid(), created_at timestamptz DEFAULT now(),
  UNIQUE (coach_user_id, athlete_id)
);
-- RLS: staff read; admin write (UI: Users page / athlete profile "Coaches" chips). Server-only for athletes/providers.

CREATE FUNCTION public.is_my_athlete(a text)        -- assigned to me (any relationship)
CREATE FUNCTION public.can_see_cycle(a text)        -- is_staff() AND assignment with can_see_cycle  (admin only if named)
CREATE FUNCTION public.staff_can_see(a text)        -- is_staff() AND (app_settings 'visibility_mode'='open' OR is_my_athlete(a) OR admin)
```

* **Mode flag** `app_settings.visibility_mode = 'open' | 'assigned'` (default `'open'`). In `open` nothing changes for core data. `assigned` exists so tightening later is a setting + policy wave, not a redesign.
* **Plug-in points:** new Garmin functions (`garmin_daily_for`, `garmin_snapshots_for`, `garmin_baselines_for`, `garmin_roster_status`, and the future cycle functions) use `staff_can_see(a)` instead of bare `is_staff()`; cycle functions additionally require `can_see_cycle(a)`. `can_see_athlete(a)` is **unchanged** for now; the ~40 wave-2 table policies keep `is_staff()` until a deliberate "assigned" wave (not recommended yet).
* **Dashboard:** "My athletes / All athletes" toggle (default *My athletes* if the coach has any assignments) driven by `coach_athlete_access`, available even in `open` mode — it makes each coach's one-screen view fit.
* **Backfill:** `athletes.data.coach` is free text on 3 athletes ("Jonah", "Jonah Smith", "Ned Mills"). Map by `user_roles.full_name` (exact/normalised), insert as `lead`, leave the rest unassigned and let Jonah assign via UI. Keep the text field for now; do not delete.

### 3.4 Stage C (menstrual cycle) — pending decision resolved by this model
* Stored in a **separate table** (`garmin_cycle`) with **no staff `SELECT` policy at all**; reads only via `garmin_cycle_for(p_athlete_ids)` which requires **all of**: athlete switch `womens_health = true` **and** `can_see_cycle(a)` **and** `staff_can_see(a)`; athlete sees own rows always.
* Never shown on the squad dashboard, never in flags/attention queue text, never included in readiness; at most a small per-athlete card inside the athlete profile for named coaches.
* Receiver already skips these data types (never stored or sampled). Stage C changes that only after the consent copy, the table and the gate are live and tested.
* **Admin does not auto-see cycle data** (recommended): the admin must be named like anyone else.

### 3.5 Safe migration path
1. Create table + functions + `visibility_mode='open'` (no behaviour change; persona-tested).
2. Backfill the 3 known assignments; UI to manage chips; "My athletes" filter.
3. Switch Garmin functions to `staff_can_see()` (identical results in `open`).
4. Stage C uses `can_see_cycle`.
5. Only if Jonah later wants it: flip `visibility_mode='assigned'` after a dedicated policy wave with persona tests.

---

## 4. Dashboard specification

### 4.1 Layout (desktop ≥ 1280 px; one screen, regions scroll internally)

```
┌ slim header: greeting · "My athletes ▾ / All" · date range (This week) ─────────────────── [Refresh ⟳] ┐
│ chips (filters, ~34 px tall): ⚠ Needs programming 7 │ ✎ Wellness not done 12 │ ❤ Low readiness 0 │ ✖ Missed 3 │ ⏰ Attending today 9 │
├───────────────────────────────────────────────────────────────┬──────────────────────────────────────────┤
│ ATHLETE OVERVIEW  (≈62% width, scrolls)                       │ WHO NEEDS ATTENTION (≈38%, scrolls)       │
│ ┌──────────┐┌──────────┐┌──────────┐  (3–4 cards per row)      │ ▍Sara Ali — No programme after today  [Open]│
│ │ Avatar   ││          ││          │                           │ ▍Zach P. — Wellness overdue 2d [Remind]   │
│ │ Name·Cohort                                                  │ ▍Maggie — Garmin: HRV −14 %, RHR +6 [Open]│
│ │ Sessions ▰▰▱ 2/3   Wellness ● today                          ├──────────────────────────────────────────┤
│ │ Garmin ● HRV 71 · 6h40 · BB 82   Food ● 2 meals  Week ▮▮▯▯▯ │ ATTENDING LATER THIS WEEK                  │
│ └──────────┘                                                   │ Wed ▸ 16:00 Group (9) · 17:00 Group (6)    │
│                                                                │ Thu ▸ …   Not answered: Aria, Titus (+3)   │
├────────────────────────────────────────────────────────────────┴──────────────────────────────────────────┤
│ RECENT UPDATES (one line each, horizontally compact; scrolls): Mahra completed Session 2 · RPE 9 · 67 min … │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

* Palette: ProPath gold `#A58D69` (primary/active), teal `#437E8D` (data/positive), deep teal `#085777` (avatar/headers), amber `#C9982E` (warning), `RAG` colours from `parts.jsx` for status dots. Panel headings are one line, 13 px, no subtitles. Stat tiles are **chips** (counts that filter the grid), not cards.
* Space budget: header + chips ≈ 90 px; the remaining height is split grid/queue; Recent Updates is a 120 px strip. Greeting subtitle and per-panel subtitles are removed.
* **Mobile (< 768 px):** single column in this order — filter chips (horizontal scroll) → **Who needs attention** (collapsible, first 5) → **Athlete Overview as a one-column list** (card collapses to name + 5 dots; tap to expand numbers) → **Attending later this week** → Recent updates (first 10). Same data, same hooks.
* Tap targets ≥ 44 px; the existing bottom nav (`pb-24 md:pb-0`) is kept.

### 4.2 Athlete card (each is derived from one `AthleteRow` object built by `useDashboardData`)

| Cell | Shows | Source / computation | New vs existing |
|---|---|---|---|
| Identity | Avatar, name, cohort, coach chips | `athletes` (existing list from `App.jsx`); coach chips from `coach_athlete_access` | chips new |
| **Sessions this week** | `done / planned` + 7-dot strip (Mon–Sun) | planned: `planned_sessions` where `planned_date` in week (existing `usePlannedSessions`); done: `session_logs` where `completed_at` not null **joined by `planned_session_id`**, plus unlinked logs counted as "extra" | join logic new (small); data existing |
| **Subjective wellness** | RAG dot + "today / yesterday / 3d ago / overdue" + pain flag | `wellness_responses` latest + `wellness_question_library` → `getRagColour` worst-of; pain `yes_no`=yes → red | **replaces** legacy `wellness_submissions` read; util existing |
| **Garmin (objective)** | readiness dot + 3 key numbers (HRV, sleep h, body battery) or state text | `useGarminSignals` → `classifyAthlete()` | new (Phase 2) |
| Nutrition | meals logged today / pending review | existing `useUpdatesDashboard.nutrition` (per athlete) | derive per athlete |
| Attendance | this week: "attending X of Y slots", or "no answer" | `timetable_responses` + `timetable_slots` | new light query |
| Alert badge | count of open attention items | `useAttention` | new |

Ordering: **attention-first** (most severe items first) then name; filter chips and "My athletes" narrow the set. Clicking a card opens the existing athlete profile (`onNavigateToAthlete`).

### 4.3 "Who needs attention" queue

Built by a pure function `buildAttention(rows, now)` in `src/utils/attention.js` (unit-tested), rendered by `AttentionQueue.jsx`. Each item = `{ athleteId, kind, severity, text, action }`.

| # | Kind | Rule | Severity | Primary action |
|---|---|---|---|---|
| 1 | **Medical/pain** | today's pain `yes_no` = yes, or red on soreness/medical | Red | Open athlete → Wellness |
| 2 | **Possible illness / low readiness** | Garmin pattern flag (§2.5) | Red/Amber | Open athlete |
| 3 | **Needs a new programme** | `programming_active` and **no `planned_sessions` on/after tomorrow** | Red | **Open Programme** for that athlete |
| 3b | **Programme running out** | last planned date ≤ today + 7 (or current block ends ≤ 7 d with no following block) | Amber | Open Programme |
| 4 | **Chase wellness** | active athlete app, no `wellness_responses` today **after 09:00 UAE**; escalate at 2 missed days | Amber → Red | **Send reminder** (existing `POST /api/push/send`) |
| 5 | **Missed session** | planned date in the last 3 days, no linked completed `session_log`, no `not_attending` response | Amber | Message / open week |
| 6 | **Garmin silent** | connected, no data ≥ 2 days | Amber | "Ask to sync" (message) |
| 7 | **Subjective vs objective mismatch** | §2.5b | Amber | Open athlete |
| 8 | **Timetable unanswered** | published slots this week, athlete eligible (cohort) but no response; Sunday 3 pm → Tuesday | Info | Send reminder |

Rules to stop noise: one row per athlete per kind; **collapse repeats** ("Send reminder to all (12)" as the existing button does); a reminder sent today greys the row (persist later via `dashboard_nudges`, Phase 5); archived and wellness-disabled athletes never appear.

**"Needs programming" definition (concrete, uses existing data):**
`needs_programming = programming_active AND NOT EXISTS (planned_sessions WHERE athlete_id = a AND planned_date > current_date)` → red.
`runway_short = programming_active AND max(planned_date) BETWEEN today AND today+7` → amber. (Today: 7 red, 2 amber, 4 within 14 days.)
Block-end check uses `training_blocks.end_date` (FreeForm blocks excluded) as a secondary hint only, because FreeForm weeks are plumbing, not coach-planned blocks.

### 4.4 "Attending later this week" panel

* Data: `timetable_slots` (published, this week, today onward) + `timetable_responses` for those slot ids (staff RLS allows both; same queries as `TimetableView.jsx`). Eligible athletes per slot = cohort rule already in `utils/timetable.js` (`cohorts = {}` → everyone; else `athletes.data.cohort`).
* Display: day rows (today → Sunday), each slot as a chip `16:00 Group — 9 attending · 3 unanswered`; click expands names (avatars). "Not answered" list at the bottom with **Send reminder** (same push endpoint) — mirrors the Sunday cron's targeting.
* Responses: `attending` = row with `status='attending'`; `'not_attending'` with note `__other__` means "chose the other session that day" (do not show as absent); explicit not-attending notes show as reasons.
* **Empty state (current reality):** "No timetable published for this week" + button → Timetable page. (0 future published slots today — this panel only becomes useful once a timetable is published weekly.)
* Refresh: 60 s while visible (TimetableView uses 30 s).
* New work: one small hook `useWeekAttendance(ids)`; reuses existing tables/RLS; no schema change.

### 4.5 Tiles — source, query, refresh, empty/error, status

| Tile | Source | Query / function | Refresh | Empty state | Error state | Status |
|---|---|---|---|---|---|---|
| Filter chips | derived from the rows below | counts only | with data | "0" muted | hidden | new (trivial) |
| Athlete list | `App.jsx` `visibleAthletes` | — | existing | "No athletes" | existing | built |
| Sessions this week | `planned_sessions` + `session_logs` | `planned_date between monday and sunday`; `session_logs where completed_at >= monday and athlete_id = any(...)` | 60 s + focus | "No sessions planned" (this feeds *Needs programming*) | "Couldn't load sessions" + retry | partly built (hook), join new |
| Subjective wellness | `wellness_responses`, `wellness_question_library` | latest ≤ 7 d per athlete | 60 s | "No check-in yet" (grey) | grey + tooltip | **fix**: switch from legacy table |
| Wellness compliance / chase | `useWellnessAdherence` | existing | 60 s | "Wellness not switched on" | existing | built |
| Garmin readiness | `garmin_daily_for` (30 d), `garmin_baselines_for`, `garmin_roster_status` | 3 RPCs | 5 min + focus | states in §2.6 | "Garmin unavailable" muted, never blocks the grid | **new** (Phase 2) |
| Nutrition | `meal_entries`, `water_intake_logs`, `nutrition_settings` | existing `useUpdatesDashboard` | 60 s | "Not logging" | existing | built |
| Attendance this week | `timetable_slots/responses` | see 4.4 | 60 s | "No timetable published" CTA | retry | new hook |
| Needs programming | `programming_settings`, `planned_sessions`, `training_blocks` | pure `programmingRunway(rows, today)` | 60 s | "Everyone has sessions planned 🎉" | falls back to "unknown" per athlete | **new**, no DB change |
| Recent updates | `useRecentUpdates` (sessions, PBs, meals, planned changes) | existing; **point its wellness items at `wellness_responses`** | 60 s | "Nothing yet today" | existing | built (+ one fix) |

All hooks follow one pattern: batch `.in('athlete_id', ids)`, cancel on unmount, `visibilitychange` refetch, and **fail soft per tile** (an error in Garmin must never blank the sessions grid). Realtime is optional and, if added, must use `uniqueChannelName()` (`src/lib/realtime.js`).

### 4.6 Works for coaches with different visibility
* The dashboard asks only for `athlete_id = any(visibleAthletes)` and calls RPCs that already mask by switches and (after §3) by `staff_can_see()`; a coach never receives data the database will not give them — the UI just renders what returns.
* "My athletes" filter: default for coaches with assignments; **All athletes** always available while `visibility_mode='open'`.
* Garmin tiles show a lock icon for categories an athlete has hidden — the same on every coach's screen — and nothing is inferred from other fields.
* External providers (`role='external'`) keep their existing restricted view (they only see allocated athletes; the dashboard is staff-only today).

### 4.7 Files (proposed)
`src/components/dashboard/`: `AthleteOverviewGrid.jsx`, `AthleteCard.jsx`, `AttentionQueue.jsx`, `AttendingThisWeek.jsx`, `CompactUpdates.jsx`, `FilterChips.jsx`; keep `parts.jsx`, `ComplianceCard` logic (reuse its `remind`), `NutritionCard` (reused as a detail drawer / "View all").
`src/hooks/`: `useDashboardData.js` (orchestrates), `useWeekAttendance.js`, `useGarminSignals.js`.
`src/utils/`: `programmingRunway.js`, `attention.js`, `garminSignals.js`, `weekSessions.js` (+ `*.test.js` each).
`sql/`: `dashboard_garmin_signals_<date>.sql`, `coach_access_<date>.sql`.

---

## 5. Phased plan (each phase safe to push to `master` on its own)

| Phase | Content | DB change? | Effort | Risk | Test |
|---|---|---|---|---|---|
| **0 — Fix wrong data** (½ day) | Point *Athlete Wellness* and `useRecentUpdates` wellness items at `wellness_responses` + `getRagColour`; exclude archived athletes from dashboard lists | No | S | Low (display only) | unit test the response→RAG mapping with the real response shape; browser check with mocked data |
| **1 — The sheet + quick wins** (2–3 days) | New layout; Athlete Overview grid (sessions, subjective wellness, nutrition, attendance); filter chips; **Attention queue: needs programming, chase wellness (existing reminder), missed sessions, timetable unanswered**; **Attending later this week**; compact Recent Updates; old panels stay reachable via "View all". **No Garmin dependency.** | No (optional: index none needed) | M | Medium (big UI change) — keep the old dashboard behind a `?classic=1` switch for a week | unit tests for `programmingRunway`, `weekSessions`, `buildAttention`; mocked-data browser harness (desktop + 375 px); real-data sanity: expect 7 red "needs programming", ≈12 wellness chases |
| **2 — Garmin signals** (3 days) | SQL `garmin_baselines_for`, `garmin_roster_status`; `garminSignals.js` + tests; Garmin cell + readiness dot; flags and mismatch into the queue; baseline-building states | Yes (additive functions) | M | Medium: masking leakage → mitigated by computing only from masked outputs | **Rolled-back persona SQL tests** (athlete / coach with switches off / anon / other athlete) as used for `garmin_daily_for`; JS fixtures for each threshold; verify with Data Generator + Pro Pathius |
| **3 — Coach access table + "My athletes"** (2 days) | `coach_athlete_access`, helpers, `visibility_mode='open'`, backfill from `athletes.data.coach`, UI chips, dashboard filter; Garmin functions switched to `staff_can_see()` | Yes (additive) | M | Low in `open` mode | persona tests proving *identical* results in `open`; tests that an unassigned coach still sees all in `open`; admin-only writes |
| **4 — Stage C: cycle data** (4 days) | `garmin_cycle` table, `garmin_cycle_for` (switch ∧ named coach), receiver mapping, consent copy, small card in athlete profile | Yes | L | **High (sensitive)** | persona tests incl. "admin not named sees nothing", "named coach + switch off sees nothing", "athlete sees own"; legal/privacy read of the policy page |
| **5 — Polish** | `dashboard_nudges` (persist reminders), `planned_sessions.status` sync trigger + nightly "missed" marking, load spike (sRPE ratio), coach push on red flags, per-athlete drill-down | Yes | M | Low–medium | as above |

Order rationale: Phase 0–1 deliver what Jonah asked for first (programming, chasing, attendance) using data we already trust; Phase 2 can wait for a week of real Garmin data (baselines need ≥ 7 days); Phase 3 precedes Phase 4 by design.

Rollback: every phase is additive; Phase 1's `?classic=1` switch and additive SQL mean a revert is a code revert only.

---

## 6. Open questions (only the ones that change the build)

1. **Visibility.** Confirm **Option C**: all coaches keep seeing core data (athlete switches still apply); sensitive categories (menstrual first) via a named-coach allow-list. *Default: yes.* Sub-question: should **admin** see cycle data automatically? *Default: no — only if named.*
2. **"Needs programming" threshold.** Red = no session after today; amber = programme ends within **7 days**. Would you rather 10 or 14 days of runway? *Default: 7.*
3. **Wellness chasing.** Start chasing from **09:00 UAE**, escalate after **2 missed days**, one reminder per athlete per day. Are check-ins expected **every day including weekends**? *Default: every day.*
4. **Timetable.** The "attending later this week" panel is empty until a timetable is published (none for this week). Are group sessions **the same every week**? If so I can add "copy last week's timetable / recurring template" as a small follow-up. *Default: show an empty-state link to Timetable; offer the template later.*
5. **What coaches see from Garmin.** Numbers + colour for categories the athlete shares, colour/lock only for the rest. Also, should a **red readiness flag push-notify** the assigned coach(es)? *Default: show in queue only; no push until Phase 5.*
6. **Assignments.** I will backfill the 3 athletes with a `coach` text value; you assign the rest in the UI. Which coach is **lead** for each athlete? *Default: whoever is named in `athletes.data.coach`; others unassigned.*

---

### Appendix A — Real data shapes the design relies on
* `wellness_responses.responses` = jsonb `{ <question_id>: value }` (e.g. hours-slept `number`, 1–7 sliders, `yes_no`); `wellness_question_library`: `label, question_type, direction (higher_better|lower_better|no_better), rag_thresholds {green_boundary, amber_boundary}, category (lifestyle|physical|medical)`.
* `planned_sessions`: `athlete_id, planned_date, week_number, status, block_id, block_session_id, attendance (unused)`; `session_logs`: `planned_session_id, completed_at, session_rpe, duration_minutes`.
* `timetable_slots`: `slot_date, start_time, end_time, title, kind, cohorts text[], published_at`; `timetable_responses`: `slot_id, athlete_id, status (attending|not_attending), note ('__other__' = chose another session)`.
* `garmin_daily_for()` returns: `steps, resting_hr, avg_stress, body_battery_high/low, active_kcal, sleep_seconds, sleep_score, hrv_last_night, hrv_weekly_avg, hrv_status, resp_avg, spo2_avg, spo2_min, vo2_max, fitness_age` (switched-off columns NULL for coaches).
* Garmin daily push also carries (not yet stored) min/avg/max HR, floors, distance, intensity minutes — available if wanted for the load view.

### Appendix B — Assumptions to verify once real Garmin data exists
Threshold defaults in §2.3 are starting points from general sport-science practice and Garmin's own band definitions, not validated on this squad. Review after ~4 weeks of data: expected green/amber/red split should be roughly 70/25/5; if far from that, adjust the constants in `garminSignals.js`.
