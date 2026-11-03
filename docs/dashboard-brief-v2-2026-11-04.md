# Coach dashboard — brief v2: "run the week, decide today"

Date: 2026-11-04 · Status: **proposal, nothing built** · For: Jonah
Supersedes the layout (§4) and Garmin thresholds (§2.3–2.5) of `dashboard-and-garmin-design-2026-11-04.md`. The visibility model (§3) and phasing mechanics in that doc still stand.

---

## 0. One paragraph

The dashboard has one job: **let a coach run this week and decide what to do today.** It answers five questions and nothing else: *Who is in, Mon–Fri? Who has done their sessions? Who needs a programme? Who needs chasing? Who should I talk to before they train (readiness)?* Everything about an individual's long-term progress (e1RM, PBs, VO2 max, body composition, trends) lives in their profile and stays off this sheet. Meals move to a nutritionist's own tab. Garmin (objective) and the daily check-in (subjective) are combined into **one readiness signal per athlete, judged against that athlete's own normal using rolling averages and a smallest-worthwhile-change band**, and each state tells the coach what to *do*, not just what colour it is.

---

## 1. What is on the sheet, and what is deliberately not

| On the sheet (it changes what a coach does this week) | Off the sheet (lives elsewhere) |
|---|---|
| **The week board**: athlete × Mon–Fri, what each person is doing each day and whether it happened | Individual progress: e1RM, PBs, session history, load trends over months, VO2 max / fitness age → **athlete profile → Progress** |
| **Needs programming**: athletes whose planned sessions are running out | Full programme editing → Programme tab |
| **Needs chasing**: no check-in, Garmin silent, timetable unanswered | Raw Garmin numbers beyond the 3 that drive a decision (sleep, HRV vs normal, resting HR) → profile |
| **Readiness**: subjective + objective combined, with the reason in one line | Sleep stages, step counts, stress charts, activity lists → profile |
| **Pain / medical flag** from the check-in | Meal photos, macros, water, review comments → **Nutrition tab** (nutritionist) |
| **Recent updates strip** (one line each, optional, collapsible) | Cycle / menstrual information of any kind → named coaches only, never here (see §8) |

Test for anything proposed for the sheet: *"If this is red, what will the coach do differently today or this week?"* No answer → it goes in the profile.

---

## 2. The week board (the centrepiece)

A compact matrix: **rows = athletes, columns = Mon–Fri** (Sat/Sun collapse into one column that appears only if something is planned). Today's column is highlighted. One cell per athlete-day, one glyph, no text unless tapped.

| Cell | Meaning | Source |
|---|---|---|
| ● solid teal | Individual programme session planned | `planned_sessions` |
| ✓ solid teal with tick | …and a completed `session_logs` row is linked or falls on that day | `session_logs` (not `planned_sessions.status`, which is unreliable) |
| ✗ amber outline | Planned, date has passed, nothing logged, no "not attending" reply | derived |
| ▣ gold | Attending a group/timetable slot (hover/tap: which slot) | `timetable_slots` + `timetable_responses` |
| ▢ grey dashed | Slot exists for them but **no reply yet** | derived |
| ⊘ | Said not attending (reason on tap) | `timetable_responses` |
| empty | Nothing planned | — |

Row end: a **sessions done / planned** fraction and a readiness dot (§3). Column footer: **headcount per day** ("Wed: 9 in, 3 unanswered") — this is the "who's in" answer at a glance, and it is what a coach needs on Sunday night and Monday morning.

Interaction: tap a name → athlete profile; tap a cell → that session (planned) or slot (attendance); tap a column head → that day's list with names and a "remind unanswered" button.

Filters (slim chips, not tiles): *Needs programming · Not done check-in · Low readiness · Missed · Unanswered*. "My athletes" toggle from the assignment table (v1 doc §3.3).

Mobile: a **day picker** (Mon–Fri pills) replaces the matrix; below it the list for that day (who's in, done, due). Same data.

**Process dependency (live finding):** no timetable is published for this week, so the ▣/▢ cells are empty until one is. A weekly timetable (or "copy last week") is what lights this up. Needs your answer (§10, Q4).

---

## 3. Objective and subjective readiness — how they live together

### 3.1 Principles

1. **Subjective leads on the day; objective corroborates and warns of trends.** Research on monitoring tools (e.g. Saw et al., 2016) finds athlete-reported wellness is generally more sensitive and consistent to training load than most objective markers. Garmin adds value because it is passive (no effort, no social-desirability bias), covers days the athlete skips the form, and catches slow drift. It does not replace asking.
2. **Always compare an athlete with themselves.** Population norms (an "HRV of 70") are meaningless between individuals.
3. **One day is noise. Persistence is signal.** Wearable HRV and resting HR vary day to day for reasons that have nothing to do with training. No flag from a single reading except pain and extreme values.
4. **A change must be bigger than ordinary variation to count** — the smallest worthwhile change (SWC), §3.3.
5. **Be honest about what we know.** Each readiness tile states how many signals it rests on and how many days of baseline exist. A green built on one number never looks like a green built on five.
6. **Signals, not diagnoses.** Wording is "worth a check-in", never "ill" or "overtrained". Several athletes are under 18.
7. **Never infer hidden data.** If an athlete has switched a category off (sleep, stress, body battery, vitals), the tile shows a lock and nothing is guessed from the other numbers.

### 3.2 What feeds it (and what we actually have)

**Subjective** — `wellness_responses` (22 questions in the library: sleep hours/quality, mood, stress, motivation, confidence, focus, soreness, freshness, readiness to train, recovery, energy, fuelling, appetite, hydration, digestion, skipped meals, pain yes/no + scale, swelling/stiffness, cycle-symptom impact).
Reduced to **four domains** so the tile stays readable, each domain being the worst of its items on the existing RAG thresholds (`getRagColour`):

| Domain | Items |
|---|---|
| Body | soreness, freshness, recovered, ready to train, swelling/stiffness |
| Mind | mood, stress, motivation, confidence, focus |
| Sleep & fuel | sleep hours, sleep quality, energy, fuelling, appetite, hydration, digestion, skipped meals |
| Pain | any "pain/symptoms today" = yes, or pain scale ≥ 4 → **red regardless of everything else** |

The cycle-symptom item is **excluded** from the sheet entirely (§8).

**Objective** — `garmin_daily_for()` (already masked by the athlete's switches): overnight HRV (last-night average), resting HR, sleep duration + score, Body Battery high (charge at wake), average stress; later breathing rate and SpO₂.

### 3.3 The maths (all per athlete, all in one tested module `src/utils/readiness.js`)

**Notation.** For a metric *x* on day *d*: the **acute value** is the mean of the last 7 days (needs ≥ 4 valid days, otherwise "not enough recent data"). The **baseline** is the mean and standard deviation (SD) of the previous 28 days *excluding* the last 7 (so the baseline is not contaminated by the very change we are looking for). Baseline is **provisional** from 10 valid days, **established** from 20. The **SWC band** is baseline ± 0.5 × SD. A metric is **outside normal** only when its acute value is beyond the band; **clearly outside** beyond baseline ± 1 SD.

| Metric | Transform / unit | Acute vs baseline | Floors (to stop trivial flags) | Direction that matters |
|---|---|---|---|---|
| **HRV** | **ln(RMSSD)** — HRV is skewed; logs make "% change" symmetric | 7-day mean of ln vs 28-day mean of ln, band 0.5 SD | SD floor 0.05 ln units (~5 %) | Lower = amber/red. Higher = shown neutral ("above range", can also precede illness or reflect saturation) — **never green by itself** |
| **Resting HR** | bpm | 7-day mean vs baseline, band 0.5 SD | SWC at least 2 bpm | Higher = amber/red. A single day ≥ baseline + 5 bpm for **2 days running** is also an acute flag |
| **Sleep duration** | hours | Mean of last 7 nights vs **target**, not baseline (see below); plus count of nights under minimum | — | Lower |
| **Body Battery (wake)** | 0–100 | 3-day mean vs baseline | SWC at least 8 points | Lower |
| **Stress** | 0–100 | 7-day mean vs baseline | SWC at least 5 points | Higher |
| **Subjective domains** | 1–7 scales, hours | 3-day mean per domain vs the athlete's own 28-day mean (band 0.5 SD) **and** an absolute floor (a domain at ≤ 3/7 is amber regardless of baseline, ≤ 2/7 red) | Absolute floor catches the athlete who is always low | Per question direction |

*Why a 7-day rolling mean for HRV and not the daily value:* the day-to-day coefficient of variation of wearable HRV is typically 10 % or more, larger than most real training effects. Averaging 7 days against a longer baseline is the standard way to separate adaptation/fatigue from noise (Plews, Buchheit and colleagues). *Why a 0.5 SD band:* the common starting convention for individual SWC in HRV monitoring; it is a tunable constant (0.5 → 0.75 reduces flags), not a law.

*Sleep is the exception to "compare with yourself."* A teenager who always sleeps 6 hours is not "normal" at 6 hours. So sleep is judged against an **age-based target** from the athlete's date of birth (all 17 have one): **under 18 → 8 h minimum, 18+ → 7 h** (sport-science / sleep-medicine consensus ranges). Shown as: 7-night mean, nights under minimum, and **sleep debt** (sum of shortfall over 7 nights). Amber at ≥ 3 short nights in 7 or debt ≥ 4 h; red at debt ≥ 8 h.

*Load context (not a Garmin matter):* weekly **sRPE load** from `session_logs` (session RPE × minutes) is the load source of truth because every athlete has it. Shown in the profile, not this sheet. If a "load spike" prompt is ever added it uses the **week-on-week change** as context only (the acute:chronic ratio has known statistical problems and must not drive decisions on its own).

### 3.4 Combining them: one decision, four states

First compute two summaries:

* **Subjective status** (today, or most recent ≤ 2 days): *Red* if pain flag, or any domain red; *Amber* if any domain amber **or** the 3-day mean in any domain is outside the SWC band; else *Green*; *None* if no check-in in 2 days.
* **Objective status** (needs ≥ 2 shared signals and a provisional baseline): count signals **outside normal** (acute beyond the SWC band in the bad direction): 0 → *Green*; 1 → *Amber (watch)*; ≥ 2, or HRV and resting HR both outside normal → *Red*; HRV or RHR clearly outside normal (> 1 SD) with anything else → *Red*. Fewer than 2 signals, no baseline, or not shared → *None* with the reason.

Then the matrix is what the coach sees, and every cell has an **action**:

| | Objective green | Objective amber/red | Objective none |
|---|---|---|---|
| **Subjective green** | ✅ **Go.** No flag. | ⚠ **"Says fine, body says otherwise."** Athletes under-report. Quick conversation; don't change the session unless it persists 2–3 days. | ✅ Go (low confidence — "no Garmin") |
| **Subjective amber** | 🟡 **Feels off, metrics normal.** Probe soreness / mind / life stress. Adjust session feel, not volume by default. | 🔴 **Both agree.** Talk before the session; modify load or substitute (coach's call). Top of the queue. | 🟡 Watch. Ask. |
| **Subjective red / pain** | 🔴 **Act on the athlete's word** regardless of Garmin. Pain → medical route. | 🔴 Same, with the objective detail attached. | 🔴 Act. |
| **Subjective none** | 🟡 **Chase the check-in** (Garmin alone is a watch-level signal) | 🟠 **Chase the check-in now** — objective is flagging and we can't see how they feel | ⚪ Chase check-in; nothing to read |

Rules that keep it from crying wolf:

* A flag must hold on **2 consecutive days** (or 3 of the last 5) before it enters "needs attention"; pain, and extreme values (resting HR ≥ baseline + 8, SpO₂ low), are immediate.
* The queue shows **why in one line**: *"HRV 7-day avg 11 % under normal for 3 days, resting HR +4 bpm; feels 5/7 on body."* No jargon scores.
* "Possible illness" is renamed **"Worth a check-in: pattern looks like a cold/illness"** and needs ≥ 2 of: resting HR up, HRV down, breathing rate up, low SpO₂ (the latter two only when vitals are shared).

### 3.5 Data reality and how the sheet behaves while data is thin

This is the single most important honesty point: **right now there is almost nothing to compute baselines from.**

* Subjective: only **5 of 16 athletes** gave any check-in in the last 28 days (avg 7.6 responses each). 4 did it today.
* Objective: **1 athlete** (Pro Pathius) is connected, with days of data, not weeks. Starter access does not backfill history.

So the build has three explicit tiers per athlete, always labelled on the tile:

| Tier | When | Shows |
|---|---|---|
| **No baseline** | < 10 valid days of a metric | Absolute rules only (sleep vs target, pain, body battery < 40, SpO₂ < 90) and "building baseline n/10". No comparison-with-self flags. |
| **Provisional** | 10–19 days | Full logic, labelled "provisional"; a Garmin red alone never goes top of the queue |
| **Established** | ≥ 20 days | Full logic |

Consequence worth saying plainly: **for the first month the dashboard's biggest readiness lever is getting athletes to do the daily check-in,** not Garmin. The sheet should therefore make "not done check-in" very visible, and Garmin should be rolled out to athletes in a trickle with the baseline-building state clearly shown.

---

## 4. Needs programming (runway)

Unchanged rule, sharpened: for every `programming_active` athlete, `runway = last planned_date − today`.

* **Red:** nothing planned after today (live: **7 of 14**).
* **Amber:** runs out within the runway threshold (default 7 days; live: 2 more; 4 within 14).
* Shown as a **count chip** and as a **row on the week board** (a thin red bar after the last planned day: "ends Thu"), so the coach sees it *in the week context*, not as a separate list.
* One click → that athlete's Programme tab.

---

## 5. Needs chasing

One consolidated worklist (replaces the separate "Wellness Compliance" panel), with the existing one-tap reminder (`POST /api/push/send`):

| Chase | Rule |
|---|---|
| Check-in | No response today after 09:00 Dubai; escalates after 2 missed days. Weekends: configurable (§10 Q3). |
| Timetable | Slot published this week and athlete eligible but unanswered (Sunday 3 pm popup already exists) |
| Garmin silent | Connected but no data for ≥ 2 days → "ask them to sync their watch" |
| Not signed in yet | Athletes whose first login has never happened (starting passwords expire 4 Nov) — list for later, but this is a recurring cause of "no data" |

Rules: one row per athlete per reason, "remind all (n)" bulk action, a reminder sent today greys the row.

---

## 6. Nutrition: its own tab, for the nutritionist

You are right that the physical coach does not need meals streaming into the main sheet. Live facts: **4 of 16 athletes** logged any meal in the last 7 days (63 meals); 8 have nutrition settings.

Recommendation:

* **New "Nutrition" tab** (staff app) holding what exists today: the submission/review queue, photos (already in the new lightbox), water, per-athlete adherence, and comments back to the athlete.
* **Role:** today there are only `admin` (1), `co_admin` (4) and `athlete` (16) roles in use, plus an unused `external`/provider concept (`provider_allocations` = 0). The clean fit is the **provider role**: the nutritionist signs in as `external` and is **allocated** the athletes they cover, so they see nutrition (and only the check-in items that matter to them: appetite, fuelling, hydration, skipped meals) and nothing about programming or Garmin. This also gives a natural answer to "who sees what" for a second specialist (physio, psychologist) later. It needs a role-scoped RLS wave and persona tests — more than a tab, so it is its own phase.
* **On the main sheet:** meals disappear. At most one optional chip, "Not logging 3+ days: n", which the coach can switch off. Default: off.
* **Shared signal that does stay:** the nutritional items in the daily check-in (skipped meals, fuelling) still count towards the "Sleep & fuel" domain.

---

## 7. Layout (replacing v1 §4.1)

```
┌ header: week ◂ ▸ · My athletes ▾ · chips: Needs programming 7 │ No check-in 12 │ Low readiness 2 │ Missed 3 │ Unanswered 5 ┐
├────────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────┤
│ WEEK BOARD (athlete × Mon–Fri)                                    ~65%      │ DO THIS FIRST (attention queue) ~35%    │
│  Name        Mon  Tue  Wed  Thu  Fri   done  readiness                       │  1 Pain: A.B. reports pain today  [Open]│
│  A. Name      ✓    ▣    ●    ●    ▢    2/3   ● feels ok, metrics ok          │  2 Both flag: C.D. HRV −11 %, RHR +4,   │
│  B. Name      ✗    ▣    ▣    ⊘    ▣    —     ◐ no check-in 2d  [Remind]      │       body 4/7                  [Open]  │
│  …                                                                            │  3 Needs programme: 7  [Open list]      │
│ footer:  in: 11   9   9   7   8  (unanswered 3/2/…)                          │  4 Chase check-in: 12   [Remind all]    │
└────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┘
  Recent updates: one collapsible line each (completed sessions only)
```

* Removed: the four big panels, large stat tiles, panel subtitles, meal feed, PB feed.
* Mobile: chips → queue (first 5) → day picker → that day's list → recent updates.
* Palette unchanged (gold `#A58D69`, teal `#437E8D`, deep teal `#085777`, amber `#C9982E`).

---

## 8. Visibility consequences (updates v1 §3)

* **Finding:** the *daily check-in already contains a cycle-related question* ("How significantly are menstrual or cycle-related symptoms affecting your training today?"), and today every staff member can read all responses. This is sensitive data we already hold, independent of Garmin. Recommendation: treat that one question as the **same sensitive category** as the cycle data — hidden from the dashboard and queue, shown only to named coaches on that athlete's profile, and never counted into the readiness colour in a way that reveals it (its effect, if any, is folded into the generic "Body" domain only when the named-coach rule allows).
* Everything else in this brief uses **core data, open to all coaches, gated by athlete switches** (v1 option C). Nothing in the sheet requires restricting core data.
* Nutritionist/physio/psychologist visibility is handled by the allocation-based provider role (§6), not by the assignment table.

---

## 9. What changes compared with v1

| Area | v1 | v2 |
|---|---|---|
| Centre of the sheet | Athlete card grid with many cells | **Week board** (Mon–Fri matrix + headcount) |
| Garmin logic | Fixed ratios vs 28-day median | **7-day rolling mean vs athlete's own 28-day baseline, SWC band 0.5 SD, ln(HRV), persistence rules, age-based sleep targets** |
| Objective vs subjective | Shown side by side; mismatch flag | **A single decision matrix with actions; subjective leads, objective corroborates** |
| Thin data | Mentioned | **Three explicit tiers, labelled on screen** |
| Progress/PBs | In recent-updates feed | **Removed** (profile only) |
| Nutrition | A cell on every card | **Own tab, nutritionist via provider role; off the main sheet** |
| Cycle data | Garmin only | **Garmin and the existing check-in question** |

---

## 10. Phases (each pushable to `master` alone)

| # | Phase | DB change | Notes |
|---|---|---|---|
| 0 | Fix wrong data: wellness panel reads the legacy table; session completion from `session_logs` | No | Small, safe, first |
| 1 | **Week board + attention queue** (programming runway, chase check-in, missed, timetable unanswered), slim chips, mobile day-picker; meals off the sheet | No | Needs no Garmin; biggest value; `?classic=1` fallback for a week |
| 2 | **Readiness engine** `readiness.js` + tests (fixtures for every rule in §3), subjective domains, decision matrix, tiers | No | Pure maths, unit-tested; works for subjective alone immediately |
| 3 | Garmin inputs: `garmin_baselines_for` / `garmin_roster_status` SQL (masked, persona-tested), objective status into the matrix | Yes (additive) | Meaningful from ~3 weeks of real data |
| 4 | Nutrition tab + provider (nutritionist) role and allocation RLS | Yes | Own phase: role-scoped policies |
| 5 | Coach assignment table, "My athletes", cycle-data gate (check-in question + Garmin cycle) | Yes | Sensitive; persona tests incl. "admin not named sees nothing" |
| 6 | Polish: persisted nudges, nightly missed-session marking, coach push for red flags | Yes | |

---

## 11. Decisions I need from you (everything else has a default)

1. **Visibility.** Confirm: core data open to all coaches; cycle information (Garmin *and* the check-in question) only for named coaches, **admin not automatic**. (Default: yes.)
2. **Programming runway.** Alert at 7 days to go. (Default 7; say 10 or 14 if you plan further ahead.)
3. **Check-in rhythm.** Expected every day including weekends? Chase from 09:00 Dubai, escalate at 2 missed days. (Default: every day.)
4. **Timetable.** Are group sessions the same every week? If yes I add "copy last week" so the board's attendance cells are populated automatically. (Default: empty-state link to Timetable.)
5. **Nutritionist.** Do you have an actual nutritionist who needs to log in (provider role, only sees their allocated athletes), or is it you/another coach wearing that hat? (Default: build the tab for staff first; provider role as phase 4.)
6. **Sleep targets.** 8 h minimum under 18, 7 h for 18+. Happy, or does the academy use its own standard?
7. **How sensitive?** The 0.5 SD band is deliberately sensitive. Prefer fewer flags (0.75 SD) while athletes are still learning the check-in? (Default: 0.5 for subjective, 0.75 for Garmin until a month of data.)

---

## 12. Caveats (so nobody over-trusts it)

* Thresholds, band widths (0.5 SD), floors and sleep targets are **evidence-informed starting values, not validated on this squad.** After ~4 weeks of data, review the green/amber/red split (expect roughly 70/25/5) and the number of flags per coach per day (aim for fewer than ~5) and adjust constants in `readiness.js`.
* Wrist-based HRV and resting HR are consumer-grade. Good for individual trends, not clinical, and unreliable when the watch is loose, charged overnight, or worn irregularly — the "valid days" counts exist to expose that.
* Garmin Starter access delivers data from the day of connection only; baselines therefore start at zero for everyone.
* The signals support a conversation; they do not make the training decision.
