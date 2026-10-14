-- Explicit, private checklist snapshots. Empty snapshots retain their revision so
-- a stale device cannot resurrect a collection after its owner removes it.
create table public.do_personal_checklists (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  plans jsonb not null default '[]'::jsonb
    check (jsonb_typeof(plans) = 'array' and jsonb_array_length(plans) <= 30
      and octet_length(plans::text) <= 600000),
  revision integer not null check (revision > 0),
  updated_at timestamptz not null default now(),
  consented_at timestamptz not null default now()
);
alter table public.do_personal_checklists enable row level security;
revoke all on public.do_personal_checklists from anon, authenticated;
grant select on public.do_personal_checklists to authenticated;
grant all on public.do_personal_checklists to service_role;
create policy "Owners can read their checklist snapshot"
  on public.do_personal_checklists for select to authenticated
  using (owner_id = (select auth.uid()) and
    coalesce((select auth.jwt())->>'is_anonymous', 'false') <> 'true');

create or replace function public.do_personal_save_checklists(
  p_owner uuid, p_plans jsonb, p_expected_revision integer
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.do_personal_checklists; current_revision integer;
begin
  if p_owner is null or not exists (
    select 1 from auth.users where id = p_owner and not coalesce(is_anonymous, false)
  ) then raise exception 'checklist_owner_required'; end if;
  if p_plans is null or jsonb_typeof(p_plans) <> 'array'
     or p_expected_revision is null or p_expected_revision < 0
     or p_expected_revision >= 2000000000 then
    raise exception 'checklist_invalid_input';
  end if;
  -- Also serialises the first insert, for which there is no row to lock yet.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text, 9302026));
  select revision into current_revision from public.do_personal_checklists
    where owner_id = p_owner for update;
  if coalesce(current_revision, 0) <> p_expected_revision then
    raise exception 'checklist_conflict';
  end if;
  insert into public.do_personal_checklists(owner_id, plans, revision)
    values (p_owner, p_plans, p_expected_revision + 1)
  on conflict (owner_id) do update set plans = excluded.plans,
    revision = excluded.revision, updated_at = now(), consented_at = now()
  returning * into saved;
  return jsonb_build_object('plans', saved.plans, 'revision', saved.revision,
    'savedAt', saved.updated_at);
end;
$$;
revoke all on function public.do_personal_save_checklists(uuid, jsonb, integer) from public, anon, authenticated;
grant execute on function public.do_personal_save_checklists(uuid, jsonb, integer) to service_role;
