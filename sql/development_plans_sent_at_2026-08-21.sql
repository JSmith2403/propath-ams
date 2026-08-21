-- development_plans_sent_at_2026-08-21.sql
-- ----------------------------------------------------------------------
-- Adds an explicit "sent to athlete" step. The athlete can already see
-- and add their own goals to an open plan (needed for the coach-adopt
-- workflow), but the coach's narrative/RAG summary — the actual report
-- — only surfaces on the athlete's Progress tab once this is stamped.
-- ----------------------------------------------------------------------

ALTER TABLE public.development_plans
  ADD COLUMN IF NOT EXISTS sent_at timestamptz;

NOTIFY pgrst, 'reload schema';
