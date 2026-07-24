-- Coach retrospective notes on wellness submissions. Shown as a popover
-- when the coach clicks a data point on the trend chart.
ALTER TABLE public.wellness_responses
  ADD COLUMN IF NOT EXISTS coach_notes text;
