# ProPath AMS

Athlete Management System for ProPath Academy. React 18 + Vite + Tailwind on
the front end, Supabase (Postgres + Auth + Realtime + Storage) as the backend,
deployed on Vercel with a handful of serverless functions under `api/`.

## Surfaces

| URL | Who | Auth |
|---|---|---|
| `/` | Coaches / admins / external providers | Supabase Auth (email + password), roles in `user_roles` |
| `/athlete/:token` | Athletes (installable PWA) | Per-athlete permanent token, validated via `validate_athlete_token` RPC |
| `/wellness/:token` | Athletes (wellness form) | Per-athlete wellness token, validated via `validate_wellness_token` RPC |

Roles: `admin` (full access + user management), `co_admin` (everything except
user management), `external` (read/write only their allocated athletes).

## Local development

```bash
npm install
cp .env.example .env      # fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
```

By default `npm run dev` on localhost bypasses Supabase Auth and renders as a
mock admin (`DEV_BYPASS` in `src/hooks/useAuth.js`). Set `VITE_DEV_BYPASS=false`
to exercise the real login flow. Note: since the RLS lockdown, most tables
require an authenticated session — expect empty coach views in bypass mode
unless you point at a local Supabase instance.

`npm run build` produces the production bundle; `npm run preview` serves it.

## Database

Schema lives in SQL files run manually in the Supabase SQL Editor:

- `supabase/migrations/` — dated migrations (run in filename date order)
- `sql/` — earlier feature schemas and one-off seeds
- `auth_schema.sql`, `user_management_schema.sql` — auth/roles foundation

**Security model** (post `security-lockdown-2026-07-06.sql`):

- Coach-authoring tables: staff-only writes (`is_staff()` = admin/co_admin),
  authenticated reads.
- Token tables (`athlete_app_tokens`, `wellness_tokens`): no anon access;
  public pages validate tokens through `SECURITY DEFINER` RPCs that return
  only the row matching the presented token.
- Shared content the athlete app renders (exercise library, planned sessions,
  recipes, resources…): anon read-only.
- Athlete log tables (`session_logs`, `set_logs`, meal + wellness tables):
  minimal anon insert/update surface.
- Known interim gap: anon reads of planned/log tables are not scoped
  per-athlete (needs a token-exchange edge function — see docs/).

## Serverless functions (`api/`)

All endpoints require a `Authorization: Bearer <supabase-jwt>` header
(verified in `api/_lib/verifyUser.js`):

- `POST /api/recipes/extract` — Claude-powered recipe extraction from PDF text
- `GET /api/vald/sync` — pulls ForceDecks results from the VALD external API
- `GET /api/manifest/:token` — per-athlete PWA manifest (public by design)

Edge function `supabase/functions/invite-user` sends invites; verifies the
caller is an admin before using the service-role key.

## Deployment

Vercel. `vercel.json` rewrites all non-`/api` routes to `index.html` (SPA).
Set the env vars listed in `.env.example` (both the `VITE_`-prefixed client
vars and the server-side ones) in the Vercel project settings.
