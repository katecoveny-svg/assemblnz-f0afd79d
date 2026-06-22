-- ============================================================
-- dash– demo inventory: a fillable publisher + two live campaigns
-- ------------------------------------------------------------
-- Idempotent and safe to delete. Gives the network something to serve out of
-- the box so /api/dash/serve fills (and the admin dashboard shows real numbers)
-- the moment SUPABASE_SERVICE_ROLE_KEY is set in Vercel.
--
-- Eligibility (see lib/dash/auction.ts): status='active', bid >= NZ$25 floor,
-- budget remaining, and publisher_allowlist / surface_targeting are EMPTY
-- ARRAYS (never NULL — the serve route reads .length on them) = match all.
-- The on-site ad (components/site/dash/useDashAd.ts) requests publisher
-- 'assembl-hapai', so that's the slug we seed.
-- ============================================================

DO $$
DECLARE
  v_whittakers uuid;
  v_airnz uuid;
BEGIN
  -- Fillable publisher (the HAPAI wait-state surface).
  IF NOT EXISTS (SELECT 1 FROM public.dash_publishers WHERE slug = 'assembl-hapai') THEN
    INSERT INTO public.dash_publishers
      (company, website, contact_name, contact_email, status, is_anchor, rev_share, slug, active)
    VALUES
      ('assembl — HAPAI', 'https://assembl.co.nz', 'assembl', 'assembl@assembl.co.nz',
       'active', true, 0.600, 'assembl-hapai', true);
  END IF;

  -- Advertisers (get-or-create by company).
  SELECT id INTO v_whittakers FROM public.dash_advertisers WHERE company = 'Whittaker''s' LIMIT 1;
  IF v_whittakers IS NULL THEN
    INSERT INTO public.dash_advertisers (company, contact_name, contact_email, category, status, monthly_budget_nzd)
    VALUES ('Whittaker''s', 'Demo', 'demo+whittakers@assembl.co.nz', 'food', 'active', 5000)
    RETURNING id INTO v_whittakers;
  END IF;

  SELECT id INTO v_airnz FROM public.dash_advertisers WHERE company = 'Air New Zealand' LIMIT 1;
  IF v_airnz IS NULL THEN
    INSERT INTO public.dash_advertisers (company, contact_name, contact_email, category, status, monthly_budget_nzd)
    VALUES ('Air New Zealand', 'Demo', 'demo+airnz@assembl.co.nz', 'travel', 'active', 8000)
    RETURNING id INTO v_airnz;
  END IF;

  -- Campaigns (get-or-create by name). Two bidders → a real second-price clear.
  IF NOT EXISTS (SELECT 1 FROM public.dash_campaigns WHERE name = 'Whittaker''s — a little something') THEN
    INSERT INTO public.dash_campaigns
      (advertiser_id, name, category, status, ad_text, cta_url,
       bid_cpm_nzd_cents, daily_budget_nzd_cents, publisher_allowlist, surface_targeting)
    VALUES
      (v_whittakers, 'Whittaker''s — a little something', 'food', 'active',
       'Whittaker''s — a little something for the wait.', 'https://www.whittakers.co.nz',
       4500, 50000, '{}', '{}');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.dash_campaigns WHERE name = 'Air NZ — main centres') THEN
    INSERT INTO public.dash_campaigns
      (advertiser_id, name, category, status, ad_text, cta_url,
       bid_cpm_nzd_cents, daily_budget_nzd_cents, publisher_allowlist, surface_targeting)
    VALUES
      (v_airnz, 'Air NZ — main centres', 'travel', 'active',
       'Air New Zealand — fly the main centres for less.', 'https://www.airnewzealand.co.nz',
       3800, 50000, '{}', '{}');
  END IF;
END $$;
