-- Recreate view without SECURITY DEFINER (linter ERROR fix)
DROP VIEW IF EXISTS public.kb_source_health;
CREATE VIEW public.kb_source_health
WITH (security_invoker = true)
AS
SELECT
  s.id, s.name, s.type, s.category, s.cadence_minutes, s.active,
  s.last_checked_at, s.last_updated_at, s.status, s.consecutive_failures,
  EXTRACT(EPOCH FROM (now() - COALESCE(s.last_checked_at, s.created_at))) / 60 AS lag_minutes,
  CASE
    WHEN NOT s.active THEN 'paused'
    WHEN s.last_checked_at IS NULL THEN 'never_run'
    WHEN s.consecutive_failures >= 2 THEN 'red'
    WHEN EXTRACT(EPOCH FROM (now() - s.last_checked_at)) / 60 > s.cadence_minutes * 3 THEN 'yellow'
    WHEN s.status = 'error' THEN 'red'
    ELSE 'green'
  END AS health
FROM public.kb_sources s;

-- Set search_path on functions created in the previous migration
ALTER FUNCTION public.match_kb_knowledge(vector, text, int) SET search_path = public;
ALTER FUNCTION public.kb_set_updated_at() SET search_path = public;

-- Auto-enqueue embedding job on new/updated document content
CREATE OR REPLACE FUNCTION public.kb_enqueue_embedding() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (NEW.content_hash IS DISTINCT FROM OLD.content_hash) THEN
    INSERT INTO public.kb_embed_queue(document_id, status) VALUES (NEW.id, 'pending');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_kb_documents_enqueue_embed ON public.kb_documents;
CREATE TRIGGER trg_kb_documents_enqueue_embed
  AFTER INSERT OR UPDATE OF content_hash ON public.kb_documents
  FOR EACH ROW EXECUTE FUNCTION public.kb_enqueue_embedding();

-- Seed: 12 priority NZ feeds (Plan §11)
INSERT INTO public.kb_sources(name, type, url, category, agent_packs, cadence_minutes, config) VALUES
  ('Beehive — Government releases',     'rss',         'https://www.beehive.govt.nz/feed/releases',                                  'gov_news',     ARRAY['cross','pakihi','hangarau'],                  60,  '{}'),
  ('NZ Parliament — Bills RSS',          'rss',         'https://www.parliament.nz/en/pb/rss/bills/all/',                              'legislation',  ARRAY['cross','pakihi'],                              360, '{}'),
  ('NZ Gazette — Latest notices',        'rss',         'https://gazette.govt.nz/notice/rss',                                          'legislation',  ARRAY['cross'],                                       180, '{}'),
  ('CERT NZ — Advisories',               'rss',         'https://www.cert.govt.nz/about/news-and-events/feed/',                        'security',     ARRAY['hangarau','cross'],                            60,  '{}'),
  ('WorkSafe NZ — News & alerts',        'rss',         'https://www.worksafe.govt.nz/about-us/news-and-media/feed/',                  'safety',       ARRAY['waihanga','manaaki','arataki','whenua'],       180, '{}'),
  ('Privacy Commissioner — News',        'rss',         'https://www.privacy.org.nz/publications/statements-media-releases/rss/',     'privacy',      ARRAY['cross'],                                       360, '{}'),
  ('IRD — Tax Information Bulletin',     'rss',         'https://www.taxtechnical.ird.govt.nz/rss-feeds/tib',                          'tax',          ARRAY['pakihi','cross'],                              720, '{}'),
  ('MetService — Severe weather',        'rss',         'https://www.metservice.com/publicData/rss/warning/region',                    'weather',      ARRAY['waihanga','manaaki','whenua','arataki'],       30,  '{}'),
  ('GeoNet — Quakes (M3+)',              'json_api',    'https://api.geonet.org.nz/quake?MMI=3',                                       'hazard',       ARRAY['cross','waihanga'],                            15,  '{"path":"features"}'),
  ('NVD — Recent CVEs',                  'json_api',    'https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=20',          'security',     ARRAY['hangarau'],                                    180, '{"path":"vulnerabilities"}'),
  ('RNZ — Top stories',                   'rss',         'https://www.rnz.co.nz/rss/national.xml',                                      'news',         ARRAY['cross','manaaki'],                             30,  '{}'),
  ('GETS — Government tenders',          'rss',         'https://www.gets.govt.nz/ExternalIndex.htm?action=rss',                       'tenders',      ARRAY['pakihi','waihanga'],                           120, '{}')
ON CONFLICT DO NOTHING;