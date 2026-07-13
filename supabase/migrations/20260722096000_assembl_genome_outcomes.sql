-- assembl runs on its own architecture (dogfood, 2026-07-13): one Business
-- Genome for assembl itself, under tenant 'assembl' — real facts, owner-
-- confirmed. The same operating loop (enquiry → task → draft → approval →
-- evidence) now serves the business that builds it.
--
-- Plus os_outcomes: Phase 5 outcome scoring — every operator decision on a
-- drafted action becomes a score the router can learn from.

insert into public.living_site_genome
  (tenant, fact_id, section, label, value, read_by, source, verification, verified_at) values
  ('assembl', 'g-name', 'identity', 'Business',
   'assembl — the living business operating system · Built in Aotearoa',
   '{website,proposals,email,voice,social}', 'owner', 'confirmed', now()),
  ('assembl', 'g-voice', 'identity', 'Brand voice',
   'Calm, plain-spoken, human words — no AI jargon. "Less admin. More mahi."',
   '{website,email,voice,support,social}', 'owner', 'confirmed', now()),
  ('assembl', 'g-area', 'identity', 'Service area',
   'Aotearoa New Zealand · based in Tāmaki Makaurau',
   '{website,voice,crm}', 'owner', 'confirmed', now()),
  ('assembl', 'g-pilot', 'services', 'Founding Pilot Sprint',
   'NZ$1,500 + GST · install a Business Genome and a Living Site for your business',
   '{website,booking,proposals,email,voice,crm}', 'owner', 'confirmed', now()),
  ('assembl', 'g-install', 'services', 'Living Site install',
   'Ten questions → a real genome → a living website, CRM, bookings and drafts',
   '{website,booking,proposals,email,voice}', 'owner', 'confirmed', now()),
  ('assembl', 'g-team', 'team', 'The team',
   'Kate — founder · assembl agents draft, Kate approves',
   '{website,booking,crm}', 'owner', 'confirmed', now()),
  ('assembl', 'g-approvals', 'knowledge', 'The one promise',
   'Nothing sends without a human yes — drafts queue for approval, every action leaves evidence',
   '{website,faq,voice,support,email}', 'owner', 'confirmed', now()),
  ('assembl', 'g-data', 'knowledge', 'Data care',
   'Tenant data locked down (deny-all access rules) · NZ Privacy Act 2020 posture · evidence retained',
   '{website,faq,support}', 'owner', 'confirmed', now()),
  ('assembl', 'g-proof', 'proof', 'Proven loop',
   'Every enquiry becomes a task with a drafted reply, an approval and an evidence trail — verified in production',
   '{website,proposals,email,social}', 'owner', 'confirmed', now()),
  ('assembl', 'g-booking-rules', 'operations', 'How work starts',
   'Enquiries land in the operating system · replies drafted from confirmed facts only · Kate says yes before anything sends',
   '{booking,email,crm,voice}', 'owner', 'confirmed', now()),
  ('assembl', 'g-automations', 'operations', 'Automations',
   'Draft-only: enquiry replies, follow-ups and suggestions — dispatch stays off until deliberately enabled',
   '{email,crm,support}', 'owner', 'confirmed', now())
on conflict (tenant, fact_id) do nothing;

-- Phase 5 outcome scoring: the operator's decision on each drafted action,
-- joined to workflow + model so routing can learn from real outcomes.
create table if not exists public.os_outcomes (
  id uuid primary key default gen_random_uuid(),
  tenant text not null,
  task_id uuid,
  workflow text not null,
  model text,
  agent text,
  score numeric(3, 2) not null,             -- 1 approved · 0 rejected
  decided_by text,
  created_at timestamptz not null default now()
);

alter table public.os_outcomes enable row level security;

create index if not exists os_outcomes_workflow_idx
  on public.os_outcomes (workflow, model, created_at desc);
