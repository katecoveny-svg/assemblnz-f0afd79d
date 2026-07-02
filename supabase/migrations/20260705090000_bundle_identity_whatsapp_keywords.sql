-- ═══════════════════════════════════════════════════════════════════════════
-- Bundle identity — WhatsApp channel + keyword routing (shared-number model)
-- ═══════════════════════════════════════════════════════════════════════════
-- TNZ confirmed (support ticket, account 606498, 2026-07-02) that NZ mobile
-- networks do not support dedicated long codes. The SMS plan is now ONE
-- shared 6-digit short code for every bundle identity, routed by keyword.
-- WhatsApp works the same way: one Twilio WhatsApp sender shared by all
-- identities, routed by the same keywords.
--
--   HELM      → hearth     (family / whānau)
--   KEEPER    → kaitiaki   (animal / vet)      — fronted by 'knowledge'
--   FOREMAN   → assembler  (construction)      — fronted by 'workflow'
--   SERVICE   → forge      (automotive)        — fronted by 'operations'
--   DOCTOR    → practice   (health)            — fronted by 'insights'
--   DIRECTOR  → ensemble   (creative)          — fronted by 'communication'
--   SOLICITOR → counsel    (legal)             — fronted by 'trust'
--   VISA      → visa       (immigration)
--
-- Additive only. phone / phone_whatsapp stay NULL until the numbers really
-- exist (short code awaits TNZ provisioning; the WhatsApp sender number is
-- set by service-role update once Meta registration completes). Never seed
-- a number that has not really been provisioned.

alter table public.bundle_identity
  add column if not exists keyword_sms text,
  add column if not exists phone_whatsapp text,
  add column if not exists keyword_whatsapp text;

comment on column public.bundle_identity.keyword_sms is
  'First-word routing keyword for the SHARED SMS short code (e.g. HELM). Matched case-insensitively against the first token of an inbound message.';
comment on column public.bundle_identity.phone_whatsapp is
  'E.164 WhatsApp sender number (Twilio), WITHOUT the whatsapp: prefix. Shared across identities; NULL until the Meta sender registration is done.';
comment on column public.bundle_identity.keyword_whatsapp is
  'First-word routing keyword for the shared WhatsApp sender. Same scheme as keyword_sms.';

-- The shared-number model puts one phone value on many rows, so the per-row
-- unique phone index from 20260703113000 no longer applies. Keywords are the
-- unique routing key now.
drop index if exists public.bundle_identity_phone_key;

create unique index if not exists bundle_identity_keyword_sms_key
  on public.bundle_identity (upper(keyword_sms)) where keyword_sms is not null;
create unique index if not exists bundle_identity_keyword_whatsapp_key
  on public.bundle_identity (upper(keyword_whatsapp)) where keyword_whatsapp is not null;

-- The message log gains the whatsapp channel.
alter table public.bundle_identity_messages
  drop constraint if exists bundle_identity_messages_channel_check;
alter table public.bundle_identity_messages
  add constraint bundle_identity_messages_channel_check
  check (channel in ('sms', 'email', 'telegram', 'whatsapp'));

-- ─────────────────────────────────────────────────────────────────────────
-- Seed keywords — guarded so a re-run never clobbers rows Kate has edited.
-- ─────────────────────────────────────────────────────────────────────────

update public.bundle_identity set keyword_sms = 'DIRECTOR',  keyword_whatsapp = 'DIRECTOR'
  where bundle_slug = 'communication' and keyword_sms is null;
update public.bundle_identity set keyword_sms = 'SOLICITOR', keyword_whatsapp = 'SOLICITOR'
  where bundle_slug = 'trust' and keyword_sms is null;
update public.bundle_identity set keyword_sms = 'FOREMAN',   keyword_whatsapp = 'FOREMAN'
  where bundle_slug = 'workflow' and keyword_sms is null;
update public.bundle_identity set keyword_sms = 'DOCTOR',    keyword_whatsapp = 'DOCTOR'
  where bundle_slug = 'insights' and keyword_sms is null;
update public.bundle_identity set keyword_sms = 'SERVICE',   keyword_whatsapp = 'SERVICE'
  where bundle_slug = 'operations' and keyword_sms is null;
update public.bundle_identity set keyword_sms = 'KEEPER',    keyword_whatsapp = 'KEEPER'
  where bundle_slug = 'knowledge' and keyword_sms is null;

-- Hearth and Visa have no marketing-identity front — they route directly to
-- their bundles. No email alias exists for either yet, so email stays NULL.
insert into public.bundle_identity
  (bundle_slug, display_name, phone, email, telegram_handle, chat_slug, live, keyword_sms, keyword_whatsapp)
values
  ('hearth', 'Hearth', null, null, null, 'hearth', false, 'HELM', 'HELM'),
  ('visa',   'Visa',   null, null, null, 'visa',   false, 'VISA', 'VISA')
on conflict (bundle_slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- Verify (run manually):
--   select bundle_slug, keyword_sms, keyword_whatsapp, phone, phone_whatsapp, live
--     from public.bundle_identity order by bundle_slug;
--   -- 8 keyword rows (+ any per-agent email rows), all live=false.
-- ─────────────────────────────────────────────────────────────────────────
