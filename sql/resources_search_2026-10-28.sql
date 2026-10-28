-- ============================================================================
-- Resources: tags + searchable PDF text + a search function.            2026-10-28
--
--   tags         coach-chosen sub-topics ("pre-game", "recovery") — shown as chips and searched first
--   search_text  the text inside the PDF, extracted when the coach uploads it (or re-indexed), so a search for
--                "pre-game snacks" can find the page that mentions them even if the title doesn't
--   search_resources(groups)   one group per idea the athlete typed, each group = the word + near-synonyms
--                  ("pre game match", "snack fuel food"). Words are stemmed (snack = snacks). Tries "every idea
--                  present" first, falls back to "any idea". Returns a ranking + a short snippet of the matching text.
--                  Runs as the caller, so athletes only ever get published resources.
-- Athletes now only read PUBLISHED resources (before, unpublished drafts were readable through the API).
-- ============================================================================

ALTER TABLE public.resource_items ADD COLUMN IF NOT EXISTS tags        text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.resource_items ADD COLUMN IF NOT EXISTS search_text text;

DROP POLICY IF EXISTS w2_read ON public.resource_items;
CREATE POLICY w2_read ON public.resource_items FOR SELECT TO authenticated
  USING ((is_published AND public.is_app_user()) OR public.is_staff());

CREATE OR REPLACE FUNCTION public.search_resources(p_groups text[])
RETURNS TABLE (id uuid, rank real, snippet text, all_ideas boolean)
LANGUAGE plpgsql STABLE SET search_path = public, pg_temp AS $$
DECLARE and_q tsquery; or_q tsquery; g text; w text; gq tsquery; wq tsquery;
BEGIN
  IF p_groups IS NULL THEN RETURN; END IF;
  FOREACH g IN ARRAY p_groups LOOP
    gq := NULL;
    FOREACH w IN ARRAY regexp_split_to_array(lower(g), '\s+') LOOP
      CONTINUE WHEN length(w) < 2;
      wq := plainto_tsquery('english', w);
      CONTINUE WHEN numnode(wq) = 0;
      gq := CASE WHEN gq IS NULL THEN wq ELSE gq || wq END;
    END LOOP;
    IF gq IS NOT NULL THEN
      and_q := CASE WHEN and_q IS NULL THEN gq ELSE and_q && gq END;
      or_q  := CASE WHEN or_q  IS NULL THEN gq ELSE or_q  || gq END;
    END IF;
  END LOOP;
  IF and_q IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH docs AS (
    SELECT r.id AS rid,
           setweight(to_tsvector('english', coalesce(r.title, '')), 'A')
        || setweight(to_tsvector('english', array_to_string(r.tags, ' ')), 'A')
        || setweight(to_tsvector('english', coalesce(r.summary, '')), 'B')
        || setweight(to_tsvector('english', coalesce(r.file_name, '')), 'C')
        || setweight(to_tsvector('english', coalesce(left(r.search_text, 60000), '')), 'D') AS tsv,
           coalesce(r.search_text, r.summary, '') AS body
    FROM public.resource_items r WHERE r.is_published
  )
  SELECT d.rid, ts_rank_cd(d.tsv, and_q),
         ts_headline('english', d.body, and_q, 'MaxWords=26, MinWords=12, ShortWord=2, StartSel=<<, StopSel=>>'), true
  FROM docs d WHERE d.tsv @@ and_q
  ORDER BY 2 DESC;
  IF FOUND THEN RETURN; END IF;

  RETURN QUERY
  WITH docs AS (
    SELECT r.id AS rid,
           setweight(to_tsvector('english', coalesce(r.title, '')), 'A')
        || setweight(to_tsvector('english', array_to_string(r.tags, ' ')), 'A')
        || setweight(to_tsvector('english', coalesce(r.summary, '')), 'B')
        || setweight(to_tsvector('english', coalesce(r.file_name, '')), 'C')
        || setweight(to_tsvector('english', coalesce(left(r.search_text, 60000), '')), 'D') AS tsv,
           coalesce(r.search_text, r.summary, '') AS body
    FROM public.resource_items r WHERE r.is_published
  )
  SELECT d.rid, ts_rank_cd(d.tsv, or_q),
         ts_headline('english', d.body, or_q, 'MaxWords=26, MinWords=12, ShortWord=2, StartSel=<<, StopSel=>>'), false
  FROM docs d WHERE d.tsv @@ or_q
  ORDER BY 2 DESC;
END $$;
REVOKE ALL ON FUNCTION public.search_resources(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_resources(text[]) TO authenticated;
