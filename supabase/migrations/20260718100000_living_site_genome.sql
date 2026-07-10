-- Living Site genome + enquiries (concept pivot 2026-07-10).
--
-- The Business Genome becomes real data: one row per fact per tenant, read
-- server-side by every surface (public /living-site demo, Fred's public
-- landing page, the gated ops console). Enquiries from the public landing
-- page land in living_site_enquiries.
--
-- Additive only. RLS enabled with NO policies (deny-all): all access goes
-- through Next.js server routes using the service-role client, never the
-- anon key.

create table if not exists public.living_site_genome (
  tenant text not null,
  fact_id text not null,
  section text not null,
  label text not null,
  value text not null,
  read_by text[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (tenant, fact_id)
);

alter table public.living_site_genome enable row level security;

create table if not exists public.living_site_enquiries (
  id uuid primary key default gen_random_uuid(),
  tenant text not null,
  name text not null,
  email text not null,
  dog text,
  message text not null,
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

alter table public.living_site_enquiries enable row level security;

create index if not exists living_site_enquiries_tenant_created_idx
  on public.living_site_enquiries (tenant, created_at desc);

-- Seed Fred's genome (idempotent — existing edits are never overwritten).
insert into public.living_site_genome (tenant, fact_id, section, label, value, read_by) values
  ('auckland-dog-trainer', 'g-name', 'identity', 'Business', 'Auckland Dog Trainer · Learn To Talk Dog', '{website,proposals,email,voice,social}'),
  ('auckland-dog-trainer', 'g-voice', 'identity', 'Brand voice', 'Warm, plain-spoken, method-first — never shouty', '{website,email,voice,support,social,course}'),
  ('auckland-dog-trainer', 'g-area', 'identity', 'Service area', 'Greater Auckland · in-home + Western Springs field', '{website,booking,voice,crm}'),
  ('auckland-dog-trainer', 'g-private', 'services', 'Private In-Home Session', '$299 + GST · assessment + success plan', '{website,booking,proposals,email,voice,crm}'),
  ('auckland-dog-trainer', 'g-reactivity', 'services', 'Reactivity Rewired', '$2,200 + GST · 6 weeks', '{website,booking,proposals,faq,email,voice,crm,course}'),
  ('auckland-dog-trainer', 'g-recall', 'services', 'Recall Mastery', '$1,750 + GST · 4 weeks', '{website,booking,proposals,email,voice,crm}'),
  ('auckland-dog-trainer', 'g-board', 'services', 'Perfect Dog Board & Train', '$4,500 + GST · 3 weeks live-in', '{website,booking,proposals,email,voice,crm}'),
  ('auckland-dog-trainer', 'g-bootcamp', 'services', 'Group Bootcamp', 'Launching — Saturday small-group intensives', '{website,booking,email,voice,crm,social}'),
  ('auckland-dog-trainer', 'g-team', 'team', 'Trainers', 'Fred (method lead) · second trainer hiring — Aroha W. on trial', '{website,booking,crm}'),
  ('auckland-dog-trainer', 'g-faq-threshold', 'knowledge', 'FAQ · thresholds', '“What is a threshold?” → answered in plain language + 0:48 video', '{website,faq,voice,support,course}'),
  ('auckland-dog-trainer', 'g-policy-safety', 'knowledge', 'Safety policy', 'Bite history → private assessment first, never straight to group work', '{booking,faq,voice,support,crm}'),
  ('auckland-dog-trainer', 'g-testimonials', 'proof', 'Testimonials', '23 approved · latest: Tank “a reliable house dog in 4 weeks”', '{website,proposals,email,social}'),
  ('auckland-dog-trainer', 'g-booking-rules', 'operations', 'Booking rules', 'Sessions 75 min · travel buffered · Thu/Fri field days · deposit to confirm', '{booking,email,crm,voice}'),
  ('auckland-dog-trainer', 'g-automations', 'operations', 'Automations', 'Draft-only: enquiry replies, homework emails, follow-ups — Fred approves every send', '{email,crm,support}')
on conflict (tenant, fact_id) do nothing;
