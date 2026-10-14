-- DO Bills: bank connection custody. PROPOSAL ONLY. Not a migration, not applied.
-- Review with docs/do-bills/PREEMPTIVE-BILLS.md step 3 before turning this into
-- supabase/migrations/. Kate applies; nothing here grants a live connection.
--
-- Design: one row per owner per provider connection. The browser never sees the token;
-- only a server-side function with the service role reads credential_ref, and only to
-- call the fixed read adapter. Account choice, expiry and revocation are explicit.

create table if not exists public.do_bank_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('redbark')),
  consumer text not null check (consumer in ('bills', 'money', 'business', 'tradie')),
  status text not null default 'pending' check (status in ('pending', 'connected', 'expired', 'revoked', 'error')),
  -- Provider account ids the person chose to share. Reads are refused for any other id.
  account_ids text[] not null default '{}' check (cardinality(account_ids) <= 24),
  -- Opaque reference into Supabase Vault (vault.secrets). Never the token itself.
  credential_ref uuid,
  scopes text[] not null default '{data:read}' check (scopes = '{data:read}'),
  consent_version text not null,
  consented_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_read_at timestamptz,
  last_error text check (char_length(last_error) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, provider, consumer)
);

comment on table public.do_bank_connections is 'Owner-bound, read-only bank connections for DO Bills. credential_ref points at Vault; the browser never receives it.';

alter table public.do_bank_connections enable row level security;

-- Owners may see their own connection state (never the credential reference) and revoke it.
create policy "owner reads own bank connection" on public.do_bank_connections
  for select to authenticated using (owner_id = auth.uid());
create policy "owner revokes own bank connection" on public.do_bank_connections
  for update to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and status = 'revoked' and revoked_at is not null);

-- Column-level: authenticated users never read credential_ref.
revoke select (credential_ref) on public.do_bank_connections from authenticated;

-- Service-only helpers. The read grant the adapter requires is derived here, never from the browser.
create or replace function public.do_bank_connection_grant(p_owner uuid, p_consumer text)
returns table (owner_id uuid, consumer text, account_ids text[], scopes text[], expires_at timestamptz, revoked_at timestamptz, credential_ref uuid)
language sql security definer set search_path = public as $$
  select owner_id, consumer, account_ids, scopes, expires_at, revoked_at, credential_ref
  from public.do_bank_connections
  where owner_id = p_owner and consumer = p_consumer and status = 'connected' and revoked_at is null and expires_at > now()
  limit 1
$$;
revoke all on function public.do_bank_connection_grant(uuid, text) from public, anon, authenticated;

-- Expiry sweep: run from the existing hourly personal cron. Marks lapsed connections; deletes nothing.
create or replace function public.do_bank_connections_expire()
returns integer language sql security definer set search_path = public as $$
  with lapsed as (
    update public.do_bank_connections set status = 'expired', updated_at = now()
    where status = 'connected' and expires_at <= now() returning 1
  ) select count(*)::integer from lapsed
$$;
revoke all on function public.do_bank_connections_expire() from public, anon, authenticated;

-- Open questions before applying:
-- 1. Redbark's actual authorisation model (hosted consent link vs OAuth) decides what credential_ref stores.
-- 2. Consent duration: proposal 90 days, renewed by the person, matching the adapter's expiry check.
-- 3. Whether revocation must also be sent to the provider (likely yes) and from which server function.
