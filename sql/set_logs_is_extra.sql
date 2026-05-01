-- ============================================================================
-- ProPath — set_logs.is_extra flag
--
-- Distinguishes athlete-added sets (drop set, extra warm-up, tester)
-- from prescribed sets so adherence reporting can exclude them.
--
-- Run in dev project mdqzxhihyglxhgezxeat. Idempotent.
-- ============================================================================

alter table set_logs
  add column if not exists is_extra boolean not null default false;

create index if not exists idx_set_logs_is_extra
  on set_logs (session_log_id, is_extra);

notify pgrst, 'reload schema';
