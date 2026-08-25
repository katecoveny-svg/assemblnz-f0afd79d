-- Opportunity Horizon: commercial early-warning sources alongside Regulatory Horizon.
--
-- Reuses the existing Knowledge Brain path:
--   kb_sources -> tick/dispatch_due_kb_sources -> adapter-* -> kb_documents
-- No new Edge Function is required. Every source carries an explicit lifecycle
-- stage, publisher, authority tier and route; buyer_org is intentionally absent
-- unless a source item states it. Optional/blocked publishers fail independently.

begin;

do $$
declare
  src record;
  v_config jsonb;
begin
  for src in
    select * from (values
      (
        'Ministry for Regulation — Regulatory Analysis Summaries',
        'html_scrape',
        'https://www.regulation.govt.nz/publications-and-resources/regulatory-analysis-summaries/',
        'opportunity_horizon', 360, 2, 0.95::numeric,
        'Ministry for Regulation primary analysis library',
        'regulatory_analysis', 'POLICY_PROPOSED', 'Ministry for Regulation',
        'policy discovery before requirements harden', false,
        array['regulatory analysis','regulatory impact','implementation','monitoring']::text[],
        array['opportunity-horizon','regulatory-analysis','policy']::text[]
      ),
      (
        'DPMC — Cabinet publications and proactive releases',
        'html_scrape',
        'https://www.dpmc.govt.nz/publications?field_publication_type_target_id=100',
        'opportunity_horizon', 360, 1, 0.98::numeric,
        'Department of the Prime Minister and Cabinet publication register',
        'cabinet_release', 'CABINET_DECIDED', 'Department of the Prime Minister and Cabinet',
        'implementation discovery after a Cabinet decision', false,
        array['cabinet paper','cabinet minute','proactive release','cabinet decision']::text[],
        array['opportunity-horizon','cabinet','proactive-release']::text[]
      ),
      (
        'Treasury — Budget 2026',
        'html_scrape',
        'https://www.treasury.govt.nz/publications/budgets/budget-2026',
        'opportunity_horizon', 720, 1, 0.98::numeric,
        'The Treasury Budget 2026 publication hub',
        'budget_appropriation', 'MONEY_ALLOCATED', 'The Treasury',
        'funded programme discovery tied to an appropriation outcome', true,
        array['appropriation','initiative','investment','funding','vote']::text[],
        array['opportunity-horizon','budget','appropriation']::text[]
      ),
      (
        'Treasury — Budget 2026 Estimates data',
        'html_scrape',
        'https://www.treasury.govt.nz/publications/data/budget-2026-data-estimates-appropriations-2026-27',
        'opportunity_horizon', 1440, 1, 1.00::numeric,
        'The Treasury machine-readable Estimates of Appropriations release',
        'budget_appropriation', 'MONEY_ALLOCATED', 'The Treasury',
        'funded programme discovery tied to an appropriation outcome', true,
        array['appropriation','expenditure','budgeted','estimate','vote']::text[],
        array['opportunity-horizon','budget-data','appropriation']::text[]
      ),
      (
        'GETS — Future Procurement Opportunities',
        'html_scrape',
        'https://www.gets.govt.nz/m/FutureProcurementOpportunitiesIndex.htm',
        'opportunity_horizon', 120, 1, 0.98::numeric,
        'Government Electronic Tenders Service FPO register',
        'procurement_forecast', 'PROCUREMENT_FORECAST', 'Government Electronic Tenders Service',
        'early market engagement before an RFx specification hardens', false,
        array['future procurement opportunity','fpo','indicative rfx','organisation']::text[],
        array['opportunity-horizon','gets','procurement-forecast']::text[]
      ),
      (
        'GETS — Government tenders',
        'rss',
        'https://www.gets.govt.nz/ExternalRSSFeed.htm',
        'tenders', 120, 1, 0.98::numeric,
        'Government Electronic Tenders Service public RSS',
        'procurement_rfx', 'RFX_OPEN', 'Government Electronic Tenders Service',
        'formal procurement or partner route', false,
        array['request for proposal','request for tender','request for information','rfx','rfp','rfi']::text[],
        array['opportunity-horizon','gets','rfx']::text[]
      ),
      (
        'Commerce Commission — Case register and consultations',
        'html_scrape',
        'https://www.comcom.govt.nz/case-register',
        'opportunity_horizon', 360, 2, 0.90::numeric,
        'Commerce Commission case register',
        'regulator_work_programme', 'POLICY_PROPOSED', 'Commerce Commission',
        'regulated-journey preparation before settings are final', true,
        array['consultation','open project','market study','draft decision','submission']::text[],
        array['opportunity-horizon','regulator','commerce-commission']::text[]
      ),
      (
        'Electricity Authority — Projects and consultations',
        'html_scrape',
        'https://www.ea.govt.nz/projects/all/',
        'opportunity_horizon', 360, 2, 0.90::numeric,
        'Electricity Authority project and consultation register',
        'regulator_work_programme', 'POLICY_PROPOSED', 'Electricity Authority',
        'regulated-journey preparation before settings are final', false,
        array['consultation','work programme','project','decision','submission']::text[],
        array['opportunity-horizon','regulator','electricity']::text[]
      ),
      (
        'FMA — Consultations',
        'html_scrape',
        'https://www.fma.govt.nz/business/focus-areas/consultation/',
        'opportunity_horizon', 360, 2, 0.90::numeric,
        'Financial Markets Authority consultation register',
        'regulator_work_programme', 'POLICY_PROPOSED', 'Financial Markets Authority',
        'regulated-journey preparation before settings are final', false,
        array['consultation','submission','proposal','guidance','review']::text[],
        array['opportunity-horizon','regulator','financial-markets']::text[]
      ),
      (
        'NZ Gazette — Latest notices',
        'html_scrape',
        'https://gazette.govt.nz/find-a-notice',
        'legislation', 180, 1, 1.00::numeric,
        'New Zealand Gazette official notice register',
        'secondary_legislation', 'CUSTOMER_JOURNEY_CHANGE', 'New Zealand Gazette',
        'implementation preparation for an operative instrument or notice', false,
        array['notice','order','regulations','rules','standard','instrument']::text[],
        array['opportunity-horizon','gazette','secondary-legislation']::text[]
      ),
      (
        'MBIE — Proactive releases',
        'html_scrape',
        'https://www.mbie.govt.nz/about/open-government-and-official-information/proactive-releases',
        'opportunity_horizon', 720, 2, 0.90::numeric,
        'Ministry of Business, Innovation and Employment proactive release register',
        'agency_proactive_release', 'CABINET_DECIDED', 'Ministry of Business, Innovation and Employment',
        'agency implementation discovery after a decision', false,
        array['cabinet paper','cabinet minute','proactive release','implementation']::text[],
        array['opportunity-horizon','agency-release','mbie']::text[]
      ),
      (
        'Ministry for Regulation — Information releases',
        'html_scrape',
        'https://www.regulation.govt.nz/about-us/information-releases/',
        'opportunity_horizon', 720, 2, 0.90::numeric,
        'Ministry for Regulation information release register',
        'agency_proactive_release', 'CABINET_DECIDED', 'Ministry for Regulation',
        'agency implementation discovery after a decision', false,
        array['cabinet paper','cabinet minute','proactive release','weekly report']::text[],
        array['opportunity-horizon','agency-release','regulation']::text[]
      ),
      (
        'Auckland Council — Annual and long-term plans',
        'html_scrape',
        'https://www.aucklandcouncil.govt.nz/plans-projects-policies-reports-bylaws/our-plans-strategies/budget-plans/Pages/default.aspx',
        'opportunity_horizon', 1440, 2, 0.85::numeric,
        'Auckland Council budget and plan hub',
        'council_plan', 'MONEY_ALLOCATED', 'Auckland Council',
        'local programme discovery before procurement', true,
        array['annual plan','long-term plan','budget','investment','programme']::text[],
        array['opportunity-horizon','council','annual-plan','long-term-plan']::text[]
      ),
      (
        'Auckland Council — Committee agendas',
        'html_scrape',
        'https://aucklandcouncil.resolve.red/portal/',
        'opportunity_horizon', 720, 2, 0.85::numeric,
        'Auckland Council public meeting and agenda portal',
        'council_agenda', 'POLICY_PROPOSED', 'Auckland Council',
        'local decision discovery before budget or procurement', true,
        array['agenda','minutes','committee','approval','budget','programme']::text[],
        array['opportunity-horizon','council','committee-agenda']::text[]
      ),
      (
        'MSD — Food Secure Communities funding',
        'html_scrape',
        'https://www.msd.govt.nz/what-we-can-do/community/food-secure-communities/',
        'opportunity_horizon', 720, 2, 0.92::numeric,
        'Ministry of Social Development funded-provider programme page',
        'funded_provider', 'DELIVERY_OBLIGATION', 'Ministry of Social Development',
        'participant-journey preparation for funded providers', false,
        array['funding','funded','provider','partner','delivery','programme']::text[],
        array['opportunity-horizon','funded-provider','food-security']::text[]
      ),
      (
        'Health NZ — News and service announcements',
        'html_scrape',
        'https://www.healthnz.govt.nz/news-and-updates',
        'opportunity_horizon', 720, 2, 0.88::numeric,
        'Health New Zealand public news and service update register',
        'funded_provider', 'DELIVERY_OBLIGATION', 'Health New Zealand',
        'participant-journey preparation for funded or commissioned services', true,
        array['funding','provider','commissioned','service','delivery','programme']::text[],
        array['opportunity-horizon','funded-provider','health']::text[]
      ),
      (
        'NZX — Market announcements',
        'html_scrape',
        'https://www.nzx.com/markets/NZSX/announcements',
        'opportunity_horizon', 180, 3, 0.65::numeric,
        'NZX official market announcement index; commercial interpretation remains an inference',
        'private_nzx', 'CUSTOMER_JOURNEY_CHANGE', 'NZX',
        'evidence-led private-company discovery', false,
        array['customer','service','digital','platform','transformation','claims','operational','investment','strategy','appointment']::text[],
        array['opportunity-horizon','private-company','nzx']::text[]
      ),
      (
        'Spark NZ — Investor centre',
        'html_scrape',
        'https://investors.sparknz.co.nz/Investor-Centre/',
        'opportunity_horizon', 720, 3, 0.62::numeric,
        'Spark New Zealand investor publication hub; commercial interpretation remains an inference',
        'private_investor', 'CUSTOMER_JOURNEY_CHANGE', 'Spark New Zealand',
        'evidence-led private-company discovery', false,
        array['customer','service','digital','platform','transformation','operating model','strategy','investment']::text[],
        array['opportunity-horizon','private-company','investor']::text[]
      ),
      (
        'SEEK NZ — Customer experience and transformation hiring',
        'html_scrape',
        'https://www.seek.co.nz/customer-experience-jobs',
        'opportunity_horizon', 720, 4, 0.38::numeric,
        'Public hiring index; role text is an indicative commercial signal only',
        'private_hiring', 'CUSTOMER_JOURNEY_CHANGE', 'SEEK New Zealand',
        'low-trust hiring signal requiring corroboration', true,
        array['head of customer','customer experience','transformation','digital','service design','programme director']::text[],
        array['opportunity-horizon','private-company','hiring']::text[]
      )
    ) as seeds(
      name, source_type, source_url, source_category, cadence, tier, weight,
      source_provenance, source_class, default_stage, publisher_org,
      likely_route, optional_source, include_keywords, topic_tags
    )
  loop
    v_config := jsonb_build_object(
      'topic_tags', to_jsonb(src.topic_tags),
      'opportunity', jsonb_build_object(
        'source_class', src.source_class,
        'default_stage', src.default_stage,
        'publisher_org', src.publisher_org,
        'likely_route', src.likely_route,
        'optional', src.optional_source,
        'include_keywords', to_jsonb(src.include_keywords),
        'extraction_scope', case when src.source_type = 'rss' then 'item' else 'listing_page' end
      )
    );

    update public.kb_sources
    set type = src.source_type,
        url = src.source_url,
        category = src.source_category,
        cadence_minutes = src.cadence,
        active = true,
        status = 'idle',
        consecutive_failures = 0,
        authority_tier = src.tier,
        authority_weight = src.weight,
        provenance = src.source_provenance,
        config = coalesce(config, '{}'::jsonb) || v_config,
        updated_at = now()
    where name = src.name;

    if not found then
      insert into public.kb_sources (
        name, type, url, category, agent_packs, cadence_minutes, active,
        status, consecutive_failures, authority_tier, authority_weight,
        provenance, config
      ) values (
        src.name, src.source_type, src.source_url, src.source_category,
        array['cross']::text[], src.cadence, true, 'idle', 0, src.tier,
        src.weight, src.source_provenance, v_config
      );
    end if;
  end loop;
end;
$$;

-- Existing GETS/Gazette rows can become useful immediately, before their next
-- scheduled fetch, without changing the document's original title or content.
update public.kb_documents d
set metadata = coalesce(d.metadata, '{}'::jsonb) || jsonb_build_object(
      'opportunity', s.config->'opportunity',
      'provenance', jsonb_build_object(
        'source_id', s.id,
        'source_name', s.name,
        'source_url', s.url,
        'source_type', s.type,
        'publisher_org', s.config->'opportunity'->>'publisher_org',
        'authority_tier', s.authority_tier,
        'authority_weight', s.authority_weight,
        'declared_provenance', s.provenance,
        'captured_via', 'migration-backfill',
        'captured_at', now()
      )
    ),
    topic_tags = array(
      select distinct tag
      from unnest(coalesce(d.topic_tags, '{}'::text[]) || array['opportunity-horizon']::text[]) as tag
    )
from public.kb_sources s
where d.source_id = s.id
  and s.config ? 'opportunity';

create index if not exists idx_kb_sources_opportunity_class
  on public.kb_sources ((config->'opportunity'->>'source_class'))
  where config ? 'opportunity';

create index if not exists idx_kb_documents_opportunity_stage
  on public.kb_documents ((metadata->'opportunity'->>'default_stage'))
  where metadata ? 'opportunity';

comment on index public.idx_kb_sources_opportunity_class is
  'Opportunity Horizon source routing without changing the existing kb_sources type constraint.';

commit;
