# ProPath data audit — 27 Oct 2026

What we collect, where it lives, who can see it, and a better way to hold it so coaches **and athletes**
can use it. Based on reading the code and the SQL files in this repo — **not** the live database. Run
`sql/audit_who_can_read_what_READONLY.sql` on live to confirm the access findings in section 2 before
acting on them.

---

## 1. What is collected today

| Data | Where it is stored | Who enters it | Athlete can see it? |
|---|---|---|---|
| Profile, photo, cohort, RAG ratings | `athletes.data` (one JSON blob per athlete) | Coach | Name/photo only |
| Maturation, mobility, physical, lifestyle | inside the blob (`phase2.*`) | Coach / provider | No |
| Performance test entries | blob **and** `performance_test_results` (written twice) | Coach | Only metrics the coach pins |
| Physio entries, injuries, general notes, nutrition notes, psych (ACSI-28, observations) | inside the blob | Coach / provider | **No** |
| VALD test results | `vald_test_results` (pulled by `/api/vald/sync`) | Automatic | Only pinned metrics |
| Wellness check-ins | `wellness_submissions` / `wellness_responses` | Athlete | Own history on Readiness |
| Programme: blocks, planned sessions | `training_blocks`, `planned_sessions`, … | Coach | Yes (their sessions) |
| Session logs, sets | `session_logs`, `set_logs` | Athlete | Yes |
| Meals, photos, water | `meal_entries`, `meal_photos`, `water_intake_logs` | Athlete | Yes |
| Goals & quarterly reports | `development_plans`, `goals` (released with `sent_at`) | Coach + athlete | Yes, once sent |
| Messages, group chats, safeguarding | `athlete_messages`, `chat_*` (immutable) | Both | Yes |
| Timetable, attendance, 1:1 tokens | `timetable_*`, `one_to_one_*` | Coach + athlete | Yes |
| **Garmin (new)** | `garmin_daily`, `garmin_activities`, `garmin_connections` | Automatic | Yes — own only |

## 2. Findings, worst first

### A. Privacy: several tables are open to far more people than intended  — fix first
Athletes now sign in as real users. Older tables were written when athletes were anonymous links, and
many rules say "everyone" (`USING (true)`):

- **Anyone on the internet** holding the public key (it ships inside the website's code) can *read*:
  performance results, VALD results, development plans and goals, planned sessions, session/set logs,
  meal entries and **meal photos**, water logs, wellness responses. Some can also be *written*
  (meals, meal photos, water, session logs, athlete goals).
- **Any signed-in athlete** can read — and on several tables edit or delete — *other athletes'* rows
  (`performance_test_results`, `development_plans`, `goals`, `athlete_kpi_board`, meals, water, logs,
  VALD, training blocks, calendar events). The app never shows this, but nothing in the database stops
  it.
- The `athletes` blob itself *is* locked to coaches (and allocated providers) — good.
- This was a known, deliberate stop-gap (`security-lockdown-2026-07-06.sql` says "needs a token-exchange
  … so reads are scoped per-athlete"). Individual logins are what make the proper fix possible now.

*Why it matters:* these are children's health, nutrition and photo records. Treat as a safeguarding and
data-protection issue, not just tidiness. (Worth checking UAE data-protection rules on minors' health
data and retention — I'm not a lawyer.)

*Fix, in order of safety:*
1. Run the read-only query to confirm what is live.
2. Close the **write** holes first (anon write on meals/photos/water/logs/goals) — low risk.
3. Add one helper, `can_view_athlete(athlete_id)` = coach, **or** that athlete's own login, **or** an
   allocated provider; rewrite every table's rules to use it; remove `USING (true)`.
4. Move the remaining legacy anonymous (token-link) screens onto logged-in access, then drop anon
   access entirely. Needs a careful test on a real phone first.

New Garmin tables are already built to this standard (athlete = own rows, coaches = all, nobody else).

### B. The athlete record is one big JSON blob
Everything about an athlete (notes, physio, injuries, psych, maturation, mobility, photo) is saved as one
document, rewritten whole on every change.

- **Lost edits.** Two coaches (or two tabs) editing different tabs at the same time: the later save
  overwrites the earlier one with its stale copy. Silent.
- **Not searchable.** "Which athletes have an open injury?", "all notes from this month", "who hasn't
  been assessed this quarter?" can't be answered without loading every record.
- **Heavy.** The photo is inside it, so every note save re-uploads the photo and every change is
  broadcast to every open screen.
- **No author or visibility.** Notes have no reliable who/when/for-whom, so there is no way to say
  "share this with the athlete".
- **Written twice** (performance entries in blob + table): they can drift apart.

### C. Athletes can't see most of what we know about them
Notes, physio, injury history, maturation, mobility and psych outcomes never reach the athlete. Coaches
also have no single place to *send* an athlete something (a note, a report) and know it was seen.

### D. Overlapping capture
Wellness sleep/readiness vs Garmin sleep/HRV; session RPE vs Garmin activity load; manual physical
tests vs VALD; attendance in three places (timetable, session logs, planned sessions). Not wrong, but
nothing ties them together so coaches compare by eye.

## 3. A better shape

**One rule for visibility.** Every record belongs to an athlete and has a visibility: *coaches only*,
*shared with athlete*, or *shared with parents* (the read-only link we already built). One helper
decides; every table uses it.

**Notes become rows, not blob entries.** `athlete_notes`: athlete, area (physio / psych / nutrition /
general / …), text, author, date, visibility, optional link to a session. Coaches write as now; a
**"Share with athlete"** switch publishes it to a *From your coaches* feed in the athlete app with a seen
tick. Existing blob notes are copied across once; the blob stays read-only until sign-off.

**Reports are snapshots.** "Send report" freezes what the athlete sees (goals, test results, coach
summary, selected notes, Garmin trends) as a dated, unchangeable snapshot — in the athlete's Progress tab
and, if wanted, as a parent link or PDF. The quarterly report is already half of this (`sent_at`).

**Measurements in one stream.** Performance tests, VALD and Garmin all end up as dated values with a
*source* (`manual`, `vald`, `garmin`). The athlete's Progress charts and the coach's KPI board read the
same stream; the double write goes away. Garmin keeps its own tables (daily volume) and is surfaced
alongside.

**Data sources panel.** One list per athlete: VALD, Garmin (later Whoop/Oura/Apple Health) — connected?
last updated? needs attention? — so connecting a device is the same everywhere.

**"My data" for the athlete.** What we hold, who can see it, download it, ask to correct it. Good
practice for minors and it builds trust.

## 4. Suggested order

| Step | What | Size | Risk |
|---|---|---|---|
| 0 | Run the read-only policy query; close anonymous *write* holes | small | low |
| 1 | Garmin (built — see below) | done | low |
| 2 | `can_view_athlete()` + rewrite table rules, athlete = own rows | medium | **needs phone test** |
| 3 | `athlete_notes` + "Share with athlete" + athlete feed | medium | low |
| 4 | Report snapshots + parent/PDF share | medium | low |
| 5 | Move remaining blob sections to tables; stop blob edits losing data | large | medium |
| 6 | "My data" page + retention/deletion rules | small–medium | low |

## 5. Garmin — what was built and the one catch

- Each athlete connects **their own** Garmin from their own login (Progress tab) by pasting a Garmin
  *personal API key*; a coach can also paste one on the athlete's Wellness tab. The key is encrypted on
  the server and never sent back to any screen. Sleep, HRV, resting heart rate, steps, body battery and
  activities refresh when the athlete opens the app and once a day.
- **Catch:** Garmin's Personal API says it is for individuals' own data and "not intended for commercial
  applications serving multiple end users". Fine for **Pro Pathius** (your own watch/account). For the
  whole academy, apply for Garmin's free **Business "Starter Access"** (athletes approve sharing with
  one tap; no keys to paste or renew). The data tables and screens are built so only the connection step
  would change.
- Server setting needed: `GARMIN_KEY_SECRET` (long random text) in Vercel, and run
  `sql/garmin_2026-10-27.sql`.
- Garmin doesn't publish the exact response format for this API. Field names are matched from Garmin
  Connect's known names and the original data is stored too; the *Diagnose* call lists what comes back so
  anything unmapped can be fixed in minutes once Pro Pathius is connected.
