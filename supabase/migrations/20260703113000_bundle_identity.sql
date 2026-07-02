-- ═══════════════════════════════════════════════════════════════════════════
-- Bundle identity — Phase 3 of the v2 platform (per-bundle phone + email)
-- ═══════════════════════════════════════════════════════════════════════════
-- Every bundle gets a public-facing identity: a phone number (TNZ), an email
-- address (Brevo), an optional Telegram handle, and a chat handle. Inbound
-- messages on any of those channels are routed to the bundle's lead agent,
-- which drafts a reply. Replies are DRAFT-ONLY until Kate flips `live` AND
-- the deployment sets SEND_MODE=live — drafts queue in content_approvals
-- (from 20260703100000_v2_admin_backbone.sql) and surface in /admin/approvals.
--
--   bundle_identity           one row per marketing bundle identity
--   bundle_identity_messages  the inbound/outbound message log
--
-- Kate's six marketing identities map to the nearest live V4 bundle:
--   Communication → ensemble   (creative)      lead: creative-director
--   Trust         → counsel    (legal)         lead: solicitor
--   Workflow      → assembler  (construction)  lead: foreman
--   Insights      → practice   (health)        lead: duty-doctor
--   Operations    → forge      (automotive)    lead: arataki
--   Knowledge     → kaitiaki   (animal)        lead: keeper
--
-- RLS: designated admins read (is_designated_admin(), from the v2 admin
-- backbone); writes are service-role only (webhooks + admin server actions).
-- No client writes, ever.
--
-- Idempotent and additive only — safe to re-run, no DROPs of tables/columns.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1 · bundle_identity
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.bundle_identity (
  -- marketing identity slug, e.g. 'communication'
  bundle_slug      text primary key,
  -- marketing display name, e.g. 'Communication'
  display_name     text not null,
  -- E.164 TNZ number, e.g. '+6421…'. NULL until really provisioned — never
  -- seed a number that does not exist.
  phone            text,
  -- '<name>@assembl.co.nz'
  email            text,
  -- Telegram bot handle, e.g. '@assembl_operations_bot'. NULL until a bot is
  -- really created (Phase 3 evaluates per bundle; no bots yet).
  telegram_handle  text,
  -- the marketplace bundle slug this identity fronts (public.bundles /
  -- lib/marketplace/bundles.ts), e.g. 'ensemble'
  chat_slug        text not null,
  -- HARD SEND GATE: outbound stays draft-only until this is true AND the
  -- deployment env sets SEND_MODE=live. Both are required.
  live             boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.bundle_identity is
  'Per-bundle public identity (phone/email/telegram/chat). Inbound routes to the bundle lead agent; outbound is draft-only until live=true AND SEND_MODE=live.';
comment on column public.bundle_identity.phone is
  'E.164 TNZ number. NULL = not yet provisioned (TNZ portal step pending).';
comment on column public.bundle_identity.live is
  'Hard send gate — replies stay outbound-draft in content_approvals until this is true AND env SEND_MODE=live.';

create unique index if not exists bundle_identity_phone_key
  on public.bundle_identity (phone) where phone is not null;
create unique index if not exists bundle_identity_email_key
  on public.bundle_identity (lower(email)) where email is not null;

-- keep updated_at honest on service-role updates
create or replace function public.bundle_identity_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists bundle_identity_touch on public.bundle_identity;
create trigger bundle_identity_touch
  before update on public.bundle_identity
  for each row execute function public.bundle_identity_touch_updated_at();

alter table public.bundle_identity enable row level security;

drop policy if exists bundle_identity_admin_read on public.bundle_identity;
create policy bundle_identity_admin_read on public.bundle_identity
  for select to authenticated
  using (public.is_designated_admin(auth.uid()));
-- Writes are service-role only (bypasses RLS); no insert/update/delete
-- policies means no client writes.

-- ─────────────────────────────────────────────────────────────────────────
-- 2 · bundle_identity_messages — the message log
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.bundle_identity_messages (
  id                        uuid primary key default gen_random_uuid(),
  bundle_slug               text not null
                              references public.bundle_identity (bundle_slug)
                              on delete cascade,
  direction                 text not null
                              check (direction in ('inbound', 'outbound-draft', 'outbound-sent')),
  channel                   text not null
                              check (channel in ('sms', 'email', 'telegram')),
  from_addr                 text,
  to_addr                   text,
  body                      text not null,
  -- for outbound-draft rows: the content_approvals row Kate reviews in /admin
  agent_reply_approval_id   uuid references public.content_approvals (id)
                              on delete set null,
  created_at                timestamptz not null default now()
);

comment on table public.bundle_identity_messages is
  'Inbound/outbound log for bundle identities. outbound-draft rows point at their content_approvals queue entry; outbound-sent only ever appears once live=true AND SEND_MODE=live.';

create index if not exists bundle_identity_messages_bundle_idx
  on public.bundle_identity_messages (bundle_slug, created_at desc);
create index if not exists bundle_identity_messages_approval_idx
  on public.bundle_identity_messages (agent_reply_approval_id)
  where agent_reply_approval_id is not null;

alter table public.bundle_identity_messages enable row level security;

drop policy if exists bundle_identity_messages_admin_read on public.bundle_identity_messages;
create policy bundle_identity_messages_admin_read on public.bundle_identity_messages
  for select to authenticated
  using (public.is_designated_admin(auth.uid()));
-- Writes are service-role only (the /api/identity webhooks).

-- ─────────────────────────────────────────────────────────────────────────
-- 3 · Seed the six marketing identities
-- ─────────────────────────────────────────────────────────────────────────
-- phone stays NULL everywhere: TNZ dedicated inbound numbers are a portal /
-- support step (docs/bundle-identity-provisioning.md), and we never seed a
-- number that has not really been provisioned. ON CONFLICT DO NOTHING so a
-- re-run never clobbers rows Kate has since edited in /admin.

insert into public.bundle_identity
  (bundle_slug, display_name, phone, email, telegram_handle, chat_slug, live)
values
  ('communication', 'Communication', null, 'communication@assembl.co.nz', null, 'ensemble',   false),
  ('trust',         'Trust',         null, 'trust@assembl.co.nz',         null, 'counsel',    false),
  ('workflow',      'Workflow',      null, 'workflow@assembl.co.nz',      null, 'assembler',  false),
  ('insights',      'Insights',      null, 'insights@assembl.co.nz',      null, 'practice',   false),
  ('operations',    'Operations',    null, 'operations@assembl.co.nz',    null, 'forge',      false),
  ('knowledge',     'Knowledge',     null, 'knowledge@assembl.co.nz',     null, 'kaitiaki',   false)
on conflict (bundle_slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- Verify (run manually):
--   select bundle_slug, display_name, phone, email, chat_slug, live
--     from public.bundle_identity order by bundle_slug;
--   -- 6 rows, all live=false, all phone null until TNZ provisioning lands.
-- ─────────────────────────────────────────────────────────────────────────
