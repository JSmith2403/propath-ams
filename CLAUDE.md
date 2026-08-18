# ProPath AMS

React 18 + Vite + Supabase (PostgREST) + Vercel, Tailwind CSS. Production branch is `master` (not `main`).

## Environments

- **Live** — Supabase project `xaawuxckpztxuyywebop`. The one real athlete data lives in. Deployed from `master`.
- **Dev** — Supabase project `mdqzxhihyglxhgezxeat`. Not required to mirror live day-to-day.

## Workflow (decided 2026-08-18)

Work directly against **live** for routine changes — schema tweaks, feature work, bug fixes. Traffic is low enough that live changes don't have major blast radius, and maintaining dev as a mandatory pre-live step wasn't paying for itself: it drifted for months (paused from inactivity) while development kept moving on `master`/live directly, so the "safety net" wasn't actually catching anything.

Reserve a slower, more careful pass — dev testing, extra review, or at least a deliberate go/no-go check — for changes that are **large, hard to reverse, or high-blast-radius**: big schema redesigns, destructive migrations, or merging a large parked feature branch (e.g. Inner Athlete / session logging / wellness redesign) into `master`.

Before any risky live change, confirm point-in-time recovery / scheduled backups are enabled on the live Supabase project (Settings → Add-ons or Infrastructure) — that's the actual safety net now that dev isn't reliably one.

## Rules

- Never commit `.env*` files (other than `.env.example`) or any file containing real API keys/tokens/connection strings.
- Don't push to `master` without explicit sign-off.
