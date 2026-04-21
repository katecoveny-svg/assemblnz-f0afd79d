-- Fix Beehive URL (was 404)
UPDATE public.kb_sources
SET url = 'https://www.beehive.govt.nz/rss.xml',
    status = 'idle',
    consecutive_failures = 0
WHERE name = 'Beehive — Government releases';

-- Add 17 new verified working sources
INSERT INTO public.kb_sources (name, type, url, category, subcategory, agent_packs, cadence_minutes, provenance) VALUES
  ('Stuff — Top stories',                'rss',      'https://www.stuff.co.nz/rss',                                 'news',       'general',     ARRAY['kahu','flux','muse'],            120, 'Major NZ news outlet'),
  ('NZ Herald — Business',               'rss',      'https://www.nzherald.co.nz/business/rss.xml',                 'news',       'business',    ARRAY['flux','manaaki','waihanga'],     180, 'NZ Herald business desk'),
  ('Otago Daily Times',                  'rss',      'https://www.odt.co.nz/rss.xml',                               'regional',   'south_island',ARRAY['kahu','manaaki'],                240, 'Regional news — Otago/Southland'),
  ('Gisborne Herald',                    'rss',      'https://www.gisborneherald.co.nz/feed/',                      'regional',   'east_coast',  ARRAY['kahu','manaaki'],                360, 'Regional news — East Coast'),
  ('Scoop — Business',                   'rss',      'https://www.scoop.co.nz/RSS/business.xml',                    'news',       'business',    ARRAY['flux','manaaki'],                180, 'Independent NZ wire — business'),
  ('Scoop — Parliament',                 'rss',      'https://www.scoop.co.nz/RSS/parliament.xml',                  'governance', 'parliament',  ARRAY['kahu','flux'],                   180, 'Independent NZ wire — parliament'),
  ('Scoop — Regional',                   'rss',      'https://www.scoop.co.nz/RSS/regional.xml',                    'regional',   'national',    ARRAY['kahu'],                          240, 'Independent NZ wire — regional'),
  ('The Spinoff',                        'rss',      'https://www.thespinoff.co.nz/feed',                           'media',      'commentary',  ARRAY['kahu','muse'],                   360, 'NZ commentary & analysis'),
  ('Newsroom NZ',                        'rss',      'https://www.newsroom.co.nz/feed',                             'media',      'investigative',ARRAY['kahu','flux'],                  240, 'Investigative journalism'),
  ('e-Tangata',                          'rss',      'https://e-tangata.co.nz/feed/',                               'maori',      'media',       ARRAY['kahu','muse'],                   720, 'Māori & Pasifika voices'),
  ('The Daily Blog',                     'rss',      'https://thedailyblog.co.nz/feed/',                            'media',      'commentary',  ARRAY['kahu'],                          360, 'NZ political commentary'),
  ('Interest.co.nz',                     'rss',      'https://www.interest.co.nz/rss',                              'finance',    'markets',     ARRAY['flux','manaaki','waihanga'],     180, 'NZ economic & finance coverage'),
  ('Aviation NZ — News',                 'rss',      'https://www.aviation.govt.nz/feed/news.rss',                  'transport',  'aviation',    ARRAY['arataki','pikau'],               240, 'Civil Aviation Authority news'),
  ('Legislation NZ — Acts',              'rss',      'https://www.legislation.govt.nz/act/public/atom',             'legislation','primary',     ARRAY['kahu','manaaki','waihanga','arataki','auaha'], 360, 'Parliamentary Counsel Office — public Acts'),
  ('LINZ — News',                        'rss',      'https://www.linz.govt.nz/news.rss',                           'governance', 'land',        ARRAY['kahu','waihanga'],               360, 'Land Information New Zealand'),
  ('GeoNet — News',                      'json_api', 'https://api.geonet.org.nz/news/geonet',                       'hazard',     'seismic',     ARRAY['kahu','arataki','pikau'],         60, 'GeoNet news API'),
  ('Beehive — All releases',             'rss',      'https://www.beehive.govt.nz/feed',                            'gov_news',   'beehive',     ARRAY['kahu','flux'],                   120, 'NZ Government — all ministerial releases')
ON CONFLICT DO NOTHING;