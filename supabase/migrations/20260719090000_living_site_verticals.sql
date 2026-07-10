-- Living Site sample verticals (2026-07-10): the demo cast goes fictional.
--
-- 1) The flagship dog-training genome is de-identified — no real prospect has
--    agreed to appear, so the displayed business + owner are invented
--    ("Harbourside Dog Training" / "Sam"). The tenant KEY stays
--    'auckland-dog-trainer' (legacy identifier only).
-- 2) Seven more sample verticals are seeded so every installer template lands
--    on a genome-backed sample site (/living-site/<industry>). Values mirror
--    lib/living-site/verticals.ts fallbackFacts (generated from it).
--
-- Additive + value updates only. RLS stays deny-all (service-role access).

update public.living_site_genome set value = 'Harbourside Dog Training · calm, method-first', updated_at = now()
  where tenant = 'auckland-dog-trainer' and fact_id = 'g-name'
    and value = 'Auckland Dog Trainer · Learn To Talk Dog';

update public.living_site_genome set value = 'Sam (method lead) · second trainer hiring — Aroha W. on trial', updated_at = now()
  where tenant = 'auckland-dog-trainer' and fact_id = 'g-team'
    and value like 'Fred%';

update public.living_site_genome set value = 'Draft-only: enquiry replies, homework emails, follow-ups — Sam approves every send', updated_at = now()
  where tenant = 'auckland-dog-trainer' and fact_id = 'g-automations'
    and value like '%Fred%';

insert into public.living_site_genome (tenant, fact_id, section, label, value, read_by) values
  ('sample-customs', 'g-name', 'identity', 'Business', 'Gateway Customs Brokers · clear the border, calmly', '{website,email,voice,social}'),
  ('sample-customs', 'g-voice', 'identity', 'Brand voice', 'Plain-spoken, precise, deadline-aware — never jargon-first', '{website,email,voice,social}'),
  ('sample-customs', 'g-area', 'identity', 'Service area', 'Ports of Auckland & Tauranga · air + sea freight', '{website,email,voice,social}'),
  ('sample-customs', 'g-entry', 'services', 'Import entry & clearance', '$185 + GST · per entry, most consignments', '{website,booking,proposals,email,voice,crm}'),
  ('sample-customs', 'g-tariff', 'services', 'Tariff classification review', '$450 + GST · binding-ruling preparation', '{website,booking,proposals,email,voice,crm}'),
  ('sample-customs', 'g-reconcile', 'services', 'Duty & GST reconciliation', '$120/mo + GST · monthly statement and refund checks', '{website,booking,proposals,email,voice,crm}'),
  ('sample-customs', 'g-setup', 'services', 'New importer setup', '$650 + GST · client codes, registrations, first entry', '{website,booking,proposals,email,voice,crm}'),
  ('sample-customs', 'g-team', 'team', 'Team', 'Ana (licensed broker · lead) · two brokers · one compliance reviewer', '{website,booking,crm}'),
  ('sample-customs', 'g-faq-gst', 'knowledge', 'FAQ · border GST', '“Why is there GST at the border?” → answered in plain language with a worked example', '{website,faq,voice,support}'),
  ('sample-customs', 'g-policy-perishables', 'knowledge', 'Perishables policy', 'Perishable consignments → same-day entry lodgement, flagged on intake', '{website,faq,voice,support}'),
  ('sample-customs', 'g-testimonials', 'proof', 'Testimonials', '17 importers · latest: “cleared before the ship berthed”', '{website,proposals,email,social}'),
  ('sample-customs', 'g-booking-rules', 'operations', 'Service rules', 'Entries lodged within 4 business hours · urgent line for vessel deadlines', '{booking,email,crm,voice}'),
  ('sample-customs', 'g-automations', 'operations', 'Automations', 'Draft-only: entry summaries, client updates, invoice chasers — Ana approves every send', '{email,crm,support}'),
  ('sample-architecture', 'g-name', 'identity', 'Business', 'Ridgeline Architecture · homes that fit their hill', '{website,email,voice,social}'),
  ('sample-architecture', 'g-voice', 'identity', 'Brand voice', 'Considered, visual, plain English — no archispeak', '{website,email,voice,social}'),
  ('sample-architecture', 'g-area', 'identity', 'Service area', 'Auckland & Waikato · residential + small commercial', '{website,email,voice,social}'),
  ('sample-architecture', 'g-concept', 'services', 'Concept & feasibility', '$4,800 + GST · site visit, massing options, budget range', '{website,booking,proposals,email,voice,crm}'),
  ('sample-architecture', 'g-consent', 'services', 'Developed design & consent', 'from $28,000 + GST · through to lodged consent', '{website,booking,proposals,email,voice,crm}'),
  ('sample-architecture', 'g-observe', 'services', 'Site observation', '$210/hr + GST · staged inspections through the build', '{website,booking,proposals,email,voice,crm}'),
  ('sample-architecture', 'g-reno', 'services', 'Renovation studio', 'from $9,500 + GST · design to consent for alterations', '{website,booking,proposals,email,voice,crm}'),
  ('sample-architecture', 'g-team', 'team', 'Team', 'Theo (director) · practice of five · landscape partner on call', '{website,booking,crm}'),
  ('sample-architecture', 'g-faq-cost', 'knowledge', 'FAQ · cost', '“What does an architect actually cost?” → answered with worked examples per project size', '{website,faq,voice,support}'),
  ('sample-architecture', 'g-policy-heritage', 'knowledge', 'Heritage policy', 'Heritage overlays → pre-application meeting with council first, always', '{website,faq,voice,support}'),
  ('sample-architecture', 'g-testimonials', 'proof', 'Testimonials', '31 completed homes · latest: “they made the hill the hero”', '{website,proposals,email,social}'),
  ('sample-architecture', 'g-booking-rules', 'operations', 'Service rules', 'First site visit free · fortnightly design reviews · consent milestones tracked', '{booking,email,crm,voice}'),
  ('sample-architecture', 'g-automations', 'operations', 'Automations', 'Draft-only: client updates, consent RFIs, invoice reminders — Theo approves every send', '{email,crm,support}'),
  ('sample-hospitality', 'g-name', 'identity', 'Business', 'Wharf Lane Café · good coffee, run calmly', '{website,email,voice,social}'),
  ('sample-hospitality', 'g-voice', 'identity', 'Brand voice', 'Warm, quick, local — reads like the specials board', '{website,email,voice,social}'),
  ('sample-hospitality', 'g-area', 'identity', 'Location & hours', 'Wynyard-side laneway · 7–3 weekdays, 8–3 weekends', '{website,email,voice,social}'),
  ('sample-hospitality', 'g-brunch', 'services', 'Brunch & coffee', 'Menu $14–$28 · counter + table service', '{website,booking,proposals,email,voice,crm}'),
  ('sample-hospitality', 'g-functions', 'services', 'Functions', 'from $45/head + GST · after-hours, 20–60 guests', '{website,booking,proposals,email,voice,crm}'),
  ('sample-hospitality', 'g-catering', 'services', 'Office catering', 'from $12/head + GST · weekday drop-off, ordered by 3pm prior', '{website,booking,proposals,email,voice,crm}'),
  ('sample-hospitality', 'g-team', 'team', 'Team', 'Rosa (owner · front of house) · chef Ben · roster of eight', '{website,booking,crm}'),
  ('sample-hospitality', 'g-faq-dietary', 'knowledge', 'FAQ · dietary', '“Can you do gluten-free / dairy-free?” → yes, flagged at booking; separate prep bench', '{website,faq,voice,support}'),
  ('sample-hospitality', 'g-policy-foodsafety', 'knowledge', 'Food safety', 'Food Control Plan records logged daily — temperature checks prompt at open and close', '{website,faq,voice,support}'),
  ('sample-hospitality', 'g-testimonials', 'proof', 'Testimonials', '4.8★ across 320 reviews · latest: “the flat white that ruined all other flat whites”', '{website,proposals,email,social}'),
  ('sample-hospitality', 'g-booking-rules', 'operations', 'Booking rules', 'Groups of 8+ → booked · functions confirmed with deposit · walk-ins first-come', '{booking,email,crm,voice}'),
  ('sample-hospitality', 'g-automations', 'operations', 'Automations', 'Draft-only: supplier orders, roster gaps, review replies — Rosa approves every send', '{email,crm,support}'),
  ('sample-trades', 'g-name', 'identity', 'Business', 'Brightwork Builders · quoted straight, built right', '{website,email,voice,social}'),
  ('sample-trades', 'g-voice', 'identity', 'Brand voice', 'Straight-up, specific, no tradie mumble — photos with every update', '{website,email,voice,social}'),
  ('sample-trades', 'g-area', 'identity', 'Service area', 'North Shore & upper harbour · renovations, decks, small builds', '{website,email,voice,social}'),
  ('sample-trades', 'g-reno', 'services', 'Kitchen & bathroom renovations', 'from $38,000 + GST · design to handover', '{website,booking,proposals,email,voice,crm}'),
  ('sample-trades', 'g-decks', 'services', 'Decks & outdoor rooms', 'from $18,000 + GST · consent handled where needed', '{website,booking,proposals,email,voice,crm}'),
  ('sample-trades', 'g-smallworks', 'services', 'Small works day rate', '$95/hr + GST · two-hour minimum, quoted first', '{website,booking,proposals,email,voice,crm}'),
  ('sample-trades', 'g-team', 'team', 'Team', 'Mike (LBP · lead) · crew of six · sparkie and plumber on call', '{website,booking,crm}'),
  ('sample-trades', 'g-faq-consent', 'knowledge', 'FAQ · consent', '“Do I need consent for a deck?” → answered plainly: height thresholds and when Brightwork lodges it', '{website,faq,voice,support}'),
  ('sample-trades', 'g-policy-variations', 'knowledge', 'Variations policy', 'No variation proceeds without a written, priced change — signed off in the app', '{website,faq,voice,support}'),
  ('sample-trades', 'g-testimonials', 'proof', 'Testimonials', '26 jobs reviewed · latest: “finished the deck two days early and left the site cleaner than they found it”', '{website,proposals,email,social}'),
  ('sample-trades', 'g-booking-rules', 'operations', 'Job rules', 'Site visit before every quote · quotes hold 60 days · progress payments on milestones', '{booking,email,crm,voice}'),
  ('sample-trades', 'g-automations', 'operations', 'Automations', 'Draft-only: quote follow-ups, variation records, council paperwork — Mike approves every send', '{email,crm,support}'),
  ('sample-health', 'g-name', 'identity', 'Business', 'Momentum Physio · moving well, for good', '{website,email,voice,social}'),
  ('sample-health', 'g-voice', 'identity', 'Brand voice', 'Encouraging, evidence-based, plain language — never scare-copy', '{website,email,voice,social}'),
  ('sample-health', 'g-area', 'identity', 'Clinic & hours', 'Two rooms + gym floor · weekdays 7–7, Saturday mornings', '{website,email,voice,social}'),
  ('sample-health', 'g-initial', 'services', 'Initial assessment', '$95 · 45 min · ACC surcharge $45', '{website,booking,proposals,email,voice,crm}'),
  ('sample-health', 'g-followup', 'services', 'Follow-up treatment', '$75 · 30 min · ACC surcharge $35', '{website,booking,proposals,email,voice,crm}'),
  ('sample-health', 'g-rehab', 'services', 'Rehab programme', '$390 · 6-session block with gym plan', '{website,booking,proposals,email,voice,crm}'),
  ('sample-health', 'g-team', 'team', 'Team', 'Priya (MNZSP · lead) · two physios · one hand-therapy specialist', '{website,booking,crm}'),
  ('sample-health', 'g-faq-acc', 'knowledge', 'FAQ · ACC', '“Do I need a referral for ACC?” → no — the claim is lodged at your first visit', '{website,faq,voice,support}'),
  ('sample-health', 'g-policy-redflags', 'knowledge', 'Clinical policy', 'Red-flag symptoms → same-day GP/ED referral, never wait-listed', '{website,faq,voice,support}'),
  ('sample-health', 'g-testimonials', 'proof', 'Testimonials', '48 recoveries reviewed · latest: “back running the half in ten weeks”', '{website,proposals,email,social}'),
  ('sample-health', 'g-booking-rules', 'operations', 'Booking rules', 'Online booking · 24h cancellation · recall reminders at weeks 2 and 6', '{booking,email,crm,voice}'),
  ('sample-health', 'g-automations', 'operations', 'Automations', 'Draft-only: exercise plans, recall nudges, GP letters — Priya approves every send', '{email,crm,support}'),
  ('sample-beauty', 'g-name', 'identity', 'Business', 'Willow & Fern · unhurried hair, honest advice', '{website,email,voice,social}'),
  ('sample-beauty', 'g-voice', 'identity', 'Brand voice', 'Warm, unhurried, honest — no upsell scripts', '{website,email,voice,social}'),
  ('sample-beauty', 'g-area', 'identity', 'Salon & hours', 'Four chairs · Tue–Sat · late nights Thursday', '{website,email,voice,social}'),
  ('sample-beauty', 'g-cut', 'services', 'Cut & finish', 'from $85 · 60 min with consult', '{website,booking,proposals,email,voice,crm}'),
  ('sample-beauty', 'g-colour', 'services', 'Colour & balayage', 'from $220 · patch test 48h prior', '{website,booking,proposals,email,voice,crm}'),
  ('sample-beauty', 'g-occasion', 'services', 'Occasion styling', 'from $120 · weddings travel by quote', '{website,booking,proposals,email,voice,crm}'),
  ('sample-beauty', 'g-team', 'team', 'Team', 'Jess (owner · colour lead) · three stylists · apprentice on Saturdays', '{website,booking,crm}'),
  ('sample-beauty', 'g-faq-patchtest', 'knowledge', 'FAQ · patch tests', '“Why do I need a patch test?” → answered plainly: 48 hours before any new colour, no exceptions', '{website,faq,voice,support}'),
  ('sample-beauty', 'g-policy-corrections', 'knowledge', 'Corrections policy', 'Colour corrections → consult first, staged over sessions — hair integrity before speed', '{website,faq,voice,support}'),
  ('sample-beauty', 'g-testimonials', 'proof', 'Testimonials', '4.9★ across 210 reviews · latest: “first salon that listened to what I actually said”', '{website,proposals,email,social}'),
  ('sample-beauty', 'g-booking-rules', 'operations', 'Booking rules', 'Online booking with deposit for 2h+ services · 24h cancellation · rebooking nudge at 6 weeks', '{booking,email,crm,voice}'),
  ('sample-beauty', 'g-automations', 'operations', 'Automations', 'Draft-only: rebooking nudges, review replies, retail restock — Jess approves every send', '{email,crm,support}'),
  ('sample-tutoring', 'g-name', 'identity', 'Business', 'Northside Tutoring · confidence first, marks follow', '{website,email,voice,social}'),
  ('sample-tutoring', 'g-voice', 'identity', 'Brand voice', 'Encouraging, specific, jargon-free — written for parents and students both', '{website,email,voice,social}'),
  ('sample-tutoring', 'g-area', 'identity', 'Where & when', 'In-home across the Shore + online · after school and weekends', '{website,email,voice,social}'),
  ('sample-tutoring', 'g-one2one', 'services', 'One-on-one tutoring', '$75/hr · years 7–13 · maths, sciences, English', '{website,booking,proposals,email,voice,crm}'),
  ('sample-tutoring', 'g-group', 'services', 'Small-group sessions', '$35/hr per student · max 4, matched by level', '{website,booking,proposals,email,voice,crm}'),
  ('sample-tutoring', 'g-ncea', 'services', 'NCEA exam prep', '$390 · 6-week block with practice papers', '{website,booking,proposals,email,voice,crm}'),
  ('sample-tutoring', 'g-team', 'team', 'Team', 'David (owner · maths lead) · eight tutors, all police-vetted', '{website,booking,crm}'),
  ('sample-tutoring', 'g-faq-progress', 'knowledge', 'FAQ · progress', '“How do I know it’s working?” → progress report after every fourth session, in plain English', '{website,faq,voice,support}'),
  ('sample-tutoring', 'g-policy-safety', 'knowledge', 'Safeguarding policy', 'All tutors police-vetted · in-home sessions with a parent present or online', '{website,faq,voice,support}'),
  ('sample-tutoring', 'g-testimonials', 'proof', 'Testimonials', '60 students helped · latest: “went from dreading maths to teaching her brother”', '{website,proposals,email,social}'),
  ('sample-tutoring', 'g-booking-rules', 'operations', 'Booking rules', 'Free first assessment · same tutor every week · pause any time, no lock-in', '{booking,email,crm,voice}'),
  ('sample-tutoring', 'g-automations', 'operations', 'Automations', 'Draft-only: progress reports, session summaries, invoice reminders — David approves every send', '{email,crm,support}')
on conflict (tenant, fact_id) do nothing;
