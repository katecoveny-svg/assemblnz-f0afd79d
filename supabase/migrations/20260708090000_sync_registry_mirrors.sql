-- Sync the DB mirrors with the code registry (2026-07-05 consolidation audit).
--
-- Code is truth for the roster (lib/marketplace/agents.ts, 59 agents) and for
-- bundle membership (lib/marketplace/bundles.ts groups). The audit found three
-- drifts in prod; every statement below is idempotent so a re-run (previews,
-- fresh applies) is a no-op.
--
--   1. Eight pre-cull "coming soon" stubs survived the V4 cull in the agents
--      mirror but exist nowhere in code, so they ghost through the admin
--      dashboard and bundle counts. They carry FK references from six tables,
--      so they are RETIRED (status already in the CHECK), never deleted.
--   2. kakapo-recovery + kiwi-conservation are 'coming_soon' in code (the
--      kaumātua-held Kaitiaki pair) but 'draft' in the mirror.
--   3. tide-weather sat in the hearth bundle in the mirror; the code registry
--      and the bundle page both treat it as unbundled.
--   4. tenant_customers had 3 of the 8 code tenants (lib/customers/tenants.ts)
--      — aironaut, auckland-zoo, air-nz, contact-energy, everyday-rewards and
--      toa-architects were code-only. (star-group stays: it is Lula Inn's
--      parent group row, kind='group', not a routed tenant.)

-- 1 · retire the pre-cull stubs that never made the V4 registry
update public.agents
set status = 'retired', bundle = null
where slug in (
  'building-consent', 'customs-entry', 'maritime-brief', 'meeting-records',
  'motor', 'transit', 'transit-freight', 'whanau-help'
)
and status <> 'retired';

-- 2 · the kaumātua-held Kaitiaki pair reads coming_soon everywhere in code
update public.agents
set status = 'coming_soon'
where slug in ('kakapo-recovery', 'kiwi-conservation')
and status = 'draft';

-- 3 · tide-weather is unbundled in the registry
update public.agents
set bundle = null
where slug = 'tide-weather'
and bundle is not null;

-- 4 · tenants present in lib/customers/tenants.ts but missing from the mirror
insert into public.tenant_customers (slug, display_name, status, metadata)
values
  ('aironaut',         'Aironaut Customs Brokers',   'demo', jsonb_build_object('label', 'concept · pending')),
  ('auckland-zoo',     'Auckland Zoo',               'demo', jsonb_build_object('label', 'concept · pending')),
  ('air-nz',           'Air New Zealand × Dash',     'demo', jsonb_build_object('label', 'concept · pending')),
  ('contact-energy',   'Contact Energy × Assembling','demo', jsonb_build_object('label', 'concept · pending')),
  ('everyday-rewards', 'Everyday Rewards × Dash',    'demo', jsonb_build_object('label', 'concept · pending')),
  ('toa-architects',   'TOA Architects',             'demo', jsonb_build_object('label', 'concept · pending'))
on conflict (slug) do update
set display_name = excluded.display_name;
