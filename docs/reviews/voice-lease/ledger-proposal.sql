-- REVIEW PROPOSAL ONLY. Not a migration; not applied. Deploy with feature OFF.
-- This ledger replaces legacy admission only after a NZ day boundary cutover.
create table public.do_voice_lease_ledgers (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  version bigint not null check (version > 0),
  state jsonb not null check (jsonb_typeof(state) = 'object' and octet_length(state::text) <= 1000000)
);
alter table public.do_voice_lease_ledgers enable row level security;
revoke all on public.do_voice_lease_ledgers from anon, authenticated;
grant select, insert, update on public.do_voice_lease_ledgers to service_role;
create function public.cas_do_voice_lease_ledger(p_owner uuid, p_version bigint, p_state jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  if p_version = 0 then
    insert into public.do_voice_lease_ledgers(owner_id, version, state) values(p_owner, 1, p_state)
      on conflict(owner_id) do nothing;
  else
    update public.do_voice_lease_ledgers set version = version + 1, state = p_state
      where owner_id = p_owner and version = p_version;
  end if;
  get diagnostics changed = row_count;
  return changed = 1;
end; $$;
revoke all on function public.cas_do_voice_lease_ledger(uuid,bigint,jsonb) from public, anon, authenticated;
grant execute on function public.cas_do_voice_lease_ledger(uuid,bigint,jsonb) to service_role;
