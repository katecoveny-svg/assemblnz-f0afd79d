-- Happy Tails joins the genome (2026-07-17): one Business Genome for the
-- doggy daycare, under tenant 'happy-tails' — the same living_site_genome
-- table and operating loop every other tenant reads.
--
-- REAL BUSINESS — BY PERMISSION: Happy Tails is a real business taking part
-- with the owner's permission (a deliberate exception to the fictional
-- demo-cast rule). Even so, this genome is deliberately PII-free: no names,
-- phone numbers, GST numbers, email addresses, street addresses or social
-- handles are seeded here. The personal details stay in the RLS-locked
-- tenant data and out of the genome by design.

insert into public.living_site_genome
  (tenant, fact_id, section, label, value, read_by, source, verification, verified_at) values
  ('happy-tails', 'g-name', 'identity', 'Business',
   'Happy Tails — a small family doggy daycare & boarding, West Auckland',
   '{website,voice,email,social}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-voice', 'identity', 'Brand voice',
   'Warm, personal, NZ English — ''we care for every dog as if they were our own''',
   '{voice,email,support,social}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-area', 'identity', 'Service area',
   'West Auckland · door-to-door daycare bus across Auckland',
   '{website,booking,voice,crm}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-daycare', 'services', 'Daycare with bus',
   'NZ$57/day, GST incl · door-to-door pickup + drop-off',
   '{website,booking,proposals,voice,crm}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-overnight', 'services', 'Overnight care',
   'NZ$95/night · regular pups only · 10% small-pup discount',
   '{website,booking,proposals,voice,crm}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-schedule', 'services', 'How enrolment works',
   'Not a casual drop-in — every pup joins a weekly recurring schedule in a settled small group',
   '{website,faq,voice,email}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-welcome', 'services', 'Welcome pack',
   'Five-page pack in the owner''s voice — bus rules, pre-pickup checklist, small groups, monthly Xero invoicing',
   '{email,faq,crm}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-invoicing', 'services', 'Invoicing',
   'Monthly Xero invoicing · part-month · 7-day terms · drafts stay Draft until a human issues',
   '{proposals,crm,email}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-two-voice', 'team', 'Two-voice rule (locked)',
   'Texts go out in the SMS carer''s voice; emails in the owner''s voice — Keeper drafts in the right voice automatically',
   '{voice,email,support}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-team', 'team', 'The team',
   'Owner + SMS carer, plus handlers, a vet-background handler, and a weekend bus driver',
   '{crm,support}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-checklist', 'knowledge', 'Pre-pickup checklist',
   'Every morning before the bus: fed · toileted · collar + tag on',
   '{faq,voice,support}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-vax-policy', 'knowledge', 'Vaccination policy',
   'Kennel cough must be current — no overnights after expiry until renewed',
   '{faq,booking,voice,support}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-training', 'knowledge', 'Training questions',
   'Routed to a force-free trainer (LIMA, humane hierarchy) — a bite or real aggression goes straight to a vet or behaviourist',
   '{voice,support,faq}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-receipts', 'proof', 'Mana Receipts',
   'Every draft carries a receipt: who drafted, who approved, which hard rules held',
   '{email,support}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-law', 'proof', 'Grounded in NZ law',
   'Animal Welfare Act 1999 · Privacy Act 2020 IPP 3A · Dog Control Act 1996',
   '{voice,support,faq}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-bus-route', 'operations', 'Morning bus route',
   'One optimised loop from the West Auckland depot — sequenced stops with 30-minute pickup windows',
   '{booking,voice,crm}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-drafts', 'operations', 'Draft-only',
   'Keeper never sends — texts, emails and invoices all wait for one human yes',
   '{email,crm,support,voice}', 'seed', 'confirmed', now()),
  ('happy-tails', 'g-privacy', 'operations', 'Owner privacy',
   'Owner contact details are RLS-locked — never shown in a draft, referred to in masked form',
   '{support,crm}', 'seed', 'confirmed', now())
on conflict (tenant, fact_id) do nothing;
