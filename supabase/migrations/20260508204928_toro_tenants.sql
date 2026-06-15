-- Tōro multi-tenant: tenants, tenant_members, tenant_invitations
-- Spec: outputs/TORO-MULTI-TENANT-CHATWOOT-ARCHITECTURE-2026-05-09.md (§2, §3, §10)
-- Idempotent: safe to re-run on a fresh project or one that's been partially applied.

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  plan text not null default 'family',
  chatwoot_account_id integer,
  chatwoot_inbox_ids integer[]
);

-- An earlier migration (20260331025828) created public.tenants without
-- created_by, so the `create table if not exists` above no-ops on a fresh
-- replay and the column is missing when the RLS policies below reference it.
-- Add it idempotently so the migration history replays cleanly. No-op on any
-- project that already has the column (e.g. production).
alter table public.tenants
  add column if not exists created_by uuid references auth.users(id);

create table if not exists public.tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists public.tenant_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('owner','admin','member')),
  invited_by uuid not null references auth.users(id),
  token text not null unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------------

create index if not exists tenants_slug_idx
  on public.tenants (slug);

create index if not exists tenant_members_user_id_idx
  on public.tenant_members (user_id);

create index if not exists tenant_members_tenant_id_idx
  on public.tenant_members (tenant_id);

create index if not exists tenant_invitations_token_idx
  on public.tenant_invitations (token);

create index if not exists tenant_invitations_email_idx
  on public.tenant_invitations (email);

-- ---------------------------------------------------------------------------
-- 3. Helper: is_tenant_member
-- ---------------------------------------------------------------------------

create or replace function public.is_tenant_member(_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_members
    where tenant_id = _tenant_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_tenant_admin(_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_members
    where tenant_id = _tenant_id
      and user_id = auth.uid()
      and role in ('owner','admin')
  );
$$;

create or replace function public.is_tenant_owner(_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_members
    where tenant_id = _tenant_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

-- ---------------------------------------------------------------------------
-- 4. Last-owner guard
-- Prevent UPDATE/DELETE that would leave a tenant with zero owners.
-- ---------------------------------------------------------------------------

create or replace function public.tenant_members_guard_last_owner()
returns trigger
language plpgsql
as $$
declare
  remaining_owners integer;
begin
  if tg_op = 'DELETE' then
    if old.role = 'owner' then
      select count(*) into remaining_owners
      from public.tenant_members
      where tenant_id = old.tenant_id
        and role = 'owner'
        and id <> old.id;
      if remaining_owners = 0 then
        raise exception 'cannot remove last owner of tenant %', old.tenant_id
          using errcode = 'check_violation';
      end if;
    end if;
    return old;
  elsif tg_op = 'UPDATE' then
    if old.role = 'owner' and new.role <> 'owner' then
      select count(*) into remaining_owners
      from public.tenant_members
      where tenant_id = old.tenant_id
        and role = 'owner'
        and id <> old.id;
      if remaining_owners = 0 then
        raise exception 'cannot demote last owner of tenant %', old.tenant_id
          using errcode = 'check_violation';
      end if;
    end if;
    return new;
  end if;
  return null;
end;
$$;

drop trigger if exists tenant_members_guard_last_owner_trg on public.tenant_members;
create trigger tenant_members_guard_last_owner_trg
  before update or delete on public.tenant_members
  for each row execute function public.tenant_members_guard_last_owner();

-- ---------------------------------------------------------------------------
-- 4b. Bootstrap owner on tenant creation
-- Automatically adds the tenant creator as owner, bypassing RLS.
-- ---------------------------------------------------------------------------

create or replace function public.tenant_bootstrap_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.tenant_members (tenant_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

drop trigger if exists tenant_bootstrap_owner_trg on public.tenants;
create trigger tenant_bootstrap_owner_trg
  after insert on public.tenants
  for each row execute function public.tenant_bootstrap_owner();

-- ---------------------------------------------------------------------------
-- 5. RLS
-- ---------------------------------------------------------------------------

alter table public.tenants            enable row level security;
alter table public.tenant_members     enable row level security;
alter table public.tenant_invitations enable row level security;

-- tenants ---------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenants'
      and policyname = 'tenants_select_members'
  ) then
    create policy tenants_select_members on public.tenants
      for select to authenticated
      using (public.is_tenant_member(id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenants'
      and policyname = 'tenants_insert_authed'
  ) then
    create policy tenants_insert_authed on public.tenants
      for insert to authenticated
      with check (auth.uid() is not null and created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenants'
      and policyname = 'tenants_update_admin'
  ) then
    create policy tenants_update_admin on public.tenants
      for update to authenticated
      using (public.is_tenant_admin(id))
      with check (public.is_tenant_admin(id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenants'
      and policyname = 'tenants_delete_owner'
  ) then
    create policy tenants_delete_owner on public.tenants
      for delete to authenticated
      using (public.is_tenant_owner(id));
  end if;
end $$;

-- tenant_members --------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_members'
      and policyname = 'tenant_members_select_members'
  ) then
    create policy tenant_members_select_members on public.tenant_members
      for select to authenticated
      using (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_members'
      and policyname = 'tenant_members_insert_admin'
  ) then
    create policy tenant_members_insert_admin on public.tenant_members
      for insert to authenticated
      with check (public.is_tenant_admin(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_members'
      and policyname = 'tenant_members_update_admin'
  ) then
    create policy tenant_members_update_admin on public.tenant_members
      for update to authenticated
      using (public.is_tenant_admin(tenant_id))
      with check (public.is_tenant_admin(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_members'
      and policyname = 'tenant_members_delete_admin'
  ) then
    create policy tenant_members_delete_admin on public.tenant_members
      for delete to authenticated
      using (public.is_tenant_admin(tenant_id));
  end if;
end $$;

-- tenant_invitations ----------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_invitations'
      and policyname = 'tenant_invitations_select_admin_or_invitee'
  ) then
    create policy tenant_invitations_select_admin_or_invitee on public.tenant_invitations
      for select to authenticated
      using (
        public.is_tenant_admin(tenant_id)
        or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_invitations'
      and policyname = 'tenant_invitations_insert_admin'
  ) then
    create policy tenant_invitations_insert_admin on public.tenant_invitations
      for insert to authenticated
      with check (
        public.is_tenant_admin(tenant_id)
        and invited_by = auth.uid()
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_invitations'
      and policyname = 'tenant_invitations_update_admin_or_invitee'
  ) then
    create policy tenant_invitations_update_admin_or_invitee on public.tenant_invitations
      for update to authenticated
      using (
        public.is_tenant_admin(tenant_id)
        or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      with check (
        public.is_tenant_admin(tenant_id)
        or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_invitations'
      and policyname = 'tenant_invitations_delete_admin'
  ) then
    create policy tenant_invitations_delete_admin on public.tenant_invitations
      for delete to authenticated
      using (public.is_tenant_admin(tenant_id));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Accept invitation function (SECURITY DEFINER)
-- Allows invited users to join a tenant by accepting their invitation.
-- ---------------------------------------------------------------------------

create or replace function public.accept_invitation(_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _invitation record;
  _user_email text;
  _new_member_id uuid;
begin
  -- Get the current user's email from JWT
  _user_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  
  if _user_email = '' then
    raise exception 'User email not found in JWT'
      using errcode = 'invalid_authorization_specification';
  end if;

  -- Find and validate the invitation
  select * into _invitation
  from public.tenant_invitations
  where token = _token;

  if not found then
    raise exception 'Invalid invitation token'
      using errcode = 'invalid_parameter_value';
  end if;

  if lower(_invitation.email) <> _user_email then
    raise exception 'Invitation email does not match your account'
      using errcode = 'invalid_authorization_specification';
  end if;

  if _invitation.accepted_at is not null then
    raise exception 'Invitation has already been accepted'
      using errcode = 'invalid_parameter_value';
  end if;

  if _invitation.expires_at < now() then
    raise exception 'Invitation has expired'
      using errcode = 'invalid_parameter_value';
  end if;

  -- Check if user is already a member of this tenant
  if exists (
    select 1 from public.tenant_members
    where tenant_id = _invitation.tenant_id
      and user_id = auth.uid()
  ) then
    raise exception 'You are already a member of this tenant'
      using errcode = 'unique_violation';
  end if;

  -- Insert the new member
  insert into public.tenant_members (tenant_id, user_id, role)
  values (_invitation.tenant_id, auth.uid(), _invitation.role)
  returning id into _new_member_id;

  -- Mark invitation as accepted
  update public.tenant_invitations
  set accepted_at = now()
  where id = _invitation.id;

  return _new_member_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.tenants            to authenticated;
grant select, insert, update, delete on public.tenant_members     to authenticated;
grant select, insert, update, delete on public.tenant_invitations to authenticated;
grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.is_tenant_admin(uuid)  to authenticated;
grant execute on function public.is_tenant_owner(uuid)  to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
