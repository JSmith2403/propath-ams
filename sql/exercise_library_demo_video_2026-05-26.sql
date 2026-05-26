-- exercise_library_demo_video_2026-05-26.sql
-- ----------------------------------------------------------------------
-- Adds an optional `demo_video_url` to every exercise so coaches can
-- attach a YouTube / Vimeo / direct video link from the Exercise Library
-- admin view (or from a coach edit flow). The athlete app surfaces it
-- as a "Watch demo" button on the session logger so athletes can sanity
-- check form before they pick the bar up.
--
-- Nullable / no default — existing exercises just have a NULL and the
-- button hides itself when there's no link.
-- ----------------------------------------------------------------------

ALTER TABLE public.exercise_library
  ADD COLUMN IF NOT EXISTS demo_video_url text;

COMMENT ON COLUMN public.exercise_library.demo_video_url IS
  'Optional URL to a video demo for this exercise. Surfaced as a "Watch demo" link on the athlete app session logger.';
