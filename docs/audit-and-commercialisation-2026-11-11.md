# ProPath AMS: audit, replicability and commercial analysis

Date: 2026-11-11 · Status: analysis only, nothing built · For: Jonah

**How to read this.** Numbers marked *(measured)* come straight from the code and the live database today. Items marked *(inference)* are my judgement. Prices and market claims are from public pages and are *hypotheses to test*, not research results. Where I couldn't verify something, it says so.

---

## 0. The short version

**Can you add the Wildcats without copying everything?** Not today, but it is a well-defined piece of work and the system is closer to ready than it looks. Today the AMS is built for exactly one organisation. The database has **0 tenant columns across 75 tables** *(measured)*, and ProPath/Academy details are baked into about **50 files** *(measured)*. The good news: the security rules are already funnelled through a handful of helper functions (67 of 137 policies use one function, `is_staff()`, and 25 use `can_see_athlete()`), so making the system multi-team is mostly a change to a few central places plus adding a "workspace" to the data, not a rewrite.

**The Netflix idea is right, and it is buildable.** One login, several "workspaces" (Academy, Wildcats), a switcher at the top, each workspace with its own athletes, settings, branding, modules and timezone. I recommend building real workspaces in one shared system rather than copying the app per team (reasons in §2).

**Your second concern, things working with or without each other, is the more important one.** The support levels you added are the right instinct. The next step is to make *everything* work that way: every module and every data source (Garmin or not, VALD or not) declared as optional, and every screen designed to cope with "this athlete doesn't have that". The dashboard already does this in places. It needs to become the rule, not the exception (§3).

**The single biggest technical weakness for scale** is that each athlete's data lives in one large JSON blob (about **120 KB per athlete, 250 KB at most** *(measured)*). It works for 17 athletes and will hurt at 200, and it blocks fine-grained permissions (for example, cycle data for named coaches only). It should be broken into proper tables, gradually (§5).

**Is it sellable?** Yes, but not as "software". Software licences in this market are cheap and getting cheaper (public price points start at hundreds of dollars a year for small teams), and you are right that AI is pushing build cost toward zero. What isn't cheap is knowing *what to show, why, and what to do about it*, plus integrations, privacy for minors, and someone who turns an idea into a working screen. That points to a **productised service**: a modular platform with a dedicated performance partner on top (§7). Before selling, six things must be fixed: tenant isolation, a paid hosting plan, Garmin commercial approval, a repeatable environment, legal terms, and monitoring (§5, §7).

---

## 1. What exists today (measured)

| Area | Fact |
|---|---|
| Code | about **67,800 lines**: 172 component files, 54 hooks, 50 utilities, 41 server files, 60 loose SQL scripts |
| Database | **75 tables**, **137 security policies**, **31 security-definer functions**, row-level security **on for every table**, 35 MB |
| Storage | 4 file areas: resources, meal photos, recipe images, athlete reports |
| Roles | admin (1), co-admin (4), athlete (16), plus an "external provider" role |
| Server | 9 serverless functions (the Vercel Hobby plan allows **12**), 2 scheduled jobs |
| Integrations | Garmin (health data), VALD (testing), Anthropic (AI), web push |
| Tests | 18 test files, 161 tests; CI runs lint, tests and build on every push to `master`; there is no staging, pushes go straight to production |
| Largest files | 12 files over 680 lines (the programme week view is 1,349) |

**Modules that exist:** roster and athlete profiles; programming (blocks, sessions, calendar, copy weeks, text-to-training, exercise library of ~1,400); athlete app (training, session logging, progress, nutrition, messages, resources); wellness check-ins; Garmin connection with athlete sharing switches; VALD testing import; results upload and testing records; timetable and attendance with reminders; messaging and group chats; nutrition and recipes; resources; reports log; safeguarding log; reminders and push; the coach dashboard; support levels. Parent accounts are planned, not built.

---

## 2. "Can I add the Wildcats?" The multi-team question

### 2.1 Where it stands

The AMS assumes one organisation in four ways:

1. **Data.** No table carries an organisation or team. 47 of the 75 tables hang off an athlete; the other 28 split roughly into:
   - *Child records that inherit from a parent* (session exercises, sets, meal photos, chat messages and similar): they would inherit the workspace automatically.
   - *Shared catalogues*: exercise library (1,416 rows), recipes, wellness question library, strength estimates, resource items. These need a decision: one shared catalogue, or one per team.
   - *Workspace-owned content and settings*: timetable slots, chat rooms, programme templates, and the `app_settings` table, which currently holds **global custom tests and providers**. Today a test you add (like "Swelling at Knee") would appear for Wildcats too.
   - *Integration logs* (Garmin push logs and samples).
2. **Identity.** One login maps to one role through `user_roles`. A coach cannot be in two organisations. Athlete logins use a fixed internal domain (`athletes.propath.internal`, defined in two places).
3. **Hard-coded Academy details** *(measured)*: "ProPath" or "propath" in about 53 files, the Dubai timezone in 11 files (including scheduled jobs and the Sunday reminders), the cohort names Elite/Gold/Mini in 19 files, the app address in 2 files, and the app name in the install manifest.
4. **Integrations use one set of credentials.** Garmin (one app), VALD (six environment variables for one account), push keys, and the AI key are global.

### 2.2 Three ways to do it

| | A. Copy the app per team | B. One system with workspaces | C. B plus the option to isolate a big customer |
|---|---|---|---|
| What it is | New database and deployment for each team | One database; every record belongs to a workspace; a switcher chooses which one you are in | As B, but a large client can be moved to its own database later |
| Netflix-style switching | **No** (separate logins and addresses) | **Yes** | Yes |
| Time to first extra team | Fastest (days) | 2 to 3 weeks of foundations | As B |
| Cost per team | Rises with each team (hosting, upkeep, updates repeated) | Near zero per team | Near zero, except for isolated clients |
| Improvements reach everyone | Only by re-deploying each copy | Instantly | Instantly |
| Risk | Copies drift apart; fixes get missed | One mistake in a rule could leak between teams (mitigated by tests) | As B |
| Best for | A one-off demo | Your stated goal | **What I recommend** (the path to selling) |

**Recommendation: B now, designed so C is possible later.** The mistake to avoid is copying: it feels quick and becomes unmaintainable by the third team.

### 2.3 What "Netflix" looks like

- One account per person. A **membership** links a person to a workspace with a role (admin, co-admin, coach, physio, nutritionist, athlete, parent), so one coach can be admin of the Academy and a coach for the Wildcats.
- A **workspace switcher** at the top of the app (like Netflix profiles). Choosing one reloads the app inside that workspace; nothing from another workspace is visible.
- Each workspace has: name and branding (colours, logo), timezone, sport and terminology (cohorts vs positions), enabled modules, support levels, its own custom tests and templates, and its own integration credentials.
- Athletes belong to one workspace. An athlete who plays for two teams is a later complication (flagged in §8).

### 2.4 What the work involves (my estimate, in working days of building plus testing)

1. **Workspace model** (organisations, memberships, workspace id on athletes and the owned tables; central helper functions changed so every existing rule respects it): **4 to 6 days**, including proving isolation with automated tests that try to read across workspaces.
2. **Replace hard-coded identity with workspace settings** (name, colours, timezone, cohort labels, athlete login domain, manifest): **2 to 3 days**.
3. **Workspace-scoped settings and catalogues** (custom tests, providers, templates, libraries: decide shared vs own): **2 to 3 days**.
4. **Switcher and workspace-aware sign-in** (coach app and athlete app): **2 to 3 days**.
5. **Per-workspace integrations** (Garmin attribution, VALD credentials stored per workspace instead of in environment variables): **3 to 4 days**.
6. **Scheduled jobs and reminders that run per workspace in its timezone**: **1 to 2 days**.

**Total: roughly 3 to 4 weeks** of focused work to a clean second workspace. Those figures are wide because step 1 depends on how many of the 137 rules need individual attention; I would know better after a one-day spike.

### 2.5 What a *basketball team* needs that an academy doesn't (inference)

Your system is built around individual athletes and weekly programmes. A team sport adds:

- **Squads and teams** inside a workspace (first team, reserves), with team-level views.
- **Fixtures and games**: the calendar already holds events, but games need minutes played, opponent, result.
- **Game load**: minutes times RPE for games and practices (your new "other activity" log is the seed of this).
- **Positions and roles** instead of Elite/Gold/Mini; injury surveillance and availability for selection.
- **Team reports** (whole-squad availability and load), rather than athlete-by-athlete.

None of these is hard; they are mostly new screens on top of data you already collect.

---

## 3. "Things working in isolation": modularity and optional data

### 3.1 What you already have right

- **Support levels** (full, programmed, tracked, hands-off) decide what is expected for each athlete.
- **Athlete sharing switches** for Garmin categories, enforced in the database.
- **Per-athlete settings** for the athlete app, nutrition, wellness questions.
- **Fail-soft dashboard**: each data source loads separately, so if one is missing the rest still show. The dashboard already distinguishes "not tracked" (·) from "no reading yet" (–) and hides the watch circle for athletes without one.

### 3.2 What is missing

1. **No module registry.** The navigation and every screen are hard-wired. You can't switch off Nutrition or Timetable for a team without editing code.
2. **Provider-specific data.** Wearable data sits in Garmin-named tables, and screens call Garmin functions directly in several places. To support Whoop, Oura, Apple Health or a manual form, every one of those screens would change.
3. **Dashboard widgets aren't configurable.** Which cards appear, and in what order, is code, not a setting.
4. **Some features still assume the Academy's way of working** (cohort tiers, youth maturation, a weekly gym programme).

### 3.3 The principle I'd build to

**"Every screen declares what it needs; the system works out what it can show."**

- **Modules** (switchable per workspace): roster, wellness, programming, testing, timetable, nutrition, messaging, wearables, reports, parent portal.
- **Capabilities** (per athlete, derived from support level and connections): *programmed*, *wearable connected*, *wellness on*, *nutrition on*. A screen asks "does this athlete have this?" and shows the right empty state if not.
- **A provider-neutral metrics layer**: one daily table with sleep, HRV, resting heart rate, load, intensity, with a "source" tag (Garmin, VALD, manual, other). Garmin becomes an *adapter* that fills it. Mixed squads (some with watches, some without, some with a different brand) then just work, and the dashboard reads one place.
- **Configurable dashboard**: a workspace chooses which widgets show, in which order; each widget hides gracefully when it has nothing to say.
- **Terminology and tiers as data**: cohorts, positions, "athlete" vs "player" are workspace settings.

This is exactly what lets "the academy is partnered with Garmin and some athletes have devices and some don't" be a non-event.

**Estimate:** module registry and capability checks, **4 to 5 days**; provider-neutral metrics layer (including moving the Garmin screens onto it), **5 to 7 days**; configurable dashboard, **3 to 4 days**.

---

## 4. What carries over, what's tricky, what's core

Ratings: **Reuse**: *Direct* (works as is), *Config* (needs settings, not code), *Rework* (real change). **Value**: *Core* (a team can't run without it), *Differentiator* (why people would choose you), *Nice* (adds polish).

| Module | Reuse for a new team | Value | Notes |
|---|---|---|---|
| Login, roles, athlete app shell | Rework (workspace-aware) | Core | The foundation of §2 |
| Athlete profiles and roster | Config | Core | Remove Academy tiers; the JSON-blob structure needs unpicking over time |
| Wellness check-ins + coach views | Direct (after workspace id) | **Differentiator** | Works for any sport; library of 22 questions is editable |
| Coach dashboard | Config | **Differentiator** | The "make and run the week" view; widgets should become configurable |
| Programming (blocks, calendar, copy weeks, text-to-training) | Direct | Core for strength-led teams | Strong asset; basketball may use it lightly |
| Athlete session logging (RPE, sets, notes) | Direct | Core | Reusable for any gym or practice work |
| Support levels | Direct | **Differentiator** | The right pattern for mixed squads |
| Timetable and attendance | Config (timezone, cohorts) | Core for group sessions | Becomes "practice schedule" for teams |
| Messaging and group chats | Direct | Core | Needs safeguarding controls kept for under-18s |
| Garmin integration | Rework (per-workspace, neutral metrics) | **Differentiator** | The most valuable and the trickiest (§5) |
| VALD testing import | Config (per-workspace credentials) | Differentiator | Only for teams with VALD hardware |
| Results upload and testing records | Direct | Core for testing-led clients | The new "add a test" step helps non-standard batteries |
| Nutrition (meal photos, recipes, hydration) | Config | Nice, or Core for some clients | Sensible as an add-on module; you were already moving it to its own tab |
| Resources library | Direct | Nice | Searchable PDF library is a good sales demo |
| Reports log | Direct | Nice, becomes Differentiator | The planned report generation is where AI helps most |
| Safeguarding log | Direct | Core where minors are involved | Also a trust signal when selling to schools and academies |
| Maturation tracking (growth, PHV) | Config (module) | Youth-specific | Switch off for adult teams |
| Parent portal (planned) | New | Differentiator for youth | Same module system |
| Mobility tab (archived) | n/a | Nice | Keep archived until it has a home |

**Hardest to carry over, in order:** (1) wearable data (provider-specific and subject to Garmin's terms), (2) the athlete JSON blob, (3) shared libraries and custom tests, (4) Academy tier logic and hard-coded timezone, (5) scheduled jobs.

**Essential to keep identical everywhere:** security rules, athlete consent and sharing switches, safeguarding, the check-in loop, the dashboard principles (only show what drives a decision, compare athletes with themselves, label how much data a number rests on).

---

## 5. Audit findings (health of the system)

### Strengths
- **Security design is better than most prototypes:** row-level security on all 75 tables, rules routed through shared helper functions, athletes' health switches enforced in the database, rolled-back persona tests used for each change.
- **Fail-soft, tested business logic** for the dashboard, imports and readiness rules (pure functions with tests).
- **Fast delivery loop:** CI on every push, automatic deployment.
- **Good product instincts already in code:** support levels, consent switches that hide whatever an athlete switches off from coaches (enforced in the database), menstrual-cycle data from the watch not stored at all, and cycle-related check-in answers kept off the squad screen.

### Risks (severity: High / Medium / Low)

| # | Finding | Severity | Why it matters | Fix |
|---|---|---|---|---|
| 1 | **No tenant isolation** | High (blocker for multi-team and selling) | A second team cannot be added safely | Workspaces (§2.4) |
| 2 | **Athlete data in one JSON blob** (≈120 KB average, 250 KB max, loaded for the whole roster) | High at scale | Slow at 100+ athletes; no per-field permissions; no cross-athlete analysis; hard to audit who changed what | Move `phase2` sections (performance, maturation, physio, psych, goals) into tables one at a time |
| 3 | **Hosting plan**: Vercel Hobby is **non-commercial** per Vercel's own policy and caps at 12 functions (9 used) | High before selling | Commercial use needs Pro or Enterprise; the cap constrains new features | Move to Pro before any paying customer ([Vercel fair-use policy](https://vercel.com/docs/limits/fair-use-guidelines)) |
| 4 | **Garmin terms**: evaluation access is not the same as a production commercial agreement; commercial use may require a licence and brand attribution | High before selling | Evaluation apps used commercially may be disabled; sharing Garmin-sourced data onward needs attribution | Apply for production approval and confirm with Garmin what your sponsored arrangement covers ([Garmin Health API](https://developer.garmin.com/gc-developer-program/health-api)). I couldn't read Garmin's own terms, so this needs checking directly |
| 5 | **No repeatable environment**: 60 loose SQL scripts plus 24 migrations, no baseline; the dev database was scrapped | High for onboarding new teams | You can't reliably create a fresh copy of the database in minutes | Create a baseline migration set; one script to create a new workspace |
| 6 | **Deploys straight to production, no staging** | Medium now, High with paying customers | A bad push affects everyone | A staging environment and a preview step before `master` |
| 7 | **44 of 169 components call the database directly** | Medium | Hard to test, hard to change data source | Gradually move data access into hooks (the newer dashboard code already does) |
| 8 | **Thin tests for the size**: 161 unit tests over ~67,800 lines; no end-to-end tests of the key flows (sign-in, check-in, log a session) | Medium | Regressions in the athlete app are found by users | A short list of automated end-to-end checks on staging |
| 9 | **Global credentials and keys** (Garmin, VALD, AI, push) | Medium | One leaked or exhausted key affects every team; no per-team cost tracking | Per-workspace credentials in encrypted storage |
| 10 | **Hard-coded timezone, tiers and domain** | Medium | Breaks reminders and cohorts for other regions and sports | Workspace settings (§2.4) |
| 11 | **No monitoring or alerting** visible in the repo; Vercel Hobby keeps about an hour of logs | Medium | Problems are found by users; no audit trail for incidents | Error monitoring, uptime checks, longer log retention |
| 12 | **Large files** (12 files over 680 lines) | Low | Slower changes, higher bug risk in the programming area | Split opportunistically when touched |
| 13 | **Compliance posture not yet documented**: minors, health data, consent, retention, deletion on request, data location | High before selling (medium today for one academy) | Required by regulators and by serious buyers | See §7.5 |
| 14 | **31 security-definer functions** run with elevated rights | Medium | Each is a potential bypass if written loosely | A one-off review of all 31 with tests |

*(I did not run a penetration test, check the Supabase plan, region or backup settings, or review the Vercel project settings; those need doing as part of the audit you want to schedule.)*

---

## 6. Target shape and roadmap

**Target (one sentence):** *Accounts have memberships in workspaces; a workspace turns modules on and off; athletes have capabilities; every screen reads provider-neutral data and degrades gracefully.*

| Phase | What | Rough effort | Unlocks |
|---|---|---|---|
| 0. Audit and spike | Security review of the 31 functions, backup/region check, one-day workspace spike, baseline migrations | 3 to 5 days | A confident plan and a repeatable database |
| 1. Foundations | Workspace model, identity settings, staging environment, per-workspace jobs | ~3 weeks | A safe second team |
| 2. Pilot: Wildcats | Switcher, basketball settings (positions, games, minutes), data import | 1 to 2 weeks | Proof that isolation and the switcher work |
| 3. Modules and capabilities | Module registry, capability checks, configurable dashboard | 1 to 2 weeks | Teams that want only part of the system |
| 4. Neutral metrics layer | Provider-agnostic daily metrics; Garmin as an adapter; manual entry | 1 to 2 weeks | Mixed device squads, other brands |
| 5. Break up the athlete blob | Move sections into tables one by one | 3 to 4 weeks, in parallel | Scale and fine-grained permissions |
| 6. Commercial readiness | Billing, onboarding flow, terms, support, status page | 2 to 3 weeks | Selling |

Estimates assume I do the building and you review; calendar time depends on how quickly you can give decisions. Phases 1 to 4 are about **8 to 11 weeks of build time in total**; a first externally usable pilot is possible after Phase 2.

---

## 7. Making it sellable and fractional

### 7.1 The honest picture of the market

- **Software licences are cheap at the low end.** Public examples: an AMS tier listed at about [$1,500 a year for up to 500 athletes](https://rockdaisy.com/pricing/); athlete-monitoring tools listed [from around €13 per athlete per year](https://intuitionlabs.ai/software/sports-medicine-athletic-training/team-and-athlete-management/athletemonitoring-ams); small-team plans in the hundreds of dollars a year. Enterprise tools (Smartabase, Kitman, Teamworks, CoachMePlus) are quote-based, so I couldn't find their prices.
- **So a licence alone is a weak business.** If someone can get an AMS for a few hundred dollars, they won't pay a premium for the software. They will pay for results.
- **You are right that AI lowers build cost.** The same fact lowers *your* cost of customisation and makes DIY attempts common. Treat DIY as the main competitor, not other vendors.

### 7.2 Why enter now, and why people would still pay (your argument, sharpened)

1. **The expensive part isn't code any more; it's judgement.** A coach with an AI tool can build a dashboard in days. The hard questions remain: *which metrics matter? compared with what? how many days of data before a flag means anything? when do I act?* Your readiness logic (own baseline, smallest worthwhile change, say what a number rests on) is the kind of opinionated know-how that saves weeks of trial and error.
2. **"The last 20%"** is where DIY projects stall: security for minors' data, Garmin and VALD plumbing, consent switches, reminders, offline use, backups, keeping it running.
3. **Visualisation is the product.** People don't pay for storage; they pay to *see* what to do. Your Mon–Fri board, the aligned athlete table, and the "needs you today" list show the principle.
4. **Time = money.** Live in a week, configured to their squad, versus weeks of building and then maintaining.
5. **Data stewardship.** Someone responsible for the data staying safe, available and portable.

**The counter-argument to prepare for:** *"I can build it myself with AI."* The answer isn't "you can't", it's "you can, and then you own the plumbing, the privacy risk and the upkeep, and you still have to decide what to look at. We've already made those decisions with a real academy."

### 7.3 Packaging: modular and fractional

**Layer 1: Platform (self-serve or lightly assisted)**
- *Core:* roster and profiles, wellness check-ins, the dashboard, messaging, resources.
- *Modules (add as needed):* Programming and session logging; Wearables (Garmin and others); Testing and KPI board (including VALD); Timetable and attendance; Nutrition; Parent portal; Reports.

**Layer 2: Performance Partner (premium, the fractional performance team)**
- Dedicated performance analyst/engineer a set number of days a month.
- Setup and migration (digitising your testing battery, importing history).
- Device roll-out and athlete onboarding.
- A weekly insight note ("three things to act on this week").
- Custom screens and reports on request: *bring us the idea, we turn it into a working view* (a fixed-price "dashboard sprint").
- Staff education: how to read the signals and what to do.

**Layer 3: Club/Enterprise:** multiple workspaces under one account, SSO, data-location commitments, service levels, benchmarking.

**Pricing shapes to test** *(hypotheses, not recommendations until you've talked to buyers)*:

| Model | How it works | Pros | Cons |
|---|---|---|---|
| Workspace fee + athlete bands | e.g. a base fee plus a price per active athlete per month, with a minimum | Predictable; scales with value | Small teams find minimums steep |
| Per-module add-ons | Core price plus each module | Matches "choose the bits you like" | Needs clear module boundaries (§3) |
| Retainer | Monthly fee for Performance Partner days | High margin, sticky | Limited by people's time |
| Setup fee | One-off for onboarding and migration | Funds the first weeks | Can slow sales if too high |

A sensible starting hypothesis is **a low-priced platform that is easy to say yes to, and the margin in the partner service**: software gets you in the door, the service is the business. Test two or three price points with pilot customers rather than guessing.

### 7.4 Marketing angle

**Positioning line options** (pick one to test):
- *"Your performance team's operating system."*
- *"Know who needs you today."*
- *"The dashboard that tells you what to do, not just what happened."*

**Pillars:** 1) **See it** (visual insight, not spreadsheets); 2) **Trust it** (compares each athlete with themselves; says how much data a number rests on; privacy by design for minors); 3) **Fit it** (modules and support levels: programmed, wearable, hands-off in one squad); 4) **We help** (a dedicated performance partner turns ideas into screens).

**Proof assets you already have:** the dashboard (the strongest demo), the "support levels" idea, the consent switches, the text-to-training week import, and the Academy as a live case study. A pilot with the Wildcats gives a second, different sport.

**Audiences, in order of fit (inference):** private academies and clubs in the Gulf and similar regions (your network and timezone), performance coaches running several groups, school and university programmes (safeguarding is a selling point), then national or professional teams (longer cycles, tougher compliance).

**Channels:** direct demo to coaches and academy directors; "audit your current setup" offer as a lead magnet; short video walk-throughs of one screen at a time; case study; conference and federation relationships.

### 7.5 What must be true before you charge anyone

1. **Tenant isolation proven by tests** (Phase 1).
2. **Paid hosting** (Vercel Pro or equivalent) and a confirmed database plan with backups and point-in-time recovery.
3. **Garmin production and commercial approval**, with the required attribution on shared data; the same check for VALD. This is the item most likely to hold up a launch, so start the conversation early. Your sponsored arrangement with Garmin may help, but confirm what it covers.
4. **Legal:** a trading entity, terms of service, privacy policy and data processing agreement, a policy for minors' data and parental consent, data deletion and export on request, a retention policy, and a view on UAE and other relevant data-protection law (I'm not giving legal advice; get a specialist to review).
5. **Support and reliability:** monitoring, a status page, a support route, a defined response time.
6. **Billing and onboarding:** subscription billing, a new-workspace setup that takes minutes, and an import path for existing spreadsheets.
7. **Insurance and liability wording:** the system supports decisions; it must not look like medical advice (the readiness wording is already careful here).

### 7.6 Margin and risk sketch (inference)

- Infrastructure is cheap per team (shared database, hosting in the tens of dollars a month, AI usage per team to track). **Your scarce resource is people's time**, so the business is a productised service. Fix the scope of the setup and the weekly note so the work doesn't grow without limit.
- Main risks: Garmin and other vendor terms; one vendor price war; a big client demanding custom work that becomes a fork; and dependence on you personally (so write down playbooks early).

### 7.7 Go-to-market sequence

1. Finish Phase 1 and run the **Wildcats as workspace two** (free or low-cost pilot, in return for feedback and a case study).
2. Sign **three paid pilots** at a founder discount, from different sports.
3. From what they actually use, set the **module boundaries and prices**.
4. Productise onboarding (setup checklist, templates, import tools), then open to a wider list.

---

## 8. Decisions and information I need from you

1. **Wildcats:** are they a separate organisation (their own staff and athletes, never seen by the Academy) or part of the same umbrella? Which of your coaches work across both?
2. **Branding and identity:** should each team have its own name, colours, logo and install address? (Recommended: yes.)
3. **Basketball needs:** positions, game stats (minutes, results), squad groupings, fixture handling: what must it do on day one?
4. **Shared or separate libraries:** should exercises, recipes and wellness questions be shared across teams, or kept separate per team? (Recommended: a shared starting library each team can copy and edit.)
5. **Athletes in two teams:** will this happen? It complicates sharing and consent.
6. **Garmin partnership:** what exactly does the sponsorship give you (devices, access terms, branding)? I'd like to put the right questions to Garmin about commercial use.
7. **Commercial intent:** do you plan to sell to third parties soon (which brings the legal and hosting items forward), or first run the Academy and Wildcats on it?
8. **Appetite for service delivery:** would you or someone else deliver the Performance Partner layer, and how many hours a month could that realistically be?
9. **Scheduling the audit:** I'd propose a one-week audit (security review of the 31 elevated functions, backup and region check, workspace spike, baseline migrations, hosting and Garmin terms review), then a written plan. Tell me when you want it to start.

---

## 9. Sources

- Vercel Hobby plan is non-commercial: [fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- Garmin Health API: [commercial use needs a licence; evaluation then production](https://developer.garmin.com/gc-developer-program/health-api). Third-party guides on approval and attribution should be treated as unverified until checked with Garmin.
- Market price examples: [RockDaisy pricing](https://rockdaisy.com/pricing/), [AthleteMonitoring AMS profile](https://intuitionlabs.ai/software/sports-medicine-athletic-training/team-and-athlete-management/athletemonitoring-ams). I found no public prices for Smartabase, Teamworks, CoachMePlus or Kitman Labs.
- All code and database numbers were measured on 2026-11-11 from the repository and the live Supabase project.

---

## 10. Addendum (same day): organisations, squads and moves

This replaces the single "workspace" idea in §2. Your clarification: two stages. **Stage 1:** ProPath itself becomes an umbrella with separate sections (Academy athletes, and the Wildcats / "NBA" section). **Stage 2:** sell the same system to a pro team (squads that athletes and staff move between) or a university (volleyball, netball, basketball, soccer, tennis, each kept separate).

### 10.1 One model covers both stages

**Organisation → Squads → Athletes**

| Level | What it is | Examples |
|---|---|---|
| **Organisation** | The customer: one legal entity, one contract, one brand, one set of integration accounts | ProPath; a pro club; a university |
| **Squad** | A wall around access and configuration | Academy, Wildcats; First team, Reserves, U18; Volleyball, Netball, Soccer |
| **Athlete** | One person, one profile, one login | Belongs to one or more squads over time |

- **Staff** get a role *per squad* (head coach of Wildcats, physio across three squads, analyst on all). An organisation admin can be on every squad.
- **The "Netflix" switcher** shows the squads *you* have access to. Pick one and you are inside it; nothing from other squads appears. Staff on several squads can switch; staff on one never see the switcher.
- **Athletes** keep one login for life. Which squad(s) they are in decides what the app shows them.

### 10.2 Why this sequencing is cheaper than it looked

- **Stage 1 needs squads, not full separate customers.** Academy and Wildcats are both ProPath: one contract, one brand, one set of Garmin and VALD accounts, one billing. So I don't need hard tenant isolation, per-customer credentials or per-customer billing yet. I only need squad walls, the switcher, per-squad settings and moves. **Estimated 3 to 4 weeks** (down from my earlier whole-workspace estimate).
- **Stage 2 adds one level above squads.** Every squad gets an organisation, and all access already goes through squads, so adding organisations later is mostly one extra rule plus per-customer settings, credentials and billing (**estimated 4 to 6 weeks**, as in §6 and §7.5). Stage 1 work is not thrown away.
- **Design rule for Stage 1:** build the tables with an organisation column from day one (one organisation, ProPath), and route every access check through two central functions (*can I see this athlete? can I see this squad?*). Then Stage 2 is a configuration change, not a rewrite.

### 10.3 Data sketch (new tables)

- `organisations` (name, branding, timezone default, settings)
- `squads` (organisation, name, sport, terminology, enabled modules, default support level, dashboard layout)
- `squad_staff` (person, squad, role, from, to), replacing the single global role
- `squad_memberships` (athlete, squad, role such as primary or secondary, from, to), the history of where an athlete has been
- Squad-owned content gets a squad column: timetable slots, chat rooms, programme templates, custom tests, wellness question set, resources.

### 10.4 Who sees what

| Situation | Rule I'd start with |
|---|---|
| Staff on one squad | See only that squad's current athletes and content |
| Staff on several squads | See each squad they belong to, one at a time via the switcher |
| Organisation admin (director, athletic director) | All squads, with an optional **overview across squads** that shows counts and flags but is read-only |
| Shared-service staff (physio, nutritionist, analyst) | Named squads only; the existing "external provider" allocation idea extends to this |
| Athlete | Own data across everything they are part of |
| Parent | Their child only, in whatever squad the child is in |
| University: volleyball coach vs netball coach | **No visibility into each other's squad**, ever, unless named on both |

### 10.5 Moving an athlete between squads (the key design question)

An athlete's data splits into what is **about the person** and what is **about the squad**:

| Follows the athlete (shown to the receiving squad) | Stays with the squad that created it |
|---|---|
| Profile, date of birth, photo, emergency contacts | Programmes and planned sessions |
| Testing results and history | Timetable replies, attendance |
| Wellness trend, injury and medical history (with tighter access) | Team chats and coach notes |
| Wearable connection and sharing choices (re-confirmed on a move) | Squad programme templates |
| Maturation and growth records | Squad-specific goals and plans |

- **A move is a dated event**, not a copy: end the old membership, start the new one, keep the history. Nothing is deleted.
- **The old squad's staff lose access from the move date**, except for a time-limited **handover window** (for example 14 days) if the organisation wants one.
- **Concurrent membership:** allowed as primary plus secondary (a first-team player training with the reserves; a student on both volleyball and basketball). Load and wellness are then shared across both, so coaches don't double-load the athlete.
- **Sensitive records** (medical, safeguarding) need their own explicit rule; I'd default them to "follow the athlete, visible to named medical staff and the receiving head coach".
- **Consent:** an athlete (or a minor's parent) is told when they move and what the new squad can see; wearable sharing switches are asked again.

### 10.6 What changes in the code

- The current security rules already funnel through a few helper functions (`is_staff()` in 67 of 137 policies, `can_see_athlete()` in 25). Those helpers become squad-aware, and the tables that are not athlete-linked (timetable, chats, templates, settings, catalogues) get a squad column.
- `provider_allocations` (external providers see only allocated athletes) is an early version of this idea and can be generalised.
- The dashboard, athlete app and reports read "the current squad" from the switcher instead of assuming one group.
- Roster filters, reminders and scheduled jobs run per squad, in the squad's timezone and with its terminology.

### 10.7 Revised phase plan

| Stage | Step | Estimate |
|---|---|---|
| **1. ProPath umbrella** | Squad model, memberships, squad-aware access, tests proving one squad can't see another | 5 to 7 days |
| | Switcher and "current squad" in coach and athlete apps | 3 to 4 days |
| | Per-squad settings (modules, terminology, tiers or positions, support-level defaults, dashboard widgets) | 3 to 4 days |
| | Athlete moves, concurrent membership, handover window, consent prompt | 3 to 4 days |
| | Wildcats configuration (positions, games and minutes, team views) | 4 to 6 days |
| | **Stage 1 total** | **about 3 to 4 weeks** |
| **2. Sellable** | Organisation level, per-customer integrations and credentials, billing, onboarding in minutes, legal and support (see §7.5) | **about 4 to 6 weeks** |

Estimates assume one focused builder and quick decisions; I would confirm them with a one-day spike on the access rules before committing.

### 10.8 Why this is a stronger product story

- **"Walls and doors."** Strict separation between squads by default, with deliberate, auditable doors (a move, a shared physio, an organisation overview).
- **Athlete continuity.** Pro clubs and universities lose an athlete's history every time someone moves squad or leaves. Here the athlete's record follows them and the squad's private notes don't.
- **Natural pricing unit.** A squad is something a buyer understands and can budget for: a platform fee per organisation plus a price per squad (with athlete bands), and the Performance Partner layer scaled by number of squads.
- **Two clear launch customers:** a pro club (first team, reserves, academy, with promotion and loans) and a multi-sport university (separate sport squads, shared sports-science staff, strict separation).

### 10.9 Questions this raises (answers shape Stage 1)

1. **"NBA" vs "Wildcats":** is this the same section (the basketball team) or something larger? Is it a separate customer later, or permanently part of ProPath?
2. **Cross-squad visibility:** should ProPath admins see an overview of all squads by default, or only squads they are named on?
3. **Moves:** do you agree with the follow / stays split in 10.5? What should happen to coach notes and programmes?
4. **Concurrent squads:** will athletes be in two squads at once (pro: first team and reserves; university: two sports)?
5. **Shared staff:** will physios, nutritionists or analysts serve several squads?
6. **Parents and athlete logins across squads:** one login and one parent link per athlete, regardless of squad (recommended)?
7. **Libraries:** should exercises, recipes and wellness questions be shared across squads or per squad? (Recommended: one shared starting set that each squad can copy and edit.)
8. **Squad terminology:** athlete vs player, cohorts vs positions, per squad?
