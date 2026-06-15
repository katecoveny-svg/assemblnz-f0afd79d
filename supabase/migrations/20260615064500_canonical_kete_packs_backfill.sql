-- One-shot backfill: normalise kb_sources.agent_packs to the canonical kete
-- tagging. Historically a few non-canonical pack names were used
-- (pakihi, muse, hangarau, kahu, flux, whenua). Map them to the canonical 9
-- (or the shared `cross` bucket for cross-cutting sources), de-duplicate, and
-- drop anything outside the canonical set. Idempotent: only touches rows that
-- still carry a non-canonical tag, so re-running is a no-op.
--
-- Read-side mirror of this map lives in lib/live-feed/kete-relevance.ts
-- (normalizeKetePacks), so the UI stays canonical even if a stray tag slips in.

update kb_sources
set agent_packs = (
  select array_agg(distinct mapped order by mapped)
  from (
    select case pack
      when 'pakihi' then 'hoko'      -- business → commerce
      when 'muse' then 'auaha'       -- creative
      when 'hangarau' then 'cross'   -- technology → cross-cutting
      when 'kahu' then 'cross'
      when 'flux' then 'cross'
      when 'whenua' then 'cross'
      else pack
    end as mapped
    from unnest(agent_packs) as pack
  ) m
  where mapped in (
    'manaaki','waihanga','auaha','arataki','pikau','ako','matauranga','hoko','toro','cross'
  )
),
updated_at = now()
where agent_packs && array['pakihi','muse','hangarau','kahu','flux','whenua']::text[];
