-- ─────────────────────────────────────────────────────────────────────────────
-- Coach replies to a meal: the reply is an ordinary message to the athlete that remembers which meal it is about,
-- so the chat can show the meal quoted above it (WhatsApp style).
--
-- One nullable column on athlete_messages. If the meal is later deleted the message stays and just loses its quote.
-- Existing row-level security is unchanged (athletes read their own messages, staff read all; only the server
-- writes coach messages). Additive and safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.athlete_messages
  ADD COLUMN IF NOT EXISTS meal_entry_id uuid REFERENCES public.meal_entries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS athlete_messages_meal_idx
  ON public.athlete_messages (meal_entry_id) WHERE meal_entry_id IS NOT NULL;
